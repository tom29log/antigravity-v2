import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            {/* Background Layer with Brightness */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(1.15) contrast(1.05)', // Boost sunlight
                zIndex: 0
            }} />

            {/* Subtle Gradient Overlay (Lighter) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.0))', // Much clearer
                zIndex: 1
            }} />

            {/* Content Layer (Sticker Effect) */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%'
            }}>
                {/* Logo Wrapper for Positioning */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    zIndex: 10
                }}>
                    {/* Interactive Logo */}
                    {/* Interactive Logo - Glass Sticker Effect */}
                    <div
                        className="logo-interactive"
                        style={{
                            width: '120px',
                            height: '120px',
                            backgroundColor: 'var(--color-accent)',
                            // Sticker Shadow
                            filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))',
                            position: 'relative', // for z-index context
                            maskImage: 'url(/assets/logo_main.png)',
                            WebkitMaskImage: 'url(/assets/logo_main.png)',
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskPosition: 'center'
                        }}
                    />
                </div>
                <div className="fade-in">
                    <p style={{
                        color: 'var(--color-accent)',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)' // Strong text shadow
                    }}>
                        Premium Interior Design
                    </p>
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                        textShadow: '0 4px 10px rgba(0,0,0,0.7)' // Deep shadow for readability
                    }}>
                        공간의 가치를<br />디자인하다
                    </h1>
                    <p style={{
                        color: '#fff', // Changed from transparent secondary text to White for visibility
                        marginBottom: '2rem',
                        maxWidth: '400px',
                        margin: '0 auto 2rem auto',
                        textShadow: '0 2px 5px rgba(0,0,0,0.8)',
                        fontWeight: 500
                    }}>
                        On and Noch 만의 감각적인 디자인으로<br />
                        당신의 공간을 새롭게 정의하세요.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/story')}
                            style={{
                                padding: '0.9rem 2.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = '#fff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                            }}
                        >
                            Story
                        </button>

                        <button
                            onClick={() => navigate('/type')}
                            style={{
                                padding: '1rem 3rem',
                                fontSize: '1.1rem',
                                backgroundColor: 'var(--color-accent)',
                                color: '#000',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '50px',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            견적 시작하기
                        </button>

                        <button
                            onClick={() => navigate('/portfolio')}
                            style={{
                                padding: '0.9rem 2.5rem',
                                fontSize: '1rem',
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = '#fff';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                            }}
                        >
                            Portfolio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
