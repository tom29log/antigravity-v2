import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';

const InputGroup = ({ label, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>{label}</label>
        {children}
    </div>
);

const StyledInput = (props) => (
    <input {...props} style={{
        width: '100%',
        padding: '1rem',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
    }} />
);

const StyledSelect = (props) => (
    <select {...props} style={{
        width: '100%',
        padding: '1rem',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        appearance: 'none'
    }} />
);

const StyledCheckbox = ({ label, checked, onChange }) => (
    <label style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '1rem',
        background: checked ? 'rgba(212, 175, 55, 0.1)' : 'var(--color-bg-secondary)',
        border: checked ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        borderRadius: '8px',
        transition: 'all 0.2s'
    }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            style={{ marginRight: '10px', accentColor: 'var(--color-accent)' }}
        />
        <span style={{ color: checked ? 'var(--color-accent)' : '#fff' }}>{label}</span>
    </label>
);

export default function DetailsPage() {
    const navigate = useNavigate();
    const { serviceType, details, setDetails } = useEstimation();
    const [localDetails, setLocalDetails] = useState(details);

    const handleSubmit = (e) => {
        e.preventDefault();
        setDetails(localDetails);
        navigate('/style');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        // Auto-update bath count logic
        let newDetails = { ...localDetails, [name]: newValue };

        // Handle number conversions
        if (name === 'area') {
            const areaNum = parseInt(newValue) || 0;
            newDetails.area = newValue; // Keep string for input display

            if (serviceType === 'residential') {
                // Only auto-update if user hasn't manually set the bath count
                if (!localDetails.bathCountManuallyChanged) {
                    if (areaNum >= 25) {
                        newDetails.bathCount = 2;
                    } else {
                        newDetails.bathCount = 1;
                    }
                }
            }
        }

        // Mark bathCount as manually changed if user touches it
        if (name === 'bathCount') {
            newDetails.bathCount = parseInt(newValue); // Ensure number type
            newDetails.bathCountManuallyChanged = true;
        }

        setLocalDetails(newDetails);
    };

    if (!serviceType) {
        // Redirect if no type selected
        setTimeout(() => navigate('/type'), 0);
        return null;
    }

    return (
        <Layout>
            <div className="container" style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 0',
                animation: 'fadeIn 1.5s ease-out forwards',
                opacity: 0 // Start invisible
            }}>
                <div style={{ width: '100%', maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                        {serviceType === 'commercial' ? '상업 공간' : '주거 공간'} 상세 정보
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {serviceType === 'commercial' ? (
                            <>
                                <InputGroup label="업종 종류">
                                    <StyledSelect name="subType" required value={localDetails.subType || ''} onChange={handleChange}>
                                        <option value="">선택해주세요</option>
                                        <option value="cafe">카페</option>
                                        <option value="office">사무실/오피스</option>
                                        <option value="store">매장/쇼룸</option>
                                        <option value="beauty">미용/뷰티샵</option>
                                        <option value="restaurant">식당</option>
                                        <option value="other">기타</option>
                                    </StyledSelect>
                                </InputGroup>
                            </>
                        ) : (
                            <>
                                <InputGroup label="주거 형태">
                                    <StyledSelect name="subType" required value={localDetails.subType || ''} onChange={handleChange}>
                                        <option value="">선택해주세요</option>
                                        <option value="apartment">아파트</option>
                                        <option value="house">단독주택</option>
                                        <option value="villa">빌라/연립</option>
                                        <option value="officetel">오피스텔</option>
                                    </StyledSelect>
                                </InputGroup>
                            </>
                        )}

                        <InputGroup label="평수 (숫자만 입력)">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <StyledInput
                                    type="number"
                                    name="area"
                                    placeholder="예: 32"
                                    required
                                    value={localDetails.area || ''}
                                    onChange={handleChange}
                                />
                                <span style={{ marginLeft: '10px', color: '#fff' }}>평</span>
                            </div>
                        </InputGroup>

                        {serviceType === 'residential' && (
                            <>
                                <InputGroup label="화장실 개수 (공사 예정)">
                                    <StyledSelect
                                        name="bathCount"
                                        value={localDetails.bathCount || '1'}
                                        onChange={handleChange}
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num} 개</option>
                                        ))}
                                    </StyledSelect>
                                </InputGroup>

                                <InputGroup label="추가 옵션">
                                    <StyledCheckbox
                                        label="베란다 확장 포함"
                                        checked={localDetails.veranda || false}
                                        onChange={(e) => handleChange({ ...e, target: { name: 'veranda', type: 'checkbox', checked: e.target.checked } })}
                                    />
                                </InputGroup>
                            </>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                backgroundColor: 'var(--color-accent)',
                                color: '#000',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                marginTop: '1rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            다음 단계로
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
