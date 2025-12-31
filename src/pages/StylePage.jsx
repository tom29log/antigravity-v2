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
                        {/* Reference Slider (Expanding) */}
                        <div className="style-slider" style={{
                            display: 'flex',
                            gap: '10px',
                            width: '100%',
                            height: '400px', // Fixed height for the slider
                            marginBottom: '3rem',
                            padding: '1rem 0',
                            overflowX: 'auto',
                            scrollbarWidth: 'none', // Hide scrollbar Firefox
                            msOverflowStyle: 'none',  // Hide scrollbar IE
                            alignItems: 'center'
                        }}>
                            {currentRefImages.length > 0 ? (
                                currentRefImages.map((imgUrl, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`slider-item ${selectedImageIdx === idx ? 'selected' : ''}`}
                                        style={{
                                            height: '100%',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                                            // Dynamic Flex Logic handled in CSS or inline if needed, but CSS class is cleaner for hover.
                                            // Let's use simple inline styles for the base, and we'll add a <style> block or use global css for the hover expansion.
                                            flex: '1',
                                            minWidth: '60px', // collapsed width
                                            border: selectedImageIdx === idx ? '4px solid var(--color-accent)' : '2px solid transparent',
                                            filter: (selectedImageIdx !== null && selectedImageIdx !== idx) ? 'brightness(0.5)' : 'brightness(1)'
                                        }}
                                        // Inline hover attempt implies we need state or CSS. Using a scoped style block approach roughly or just rely on global css.
                                        // Actually, let's inject a style tag for this specific page or use onMouseOver.
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.flex = '5'; // Expand significantly
                                            e.currentTarget.style.minWidth = '300px';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.flex = '1';
                                            e.currentTarget.style.minWidth = '60px';
                                        }}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={`Ref ${idx}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0
                                            }}
                                        />
                                        {/* Selection Checkmark Overlay */}
                                        {selectedImageIdx === idx && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '20px',
                                                right: '20px',
                                                backgroundColor: 'var(--color-accent)',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                                zIndex: 2
                                            }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center', color: '#888', padding: '2rem' }}>
                                    <p>Reference images coming soon...</p>
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
