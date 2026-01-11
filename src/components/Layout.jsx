import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    return (
        <div className="layout">
            {/* Header - Transparent on Home, Solid elsewhere */}
            <header style={{
                padding: '1.5rem',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 100,
                background: isHome ? 'transparent' : 'rgba(26, 26, 26, 0.9)',
                backdropFilter: isHome ? 'none' : 'blur(10px)',
                borderBottom: isHome ? 'none' : '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s ease'
            }}>
                {/* Back Button / Left Spacer */}
                <div style={{ width: '40px' }}>
                    {!isHome && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            aria-label="Go back"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                    )}
                </div>

                <img
                    src="/assets/logo_header_v2.png"
                    alt="On and Noch"
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%', // Centered vertically
                        transform: 'translate(-50%, -50%)',
                        height: '51px', // 15% smaller than 60px
                        cursor: 'pointer',
                        // filter: 'brightness(0) invert(1)', // Removed to show original color
                        transition: 'opacity 0.2s',
                        zIndex: 101,
                        objectFit: 'contain'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                />

                {/* Right Spacer for balance */}
                <div style={{ width: '40px' }}></div>
            </header>

            <main style={{
                paddingTop: isHome ? 0 : '80px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>
        </div >
    );
}
