import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';

export default function SummaryPage() {
    const navigate = useNavigate();
    const { serviceType, details, style, styleImageIndex, materials, setMaterials, estimate, setEstimate, setSelectedPlan } = useEstimation();
    const standardRef = React.useRef(null);

    // Scroll to Standard plan on mount
    React.useEffect(() => {
        if (standardRef.current) {
            setTimeout(() => {
                standardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, []);

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
        // Base Rates per Pyung (3.3m2)
        // Volume Discount Tier System
        // >= 30: -100k, >= 50: -150k, >= 70: -200k
        let discountPerPyung = 0;
        if (area >= 70) discountPerPyung = 200000;
        else if (area >= 50) discountPerPyung = 150000;
        else if (area >= 30) discountPerPyung = 100000;

        // New Base Prices (before discount)
        const ECONOMY_BASE = 1000000;
        const STANDARD_BASE = 1300000;
        const PREMIUM_BASE = 1600000;

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
        // For Residential:
        // Area < 25: 1 Bath included. Additional (+2.5M each).
        // Area >= 25: 2 Baths included. Additional (+2.5M each). If reduced to 1 (-2.5M discount).
        if (materials?.bath || serviceType === 'residential') {
            const bathCount = parseInt(details.bathCount || 1);

            if (serviceType === 'residential') {
                if (area >= 25) {
                    // Standard is 2
                    if (bathCount > 2) {
                        adds += ((bathCount - 2) * 2500000);
                    } else if (bathCount === 1) {
                        discount += 2500000;
                    }
                } else {
                    // Standard is 1
                    if (bathCount > 1) {
                        adds += ((bathCount - 1) * 2500000);
                    }
                }
            } else {
                // Commercial or others (default logic if any)
                if (bathCount > 1) {
                    adds += ((bathCount - 1) * 2500000);
                }
            }
        }

        // 1.5 Wall Paper Special Logic
        if (materials?.wall === 'wallpaper_silk') {
            adds += (area * 100000);
        }

        // 1.8 Ceiling Finish Special Logic
        if (materials?.ceiling === 'finished') {
            adds += (area * 150000);
        }

        // 2. Kitchen Calculation
        // Commercial (Restaurant/Cafe): Area-based
        // Residential: Feature-based (Width, Island, Top)
        if (materials?.kitchenSpecs) {
            const { width, island, top, area: kArea } = materials.kitchenSpecs;

            if (serviceType === 'commercial' && (details.subType === 'restaurant' || details.subType === 'cafe')) {
                // Commercial Logic
                // 1 Pyung is included (Free). Excess area adds +2.0M per pyung.
                const kAreaNum = parseFloat(kArea || 0);

                if (kAreaNum > 1) {
                    const excessArea = kAreaNum - 1;
                    adds += (excessArea * 2000000);
                }
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
            if (kAreaNum > 1) {
                premiumKitchenAdd = (kAreaNum - 1) * 1000000;
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

        // Deco Tile Logic
        // Economy: Deco Tile is default. Others (Maru, Tile, Epoxy) -> +60,000 KRW/pyung
        // Standard/Premium: Maru is default (included).
        let economyFloorSurcharge = 0;
        if (materials?.floor !== 'tile_deco') {
            economyFloorSurcharge = (area * 60000);
        }

        // Demolition Calculation
        if (materials?.demolition?.isSelected) {
            const demolitionArea = parseFloat(materials.demolition.area || 0);
            adds += (demolitionArea * 90000);
        }

        const economyTotal = (area * (ECONOMY_BASE - discountPerPyung) * typeMultiplier) + adds - discount + economyFloorSurcharge;
        const standardTotal = (area * (STANDARD_BASE - discountPerPyung) * typeMultiplier) + adds - discount;
        const premiumTotal = (area * (PREMIUM_BASE - discountPerPyung) * typeMultiplier) + adds + premiumKitchenAdd - discount;

        setEstimate({
            economy: economyTotal,
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
        const widthVal = width || 3;
        const topText = top === 'artificial_marble' ? 'Marble Top' : 'Laminate Top';
        const islandText = island ? ', Island Included' : '';
        return `Width: ${widthVal}m, ${topText}${islandText}`;
    };

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '4rem 0' }}>
                <h2 ref={standardRef} style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem', scrollMarginTop: '120px' }}>Summary(선택요약)</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
                    스크롤해서 플랜선택
                </p>

                {/* Project Details */}
                <div style={{
                    background: 'var(--color-accent)',
                    padding: '2rem',
                    borderRadius: '0px',
                    marginBottom: '2rem',
                    border: 'none',
                    color: '#000'
                }}>
                    <h3 style={{ marginBottom: '1rem', color: '#000', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1.1rem' }}>
                        <div><span style={{ color: '#000' }}>Type:</span> {getLocalizedType(serviceType)} ({details.subType})</div>
                        <div><span style={{ color: '#000' }}>Area:</span> {details.area} 평 (Pyung)</div>
                        <div>
                            <span style={{ color: '#000' }}>Style:</span> {style}
                            {styleImageIndex && (
                                <span style={{ color: '#fff', fontWeight: 'bold' }}> (Ref Image #{styleImageIndex})</span>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.2)' }}>
                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: '#000' }}>Selected Materials(선택된 재료)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '1.05rem' }}>
                            <div><span style={{ color: '#000' }}>Floor:</span> {materials?.floor === 'maru' ? 'wood(마루)' : (materials?.floor === 'tile_deco' ? '데코타일or장판' : materials?.floor)}</div>
                            <div><span style={{ color: '#000' }}>Wall:</span> {materials?.wall === 'wallpaper_silk' ? 'Silk Wallpaper (실크벽지)' : (materials?.wall === 'wallpaper_paper' ? 'Wallpaper (합지)' : materials?.wall)}</div>
                            <div><span style={{ color: '#000' }}>Ceiling:</span> {materials?.ceiling === 'finished' ? '천정 마감 (Finished)' : (materials?.ceiling === 'none' ? '무선택 (유지)' : '노출 천정')}</div>
                            <div><span style={{ color: '#000' }}>Bath:</span> {(materials?.bath || serviceType === 'residential') ? `${details.bathCount || 1} Bathrooms` : 'None'}</div>

                            {/* Demolition Row - Always Visible */}
                            <div>
                                <span style={{ color: '#000' }}>Demolition(철거):</span> {materials?.demolition?.isSelected ?
                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{materials.demolition.area} 평 (Included)</span> :
                                    '미포함 (Excluded)'}
                            </div>

                            {materials?.windows && (
                                <div><span style={{ color: '#000' }}>Windows:</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>별도 견적 (Separate Estimate)</span></div>
                            )}

                            <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ color: '#000' }}>Kitchen:</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>{getKitchenSummary()}</span>
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
                    {/* Economy Plan */}
                    <div style={{
                        background: '#1a1a1a',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #444',
                        position: 'relative'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Economy Plan (실속형)</h3>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>저예산시 추천</p>

                        <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#aaa', lineHeight: '1.8' }}>
                            <li>✓ 바닥마감재(데코타일or장판)</li>
                            <li>✓ 일반 보급형 자재로 가성비 최우선</li>
                            <li>✓ 기본 조명</li>
                            <li>✓ 1년 무상 A/S 보증</li>
                            <li>✓ 평당 100만원 ~</li>
                        </ul>

                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(estimate.economy)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>Estimated Total</div>

                        <button
                            onClick={() => {
                                setMaterials(prev => ({
                                    ...prev,
                                    floor: '데코타일or장판(선택고정)',
                                    ceiling: '천정마감은 현재상태유지'
                                }));
                                setSelectedPlan('economy');
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
                    {/* Standard Plan */}
                    <div style={{
                        background: '#222',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #fff',
                        position: 'relative'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Standard Plan</h3>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Cost-effective smart interior.</p>

                        <ul style={{ listStyle: 'none', marginBottom: '2rem', color: '#aaa', lineHeight: '1.8' }}>
                            <li>✓ 가성비 마감재로 깔끔한 마감</li>
                            <li>✓ 기본 조명 & 전기내선시공</li>
                            <li>✓ floor재질 업그레이드!(마루/타일/에폭시)</li>
                            <li>✓ 1년 무상 A/S 보증</li>
                            <li>✓ 평당 130만원 ~</li>
                        </ul>

                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                            {formatCurrency(estimate.standard)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>Estimated Total</div>

                        <button
                            onClick={() => {
                                // Auto-upgrade floor to Maru for Standard if current is Deco Tile
                                // Keep Porcelain or Epoxy if selected
                                setMaterials(prev => ({
                                    ...prev,
                                    floor: (prev.floor === 'tile_deco') ? 'maru' : prev.floor
                                }));
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
                            <li>✓ Wall Finish 업그레이드(실크벽지or유럽미장)</li>
                            <li>✓ 맞춤 가구 및 디자인</li>
                            <li>✓ floor재질 업그레이드!(마루/타일/에폭시)</li>
                            <li>✓ 1년 무상 A/S 보증</li>
                            <li>✓ 평당 160만원 ~</li>
                        </ul>

                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                            {formatCurrency(estimate.premium)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem' }}>Estimated Total</div>

                        <button
                            onClick={() => {
                                // Auto-upgrade floor to Maru if Deco Tile, otherwise keep selection
                                // Auto-upgrade Wall to Silk Wallpaper if not Fresco/Plaster
                                setMaterials(prev => ({
                                    ...prev,
                                    floor: (prev.floor === 'tile_deco') ? 'maru' : prev.floor,
                                    wall: (prev.wall === 'fresco') ? 'fresco' : 'wallpaper_silk'
                                }));
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
