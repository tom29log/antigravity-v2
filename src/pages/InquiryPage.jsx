import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useEstimation } from '../contexts/EstimationContext';

export default function InquiryPage() {
    const navigate = useNavigate();
    const { serviceType, details, style, materials, estimate, selectedPlan } = useEstimation();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fallback
    useEffect(() => {
        if (!serviceType && !submitted) {
            navigate('/');
        }
    }, [serviceType, submitted, navigate]);

    // Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxV0VwGsLOGXynWf6R6cJGlt6EPMIj-_EWm7iLtRWOLoOsmc20btsk0XHtcfIorISUS/exec';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            serviceType,
            subType: details.subType,
            area: details.area,
            bathCount: details.bathCount || 0,
            style,
            materials,
            estimateStandard: estimate?.standard || 0,
            estimatePremium: estimate?.premium || 0,
            selectedPlan: selectedPlan || 'standard',
            status: 'new',
            timestamp: new Date().toISOString()
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify(payload)
            });

            console.log('Inquiry sent to Google Script');
            setSubmitted(true);
        } catch (error) {
            console.error("Submission failed", error);
            alert("전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
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
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            backgroundColor: isSubmitting ? '#555' : 'var(--color-accent)',
                            border: 'none',
                            color: isSubmitting ? '#aaa' : '#000',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {isSubmitting ? 'SENDING...' : 'SUBMIT REQUEST'}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
