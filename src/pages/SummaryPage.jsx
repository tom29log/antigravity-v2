import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';

export default function SummaryPage() {
    const navigate = useNavigate();
    const { serviceType, details, style, styleImageIndex, materials, estimate, setEstimate, setSelectedPlan } = useEstimation();

    // Helper for localization (Moved out of useEffect)
    const getLocalizedType = (type) => {
        if (type === 'commercial') return '상업 공간';
        if (type === 'residential') return '주거 공간';
        return type;
    };

    // Price Calculation Logic
    useEffect(() => {
        if (!details.area) return;

        const area = parseInt(details.area);



        // Base Rates per Pyung (3.3m2)
        // Volume Discount: If area >= 60, reduce base rate
        const isLargeVolume = area >= 60;
        const STANDARD_BASE = isLargeVolume ? 1400000 : 1500000;
        const PREMIUM_BASE = isLargeVolume ? 1900000 : 2000000;

        // Type adjustments (Percent based)
        let typeMultiplier = 1.0;
        if (serviceType === 'commercial') {
            if (details.subType === 'cafe' || details.subType === 'restaurant') typeMultiplier = 1.005; // Reduced from 1.2 to 0.5% surcharge
            if (details.subType === 'office') typeMultiplier = 0.9;
        } else {
            if (details.subType === 'apartment') typeMultiplier = 1.0;
        }

        let adds = 0;

        // 1. Bath Calculation (Count * Unit Price)
        // First bath is free (included in base), additional ones are 2.5M
        if (materials?.bath) {
            const bathCount = parseInt(details.bathCount || 1);
            if (bathCount > 1) {
                adds += ((bathCount - 1) * 2500000);
            }
        }

        // 1.5 Wall Paper Special Logic
        if (materials?.wall === 'wallpaper_silk') {
            adds += (area * 100000);
        }

        // 2. Kitchen Calculation
        // Commercial (Restaurant/Cafe): Area-based
        // Residential: Feature-based (Width, Island, Top)
        if (materials?.kitchenSpecs) {
            const { width, island, top, area: kArea } = materials.kitchenSpecs;

            if (serviceType === 'commercial' && (details.subType === 'restaurant' || details.subType === 'cafe')) {
                // Commercial Logic
                const kAreaNum = parseFloat(kArea || 0);

                // Only apply specific kitchen cost if area >= 2 pyung
                if (kAreaNum >= 2) {
                    // Placeholder Unit Costs: Standard 2.5M, Premium 3.5M (Handled in total sum additions)
                    const stdUnit = 2500000;
                    // const prmUnit = 3500000;

                    // We add to 'adds' which is common
                    adds += (kAreaNum * stdUnit);
                }

                // We will add the premium diff (1.0M per pyung) in the final calculation line
            } else {
                // Residential / Other Logic
                const w = parseFloat(width || 3);
                if (w > 3) adds += (w - 3) * 1000000;
                if (island) adds += 2000000;
                if (top === 'artificial_marble') adds += 1000000;
            }
        }

        // Calculate Totals
        // Premium Diff for Kitchen Area: (3.5M - 2.5M) = 1M extra per kitchen pyung
        let premiumKitchenAdd = 0;
        if (serviceType === 'commercial' && (details.subType === 'restaurant' || details.subType === 'cafe')) {
            const kAreaNum = parseFloat(materials.kitchenSpecs?.area || 0);
            // Also apply premium diff only if area >= 2? usually premium diff applies to total area but requirement says kitchen surcharge applies >=2.
            // Assuming cost applies only if >= 2.
            if (kAreaNum >= 2) {
                premiumKitchenAdd = kAreaNum * 1000000;
            }
        }

        let discount = 0;
        if (serviceType === 'commercial') {
            const kAreaNum = parseFloat(materials.kitchenSpecs?.area || 0);
            const bathCount = parseInt(details.bathCount || 0);

            // Discount if NO Kitchen (area 0)
            if (kAreaNum === 0) {
                discount += 2000000;
            }

            // Discount if NO Bath (count 0)
            if (!materials?.bath || bathCount === 0) {
                // If materials.bath is false, count is effectively 0.
                discount += 2000000;
            }
        }

        const standardTotal = (area * STANDARD_BASE * typeMultiplier) + adds - discount;
        const premiumTotal = (area * PREMIUM_BASE * typeMultiplier) + adds + (area * 300000) + premiumKitchenAdd - discount;

        setEstimate({
            standard: standardTotal,
            premium: premiumTotal
        });

    }, [serviceType, details, style, materials, setEstimate]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(val);
    };

    if (!serviceType) {
        setTimeout(() => navigate('/'), 0);
        return null;
    }

    // Helper to render Kitchen spec text
    const getKitchenSummary = () => {
        if (!materials?.kitchenSpecs) return 'Standard';

        if (serviceType === 'commercial' && (details.subType === 'restaurant' || details.subType === 'cafe')) {
            return `Kitchen Area: ${materials.kitchenSpecs.area || 0} 평`;
        }

        const { width, island, top } = materials.kitchenSpecs;
        const topText = top === 'artificial_marble' ? 'Marble Top' : 'Laminate Top';
        const islandText = island ? ', Island Included' : '';
        return `Width: ${width}m, ${topText}${islandText}`;
    };

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '4rem 0' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Estimation Summary</h2>

                {/* Project Details */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    padding: '2rem',
                    borderRadius: '0px',
                    marginBottom: '2rem',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ marginBottom: '1rem', color: '#888', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div><span style={{ color: '#666' }}>Type:</span> {getLocalizedType(serviceType)} ({details.subType})</div>
                        <div><span style={{ color: '#666' }}>Area:</span> {details.area} 평 (Pyung)</div>
                        <div>
                            <span style={{ color: '#666' }}>Style:</span> {style}
                            {styleImageIndex && (
                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}> (Ref Image #{styleImageIndex})</span>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#888' }}>Selected Materials</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <div><span style={{ color: '#666' }}>Floor:</span> {materials?.floor === 'maru' ? '마루' : materials?.floor}</div>
                            <div><span style={{ color: '#666' }}>Wall:</span> {materials?.wall === 'wallpaper_silk' ? 'Silk Wallpaper (실크벽지)' : (materials?.wall === 'wallpaper_paper' ? 'Wallpaper (합지)' : materials?.wall)}</div>
                            <div><span style={{ color: '#666' }}>Ceiling:</span> {materials?.ceiling === 'exposed' ? '노출 천정' : (materials?.ceiling === 'finished' ? '천정 마감' : materials?.ceiling)}</div>
                            <div><span style={{ color: '#666' }}>Bath:</span> {materials?.bath ? `${details.bathCount || 1} Bathrooms` : 'None'}</div>
                            {materials?.windows && (
                                <div style={{ color: 'var(--color-accent)' }}><span style={{ color: '#666' }}>Windows:</span> 별도 견적 (Separate Estimate)</div>
                            )}
                            <div style={{ gridColumn: '1 / -1', color: 'var(--color-accent)' }}>
                                <span style={{ color: '#666' }}>Kitchen:</span> {getKitchenSummary()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dual Estimates */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {/* Standard Plan */}
                    <div style={{
                        background: '#222',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #444',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: '#888' }}></div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Standard Plan</h3>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Cost-effective smart interior.</p>

                        <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#aaa', lineHeight: '1.8' }}>
                            <li>✓ 기본 마감재 (가성비)</li>
                            <li>✓ 기본 조명 시공</li>
                            <li>✓ 2주 하자 보수 보증</li>
                            <li>✓ 평당 150만원 ~</li>
                        </ul>

                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(estimate.standard)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>Estimated Total</div>

                        <button
                            onClick={() => {
                                setSelectedPlan('standard');
                                navigate('/inquiry');
                            }}
                            style={{
                                width: '100%',
                                background: '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                textAlign: 'center',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#444';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#333';
                            }}
                        >
                            이 견적으로 문의하기
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div style={{
                        background: 'linear-gradient(145deg, #1f1f1f, #2a2a2a)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid var(--color-accent)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        position: 'relative',
                        transform: 'scale(1.02)'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-12px', right: '2rem',
                            background: 'var(--color-accent)', color: '#000',
                            padding: '0.2rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem'
                        }}>
                            RECOMMENDED
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>Premium Plan</h3>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>High-end finishes & detailed design.</p>

                        <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#ddd', lineHeight: '1.8' }}>
                            <li>✓ 프리미엄 수입 마감재</li>
                            <li>✓ 맞춤 가구 및 디자인</li>
                            <li>✓ 1년 무상 A/S 보증</li>
                            <li>✓ 평당 200만원 ~</li>
                        </ul>

                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                            {formatCurrency(estimate.premium)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem' }}>Estimated Total</div>

                        <button
                            onClick={() => {
                                setSelectedPlan('premium');
                                navigate('/inquiry');
                            }}
                            style={{
                                width: '100%',
                                background: 'var(--color-accent)',
                                color: '#000',
                                border: 'none',
                                textAlign: 'center',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1.1rem'
                            }}
                        >
                            이 견적으로 문의하기
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
