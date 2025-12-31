import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StartPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            minHeight: '100vh'
        }}>
            <div
                style={{
                    position: 'absolute',
                    top: '3rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '120px',
                    zIndex: 10,
                    backgroundColor: 'var(--color-accent)',
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
            <div className="fade-in">
                <p style={{
                    color: 'var(--color-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                }}>
                    Premium Interior Design
                </p>
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '1.5rem',
                    lineHeight: 1.2
                }}>
                    공간의 가치를<br />디자인하다
                </h1>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: '3rem',
                    maxWidth: '400px',
                    margin: '0 auto 3rem auto'
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
    );
}
