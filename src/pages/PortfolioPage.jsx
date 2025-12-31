import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';

import { GoogleSheetService, GOOGLE_SHEET_URLS } from '../services/GoogleSheetService';

const ImageSlider = ({ images, objectFit = 'cover' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef(null);

    // Update active dot on scroll
    const handleScroll = () => {
        if (!sliderRef.current) return;
        const scrollLeft = sliderRef.current.scrollLeft;
        const width = sliderRef.current.offsetWidth;
        // Calculate index based on scroll position - simple and robust
        const newIndex = Math.round(scrollLeft / width);
        setCurrentIndex(newIndex);
    };

    const scrollToSlide = (idx) => {
        if (!sliderRef.current) return;
        const width = sliderRef.current.offsetWidth;
        sliderRef.current.scrollTo({
            left: width * idx,
            behavior: 'smooth'
        });
    };

    const nextSlide = (e) => {
        if (e) e.stopPropagation();
        if (currentIndex < images.length - 1) {
            scrollToSlide(currentIndex + 1);
        }
    };

    const prevSlide = (e) => {
        if (e) e.stopPropagation();
        if (currentIndex > 0) {
            scrollToSlide(currentIndex - 1);
        }
    };

    if (!images || images.length === 0) {
        return <div style={{ width: '100%', height: '100%', background: '#111' }} />;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Scroll Container */}
            <div
                ref={sliderRef}
                onScroll={handleScroll}
                className="slider-container"
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none', // Hide scrollbar Firefox
                    msOverflowStyle: 'none',  // Hide scrollbar IE
                    scrollBehavior: 'smooth'
                }}
            >
                {/* Hide Scrollbar Webkit */}
                <style>{`
                    .slider-container::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {images.map((img, idx) => (
                    <div
                        key={idx}
                        style={{
                            minWidth: '100%',
                            height: '100%',
                            scrollSnapAlign: 'start',
                            position: 'relative'
                        }}
                    >
                        <img
                            src={img.startsWith('http') ? img : `https://images.unsplash.com/${img}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                            alt="Project"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: objectFit,
                                pointerEvents: 'none', // Allow touch drag on container, prevent img drag
                                userSelect: 'none'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
            }}>
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); scrollToSlide(idx); }}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                    />
                ))}
            </div>

            {/* Arrows */}
            {images.length > 1 && (
                <>
                    {/* Hide Prev Arrow if at start */}
                    <button
                        onClick={prevSlide}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            display: currentIndex === 0 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 20
                        }}
                    >
                        ‹
                    </button>
                    {/* Hide Next Arrow if at end */}
                    <button
                        onClick={nextSlide}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            display: currentIndex === images.length - 1 ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 20
                        }}
                    >
                        ›
                    </button>
                </>
            )}
        </div>
    );
};

export default function PortfolioPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Fetch directly from the Hardcoded Sheet URL
                const data = await GoogleSheetService.fetchCSV(GOOGLE_SHEET_URLS.PORTFOLIO);
                // Use the new mapping for 6-column images
                const mappedProjects = GoogleSheetService.mapPortfolio(data);

                if (mappedProjects.length > 0) {
                    setProjects(mappedProjects);
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error("Error fetching projects from Google Sheet:", error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <Layout>
            <div className="container fade-in" style={{ padding: '6rem 0' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontSize: '2.5rem',
                    fontWeight: 300
                }}>
                    Our Portfolio
                </h2>
                <p style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    color: '#888',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                }}>
                    Selected Works & Case Studies
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <p>No projects found.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#444' }}>
                            (Admin: Please migrate data in the Dashboard)
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>
                        {projects.map((project) => (
                            <div key={project.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Image Slider Container */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '16 / 9',
                                    marginBottom: '1rem',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    backgroundColor: '#111'
                                }}>
                                    <ImageSlider images={project.images} objectFit="cover" />
                                </div>

                                {/* Text Info */}
                                <div>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        marginBottom: '0.5rem',
                                        fontWeight: 500,
                                        color: '#eee'
                                    }}>
                                        {project.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#aaa',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        paddingRight: '1rem',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {project.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
