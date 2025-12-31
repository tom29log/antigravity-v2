import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { GoogleSheetService, GOOGLE_SHEET_URLS } from '../services/GoogleSheetService';

export default function StoryPage() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                // Fetch directly from the Hardcoded Sheet URL
                const data = await GoogleSheetService.fetchCSV(GOOGLE_SHEET_URLS.STORIES);
                const mappedStories = GoogleSheetService.mapStories(data);

                if (mappedStories.length > 0) {
                    setStories(mappedStories);
                } else {
                    setStories([]);
                }
            } catch (error) {
                console.error("Error fetching stories from Google Sheet:", error);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
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
                    On & Noch Story
                </h2>
                <p style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    color: '#888',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                }}>
                    Behind the scenes & Daily construction logs
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading stories...</div>
                ) : stories.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                        <p>No stories yet.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#444' }}>
                            (Admin: Please upload photos in the Dashboard)
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '4px', // Tight gap like Instagram
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        {stories.map((story, index) => (
                            <div
                                key={story.id}
                                style={{
                                    position: 'relative',
                                    paddingBottom: '100%', // 1:1 Aspect Ratio
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    backgroundColor: '#1a1a1a'
                                }}
                                onClick={() => setSelectedImage(story.imageUrl.startsWith('http') ? story.imageUrl : `https://images.unsplash.com/${story.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=90`)}
                            >
                                <img
                                    src={story.imageUrl.startsWith('http') ? story.imageUrl : `https://images.unsplash.com/${story.imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                                    alt={`Story ${index + 1}`}
                                    loading="lazy"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simple Lightbox Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: '30px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.8)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            fontSize: '0.8rem',
                            fontWeight: '300',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        LIST
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed Story"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            )}
        </Layout>
    );
}

