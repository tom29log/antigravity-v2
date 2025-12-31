import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

import { GoogleSheetService, GOOGLE_SHEET_URLS } from '../services/GoogleSheetService';

const ImageSlider = ({ images, onImageClick, objectFit = 'cover' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide functionality
    useEffect(() => {
        if (!images || images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images?.length]); // Safe access

    if (!images || images.length === 0) {
        return <div style={{ width: '100%', height: '100%', background: '#111' }} />;
    }

    const nextSlide = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (e, idx) => {
        e.stopPropagation();
        setCurrentIndex(idx);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {images.map((img, idx) => (
                <img
                    key={idx}
                    src={img.startsWith('http') ? img : `https://images.unsplash.com/${img}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                    alt="Project"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: objectFit,
                        opacity: idx === currentIndex ? 1 : 0,
                        transition: 'opacity 0.4s ease-in-out',
                        cursor: onImageClick ? 'pointer' : 'default'
                    }}
                    onClick={(e) => {
                        if (onImageClick) onImageClick();
                    }}
                />
            ))}

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
                        onClick={(e) => goToSlide(e, idx)}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ‹
                    </button>
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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
    const [selectedProject, setSelectedProject] = useState(null);

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
            {selectedProject && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.95)',
                    zIndex: 10000,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px'
                }}>
                    <button
                        onClick={() => setSelectedProject(null)}
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: '30px',
                            background: 'transparent',
                            border: '1px solid #fff',
                            color: '#fff',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            zIndex: 10001
                        }}
                    >
                        Back to List
                    </button>

                    <div style={{ width: '90%', height: '70%', marginBottom: '20px' }}>
                        <ImageSlider images={selectedProject.images} objectFit="contain" />
                    </div>

                    <div style={{ color: '#fff', textAlign: 'center', maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{selectedProject.title}</h2>
                        <p style={{ fontSize: '1rem', color: '#ccc' }}>{selectedProject.desc}</p>
                    </div>
                </div>
            )}

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
                                    <ImageSlider images={project.images} onImageClick={() => setSelectedProject(project)} />
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
