import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';
import { GoogleSheetService, GOOGLE_SHEET_URLS } from '../services/GoogleSheetService';


const STYLES = [
    {
        id: 'modern',
        name: 'Modern Minimal',
        image: '/assets/style_modern_minimal_1766941665061.png'
    },
    {
        id: 'nordic',
        name: 'Nordic & French Modern',
        image: '/assets/style_nordic_french_1766941737334.png'
    },
    {
        id: 'classic',
        name: 'Classic Luxury',
        image: '/assets/style_classic_luxury_1766941681196.png'
    },
    {
        id: 'vintage',
        name: 'Vintage Industrial',
        image: '/assets/style_vintage_industrial_1766941700000.png'
    }
];

export default function StylePage() {
    const navigate = useNavigate();
    const { setStyle, setStyleImageIndex } = useEstimation();

    // Modal State
    const [selectedStyle, setSelectedStyle] = useState(null);
    const [selectedImageIdx, setSelectedImageIdx] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Aesthetic Data from Google Sheet
    const [aestheticData, setAestheticData] = useState({});

    // Fetch Aesthetic Reference Images
    useEffect(() => {
        const fetchAesthetics = async () => {
            try {
                // IMPORTANT: If URL is placeholder, simple catch will trigger. 
                // We should handle the case where fetching fails nicely (e.g. empty images).
                const rawData = await GoogleSheetService.fetchCSV(GOOGLE_SHEET_URLS.AESTHETICS);
                const mappedData = GoogleSheetService.mapAesthetics(rawData);

                // Convert array to object keyed by ID: { modern: [img1, img2...], nordic: [...] }
                const dataObj = {};
                mappedData.forEach(item => {
                    if (item.id) {
                        dataObj[item.id.toLowerCase()] = item.images;
                    }
                });
                setAestheticData(dataObj);
            } catch (error) {
                console.warn("Could not fetch aesthetic reference images (likely URL not set yet).");
            }
        };
        fetchAesthetics();
    }, []);


    const handleCardClick = (style) => {
        setSelectedStyle(style);
        setSelectedImageIdx(null);
        setIsModalOpen(true);
    };

    const handleConfirmSelection = () => {
        if (selectedStyle) {
            setStyle(selectedStyle.id);
            // Save selected image index (1-based for display)
            if (selectedImageIdx !== null) {
                setStyleImageIndex(selectedImageIdx + 1);
            } else {
                setStyleImageIndex(null);
            }
            navigate('/materials');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStyle(null);
        setSelectedImageIdx(null);
    };

    // Get reference images for the currently selected style
    const currentRefImages = selectedStyle ? (aestheticData[selectedStyle.id] || []) : [];

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '6rem 0' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    fontSize: '2.5rem',
                    fontWeight: 300
                }}>
                    Select Your Aesthetic
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {STYLES.map((style) => (
                        <div
                            key={style.id}
                            onClick={() => handleCardClick(style)}
                            style={{
                                position: 'relative',
                                height: '500px',
                                borderRadius: '0px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
                                e.currentTarget.querySelector('.overlay').style.backgroundColor = 'rgba(0,0,0,0.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                                e.currentTarget.querySelector('.overlay').style.backgroundColor = 'rgba(0,0,0,0.4)';
                            }}
                        >
                            <img
                                src={style.image}
                                alt={style.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s ease'
                                }}
                            />
                            <div
                                className="overlay"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background-color 0.3s'
                                }}
                            >
                                <h3 style={{
                                    color: '#fff',
                                    fontSize: '1.8rem',
                                    fontWeight: 300,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    padding: '1rem 2rem'
                                }}>
                                    {style.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reference Image Modal */}
            {isModalOpen && selectedStyle && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}
                    onClick={handleCloseModal} // Click outside to close
                >
                    <div
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                        style={{
                            width: '100%',
                            maxWidth: '1000px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <h3 style={{
                            color: '#fff',
                            fontSize: '2rem',
                            marginBottom: '2rem',
                            fontWeight: 300,
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            {selectedStyle.name} Mood
                        </h3>

                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Select a reference image below:</p>

                        {/* Reference Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            width: '100%',
                            marginBottom: '3rem',
                            overflowY: 'auto'
                        }}>
                            {/* If no images fetched, show specific message or placeholders if you want. 
                                For now, we show message if empty. */}
                            {currentRefImages.length > 0 ? (
                                currentRefImages.map((imgUrl, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        style={{
                                            aspectRatio: '4/3',
                                            overflow: 'hidden',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            border: selectedImageIdx === idx ? '4px solid var(--color-accent)' : '2px solid transparent',
                                            opacity: (selectedImageIdx === null || selectedImageIdx === idx) ? 1 : 0.5,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Ref ${idx}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '2rem' }}>
                                    <p>Reference images coming soon...</p>
                                    {/* Temporary fallback to main image so modal isn't empty */}
                                    <img
                                        src={selectedStyle.image}
                                        style={{ width: '300px', height: 'auto', marginTop: '1rem', opacity: 0.5 }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    padding: '1rem 3rem',
                                    background: 'transparent',
                                    border: '1px solid #fff',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    borderRadius: '50px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmSelection}
                                style={{
                                    padding: '1rem 3rem',
                                    background: 'var(--color-accent)',
                                    border: '1px solid var(--color-accent)',
                                    color: '#000',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    borderRadius: '50px',
                                    transition: 'all 0.3s',
                                    opacity: (currentRefImages.length > 0 && selectedImageIdx === null) ? 0.5 : 1,
                                }}
                            >
                                {selectedImageIdx !== null ? 'Select Marked Style' : 'Select Style'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </Layout>
    );
}
