import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';


const SECTIONS = [
    {
        id: 'floor',
        title: 'Floor Material',
        options: [
            { id: 'maru', name: '마루', img: '/assets/material_maru_wood_1766941753343.png' },
            { id: 'porcelain', name: 'Porcelain Tile', img: '/assets/material_porcelain_tile_1766941816674.png' },
            { id: 'epoxy', name: 'Epoxy(에폭시코팅)', img: '/assets/material_epoxy_coating_1766941788352.png' }
        ]
    },
    {
        id: 'wall',
        title: 'Wall Finish',
        options: [
            { id: 'wallpaper_silk', name: 'Silk Wallpaper (실크벽지)', img: '/assets/material_wallpaper_silk_1766941848724.png' },
            { id: 'wallpaper_paper', name: 'Wallpaper (합지)', img: '/assets/material_wallpaper_paper_1766941862809.png' },
            { id: 'paint', name: 'Paint', img: '/assets/material_paint_1766941891995.png' },
            { id: 'fresco', name: 'Plaster (Stucco)', img: '/assets/material_plaster_1766941907522.png' }
        ]
    },
    {
        id: 'ceiling',
        title: 'Ceiling Type',
        options: [
            { id: 'finished', name: '천정 마감', img: '/assets/material_ceiling_finished_1766941935503.png' },
            { id: 'exposed', name: '노출 천정', img: '/assets/material_ceiling_exposed_1766941949889.png' }
        ]
    }
];

export default function MaterialPage() {
    const navigate = useNavigate();
    const { materials, setMaterials, details, serviceType } = useEstimation();
    const [imageConfig, setImageConfig] = useState({});

    // Fetch dynamic project images
    // Fetch dynamic project images - Deprecated (Firebase Removal)
    /*
    useEffect(() => {
        const fetchConfig = async () => {
            if (!db) return;
            try {
                const docRef = doc(db, 'config', 'materialImages');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setImageConfig(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching material config:", error);
            }
        };
        fetchConfig();
    }, []);
    */

    // Kitchen Local State 
    // (We could put this in context or local, but context is better for summary)
    const handleKitchenChange = (key, value) => {
        setMaterials(prev => ({
            ...prev,
            kitchenSpecs: {
                ...prev.kitchenSpecs,
                [key]: value
            }
        }));
    };

    const handleSelect = (category, value) => {
        setMaterials(prev => ({ ...prev, [category]: value }));
    };

    const handleBathToggle = () => {
        setMaterials(prev => ({ ...prev, bath: !prev.bath }));
    };

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '4rem 0' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    fontSize: '2.5rem',
                    fontWeight: 300
                }}>
                    Materials & Details
                </h2>

                {/* Standard Sections: Floor, Wall, Ceiling */}
                {SECTIONS.map(section => (
                    <div key={section.id} style={{ marginBottom: '4rem' }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: 'var(--color-accent)',
                            borderLeft: '4px solid var(--color-accent)',
                            paddingLeft: '1rem'
                        }}>
                            {section.title}
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {section.options.map(opt => {
                                const isSelected = materials[section.id] === opt.id;
                                // Use dynamic image if available, else static
                                const displayImg = imageConfig[opt.id] || opt.img;

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(section.id, opt.id)}
                                        style={{
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid var(--color-accent)' : '2px solid transparent',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s',
                                            opacity: isSelected ? 1 : 0.6
                                        }}
                                    >
                                        <div style={{ height: '150px' }}>
                                            <img src={displayImg} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', textAlign: 'center' }}>
                                            <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Kitchen Special Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--color-accent)',
                        borderLeft: '4px solid var(--color-accent)',
                        paddingLeft: '1rem'
                    }}>
                        Kitchen Specifications
                    </h3>

                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid #444'
                    }}>
                        {serviceType === 'commercial' && (details.subType === 'restaurant' || details.subType === 'cafe') ? (
                            /* Commercial Kitchen (Area Input) */
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', color: '#ccc' }}>
                                    Kitchen Area (평): <span style={{ color: 'var(--color-accent)' }}>{materials.kitchenSpecs?.area || 0}평</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="주방 평수를 입력하세요"
                                    value={materials.kitchenSpecs?.area || ''}
                                    onChange={(e) => handleKitchenChange('area', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: '#333',
                                        border: '1px solid #555',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                                    * 식당/카페의 경우 주방 면적에 따라 별도 단가가 적용됩니다.
                                </p>
                            </div>
                        ) : (
                            /* Residential / Other Kitchen (Detailed Input) */
                            <>
                                {/* 1. Cabinet Width */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', color: '#ccc' }}>
                                        Cabinet Width (m): <span style={{ color: 'var(--color-accent)' }}>{materials.kitchenSpecs?.width || 3}m</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="2" max="6" step="0.5"
                                        value={materials.kitchenSpecs?.width || 3}
                                        onChange={(e) => handleKitchenChange('width', e.target.value)}
                                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                                    />
                                </div>

                                {/* 2. Top Material */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', color: '#ccc' }}>Countertop Material</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {['artificial_marble', 'laminate'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => handleKitchenChange('top', type)}
                                                style={{
                                                    flex: 1,
                                                    padding: '1rem',
                                                    background: (materials.kitchenSpecs?.top || 'artificial_marble') === type ? 'var(--color-accent)' : '#333',
                                                    color: (materials.kitchenSpecs?.top || 'artificial_marble') === type ? '#000' : '#888',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {type === 'artificial_marble' ? 'Artificial Marble (인조대리석)' : 'Laminate Panel (라미네이트)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Island Toggle */}
                                <div>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '1rem',
                                        background: materials.kitchenSpecs?.island ? 'rgba(212, 175, 55, 0.1)' : '#333',
                                        borderRadius: '8px',
                                        border: materials.kitchenSpecs?.island ? '1px solid var(--color-accent)' : '1px solid transparent'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={materials.kitchenSpecs?.island || false}
                                            onChange={(e) => handleKitchenChange('island', e.target.checked)}
                                            style={{ marginRight: '1rem', transform: 'scale(1.5)', accentColor: 'var(--color-accent)' }}
                                        />
                                        <span>Include Kitchen Island</span>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>
                </div>


                {/* Bath Toggle Special Section */}
                <div style={{ marginBottom: '4rem' }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--color-accent)',
                        borderLeft: '4px solid var(--color-accent)',
                        paddingLeft: '1rem'
                    }}>
                        Bathroom Renovation
                    </h3>
                    <div
                        onClick={handleBathToggle}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '1.5rem 2rem',
                            background: materials.bath ? 'rgba(212, 175, 55, 0.1)' : 'var(--color-bg-secondary)',
                            border: materials.bath ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            border: '2px solid #fff',
                            marginRight: '1rem',
                            background: materials.bath ? 'var(--color-accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {materials.bath && <span style={{ color: '#000', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '1.1rem' }}>화장실 리모델링 포함 (상세에서 개수 선택)</span>
                    </div>
                </div>

                {/* Residential Windows Option (Changho) */}
                {serviceType !== 'commercial' && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: 'var(--color-accent)',
                            borderLeft: '4px solid var(--color-accent)',
                            paddingLeft: '1rem'
                        }}>
                            Windows (Changho)
                        </h3>
                        <div
                            onClick={() => setMaterials(prev => ({ ...prev, windows: !prev.windows }))}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '1.5rem 2rem',
                                background: materials.windows ? 'rgba(212, 175, 55, 0.1)' : 'var(--color-bg-secondary)',
                                border: materials.windows ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                border: '2px solid #fff',
                                marginRight: '1rem',
                                background: materials.windows ? 'var(--color-accent)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {materials.windows && <span style={{ color: '#000', fontWeight: 'bold' }}>✓</span>}
                            </div>
                            <span style={{ fontSize: '1.1rem' }}>창호 교체 포함 (별도 견적)</span>
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button
                        onClick={() => navigate('/summary')}
                        style={{
                            padding: '1.2rem 4rem',
                            backgroundColor: 'var(--color-accent)',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#000'
                        }}
                    >
                        Calculate Estimate
                    </button>
                </div>
            </div>
        </Layout>
    );
}
