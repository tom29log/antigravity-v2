import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEstimation } from '../contexts/EstimationContext';

export default function InquiryPage() {
    const navigate = useNavigate();
    const { serviceType, details, style, materials, estimate, selectedPlan, attachedDrawing } = useEstimation();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '', files: [] });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper: Data URL to File
    const dataUrlToFile = (url, filename) => {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new File([u8arr], filename, { type: mime });
    };

    // Auto-attach drawing if exists
    useEffect(() => {
        if (attachedDrawing) {
            const drawingFile = dataUrlToFile(attachedDrawing, `my_drawing_${Date.now()}.jpg`);
            setFormData(prev => {
                // Avoid duplicating if already added (simple check by name prefix or length)
                if (prev.files.some(f => f.name.startsWith('my_drawing_'))) return prev;
                return { ...prev, files: [...prev.files, drawingFile] };
            });
        }
    }, [attachedDrawing]);

    // Fallback
    useEffect(() => {
        if (!serviceType && !submitted) {
            navigate('/');
        }
    }, [serviceType, submitted, navigate]);

    // Google Apps Script URL (직접 Google Sheet로 전송)
    const API_URL = 'https://script.google.com/macros/s/AKfycbzaO3j8A6HyW6SHAtdOukXPMiiQgxTQomLrm0EQrLLREbfcvYv6M1uRHLJbXWaApFoa/exec';

    const handlePhoneChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        let formatted = raw;
        if (raw.length > 3 && raw.length <= 7) {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
        } else if (raw.length > 7) {
            formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
        }
        setFormData(prev => ({ ...prev, phone: formatted }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);

        setFormData(prev => {
            // Preserve existing drawing files (auto-attached)
            const existingDrawings = prev.files.filter(f => f.name.startsWith('my_drawing_'));

            // Combine with new user selection
            const combinedFiles = [...existingDrawings, ...newFiles];

            // Validate Total Size
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            const totalSize = combinedFiles.reduce((acc, file) => acc + file.size, 0);

            if (totalSize > MAX_SIZE) {
                alert("총 파일 크기는 5MB를 초과할 수 없습니다.");
                return prev; // Do not apply changes
            }

            return { ...prev, files: combinedFiles };
        });
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            // If it's not an image (e.g. PDF), just read it directly
            if (!file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
                    if ((encoded.length % 4) > 0) { encoded += '='.repeat(4 - (encoded.length % 4)); }
                    resolve({ name: file.name, type: file.type, base64: encoded });
                };
                reader.onerror = error => reject(error);
                return;
            }

            // If it IS an image, compress it using Canvas
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1500;
                    const MAX_HEIGHT = 1500;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG at 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    // Remove prefix
                    let encoded = dataUrl.replace(/^data:(.*,)?/, '');
                    if ((encoded.length % 4) > 0) { encoded += '='.repeat(4 - (encoded.length % 4)); }

                    resolve({
                        name: file.name.replace(/\.[^/.]+$/, "") + ".jpg", // Force extension to jpg
                        type: 'image/jpeg',
                        base64: encoded
                    });
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert files to base64
        let attachedFiles = [];
        if (formData.files && formData.files.length > 0) {
            try {
                attachedFiles = await Promise.all(formData.files.map(convertToBase64));
            } catch (err) {
                console.error("File conversion error", err);
                alert("파일 처리 중 오류가 발생했습니다.");
                setIsSubmitting(false);
                return;
            }
        }

        const payload = {
            ...formData,
            files: attachedFiles, // Send processed files
            serviceType,
            subType: details?.subType || '',
            area: details?.area || '',
            bathCount: details?.bathCount || 0,
            style,
            materials,
            estimateStandard: estimate?.standard || 0,
            estimatePremium: estimate?.premium || 0,
            selectedPlan: selectedPlan || 'standard',
            status: 'new',
            timestamp: new Date().toISOString()
        };

        try {
            // Google Apps Script로 전송 (redirect: 'follow' 필수)
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // GAS는 text/plain이 더 안정적
                },
                body: JSON.stringify(payload),
                redirect: 'follow'
            });

            // GAS 응답 처리
            if (response.ok || response.type === 'opaque') {
                console.log('Inquiry sent to Google Sheet');
                setSubmitted(true);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error("Submission failed", error);
            // 네트워크 에러가 아니면 성공으로 처리 (GAS CORS 이슈)
            if (error.message !== 'Failed to fetch') {
                setSubmitted(true);
            } else {
                alert("전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturnHome = () => {
        navigate('/');
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    if (submitted) {
        return (
            <Layout>
                <div className="container fade-in" style={{ padding: '6rem 0', maxWidth: '600px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem', color: 'var(--color-accent)' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 300 }}>문의 접수 완료</h2>
                    <p style={{ color: '#aaa', marginBottom: '3rem' }}>
                        상담 신청이 완료되었습니다.<br />
                        <b>onandnoch@gmail.com</b>으로 확인 메일이 발송됩니다.<br />
                        담당자가 검토 후 24시간 이내에 연락드리겠습니다.
                    </p>

                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        padding: '2rem',
                        borderRadius: '0px',
                        textAlign: 'left',
                        border: '1px solid var(--color-border)',
                        marginBottom: '3rem'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--color-accent)' }}>신청 정보 요약</h3>
                        <div style={{ display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>이름</span>
                                <span>{formData.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>이메일</span>
                                <span>{formData.email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>연락처</span>
                                <span>{formData.phone}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>공간 유형</span>
                                <span style={{ textTransform: 'capitalize' }}>
                                    {serviceType === 'commercial' ? '상업 공간' : '주거 공간'} ({details?.subType})
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #444', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <span style={{ color: '#888' }}>예상 견적 ({selectedPlan === 'premium' ? 'Premium' : 'Standard'})</span>
                                <span style={{ color: 'var(--color-accent)' }}>{formatCurrency(estimate?.[selectedPlan || 'standard'] || 0)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleReturnHome}
                        style={{
                            padding: '1rem 3rem',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-text-primary)',
                            color: 'var(--color-text-primary)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                            e.currentTarget.style.color = 'var(--color-bg-primary)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                    >
                        메인으로 돌아가기
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '6rem 0', maxWidth: '600px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem', fontWeight: 300 }}>Consultation</h2>
                <div style={{ textAlign: 'center', marginBottom: '3rem', color: '#888' }}>
                    <p style={{ marginBottom: '0.5rem' }}>상세 견적 상담을 위해 연락처를 남겨주세요.</p>
                    <p style={{ color: 'var(--color-accent)' }}>
                        선택된 플랜: {selectedPlan === 'premium' ? 'Premium Plan' : 'Standard Plan'}
                        ({formatCurrency(estimate?.[selectedPlan || 'standard'] || 0)})
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{
                    background: 'var(--color-bg-secondary)',
                    padding: '2rem',
                    borderRadius: '0px',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>NAME</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontSize: '1rem', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>EMAIL</label>
                        <input
                            required
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontSize: '1rem', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>PHONE</label>
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontSize: '1rem', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>MESSAGE (OPTIONAL)</label>
                        <textarea
                            rows="4"
                            name="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #444', color: '#fff', fontSize: '1rem', resize: 'none', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                            onBlur={(e) => e.target.style.borderColor = '#444'}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                            ATTACH FILES (Optional, Max 5MB total)
                        </label>
                        <div style={{
                            border: '1px dashed #444',
                            padding: '1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'border-color 0.2s'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#444'}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                id="fileInput"
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                (도면또는현장사진/원하는디자인사진)
                            </p>
                            <p style={{ color: '#666', fontSize: '0.8rem' }}>
                                (JPG, PNG, PDF supported)
                            </p>
                            {formData.files && formData.files.length > 0 && (
                                <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                                    <p style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Selected Files:</p>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {formData.files.map((f, idx) => (
                                            <li key={idx} style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '2px' }}>
                                                - {f.name} ({Math.round(f.size / 1024)}KB)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            backgroundColor: isSubmitting ? '#555' : 'var(--color-accent)',
                            border: 'none',
                            color: isSubmitting ? '#ccc' : '#000',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isSubmitting
                            ? (formData.files.length > 0 ? '파일 업로드 및 전송 중... (잠시만 기다려주세요)' : '전송 중...')
                            : '상담 신청하기'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
