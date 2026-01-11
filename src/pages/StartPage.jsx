import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawingCanvas from '../components/DrawingCanvas';
import { useEstimation } from '../contexts/EstimationContext';
// Removed image import as we are using inline SVG now

export default function StartPage() {
    const navigate = useNavigate();
    const [isLampOn, setIsLampOn] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const { setAttachedDrawing } = useEstimation();

    const toggleLamp = (e) => {
        e.stopPropagation();
        setIsLampOn(prev => !prev);
    };

    const handleAttachDrawing = (dataUrl) => {
        setAttachedDrawing(dataUrl);
        setShowCanvas(false);
        // User requested a pause/notification before moving
        setTimeout(() => {
            alert('견적서에 도면이 첨부되었습니다.\n다음 단계로 이동합니다.');
            navigate('/type');
        }, 100);
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            {/* Wall Lamp & Lighting Effect */}
            <div
                style={{
                    position: 'absolute',
                    top: '12%', // Slightly adjusted for visual balance
                    right: '10%',
                    zIndex: 30, // Increased z-index
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {/* Visual Light Cast (Glow) - Behind the lamp */}
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px', // Larger, softer glow
                    height: '600px',
                    // Warmer/Softer Glow for SVG
                    background: 'radial-gradient(circle, rgba(255, 230, 150, 0.5) 0%, rgba(255, 215, 100, 0) 60%)',
                    opacity: isLampOn ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen'
                }} />

                {/* The SVG Lamp */}
                <div
                    onClick={toggleLamp}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        filter: isLampOn
                            ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                        opacity: isLampOn ? 1 : 0.8,
                    }}
                >
                    <svg
                        width="60"
                        height="100"
                        viewBox="0 0 100 140"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ overflow: 'visible' }}
                    >
                        {/* Stand Lamp Shade - Classic wide conical shade */}
                        <path
                            d="M20 10 L80 10 L95 65 L5 65 Z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            fill={isLampOn ? "rgba(255, 255, 230, 0.3)" : "none"}
                        />

                        {/* Bulb Glow Area (Inside) */}
                        <circle cx="50" cy="65" r="10" fill={isLampOn ? "#FFF" : "none"} opacity={isLampOn ? 0.6 : 0} filter="blur(5px)" />

                        {/* Top Decorative Knob/Stem (Suggestion of lamp top) */}
                        <path d="M50 10 L50 0" stroke="white" strokeWidth="2" />

                        {/* Internal Socket/Bulb Holder */}
                        <path d="M45 65 L45 75 L55 75 L55 65" stroke="white" strokeWidth="2" fill="none" />

                        {/* Pull Switch String */}
                        <line x1="60" y1="65" x2="60" y2="105" stroke="white" strokeWidth="1.5" />
                        <circle cx="60" cy="108" r="3.5" fill="white" />

                        {/* Click Target Hint for String */}
                        <rect x="50" y="65" width="20" height="50" fill="transparent" />
                    </svg>
                </div>
            </div>

            {/* Drawing Pad Trigger (Pen Icon) */}
            <div
                onClick={() => setShowCanvas(true)}
                style={{
                    position: 'absolute',
                    top: '28%',
                    right: '12%',
                    zIndex: 30, // Increased z-index
                    cursor: 'pointer',
                    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                    transition: 'transform 0.2s',
                    opacity: 0.9
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(-10deg)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
            >
                <svg className="pen-icon-animate" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                    {/* Animated Line Trace */}
                    <path className="pen-line-animate" d="M10 27 L 20 27" strokeOpacity="0.8" strokeWidth="1.5"></path>
                </svg>
            </div>

            {/* Drawing Canvas Modal */}
            {showCanvas && (
                <DrawingCanvas
                    onClose={() => setShowCanvas(false)}
                    onAttach={handleAttachDrawing}
                />
            )}

            {/* Background Layer with Brightness */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url('/assets/main_bg_new.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(1.0) contrast(1.0)',
                zIndex: 0
            }} />

            {/* Subtle Gradient Overlay (Middle Ground) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
                zIndex: 1
            }} />

            {/* Content Layer (Sticker Effect) */}
            <div className="responsive-container">
                {/* Logo Wrapper for Positioning */}
                <div className="responsive-logo-wrapper">
                    <img
                        src="/assets/logo_main_v2.png"
                        alt="On and Noch Logo"
                        className="logo-interactive"
                        style={{
                            width: '180px', // Slightly larger for better visibility as requested previously
                            height: 'auto',
                            maxHeight: '180px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))',
                            position: 'relative'
                        }}
                    />
                </div>
                <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'inherit' }}>
                    <p style={{
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                    }}>
                        Premium Interior Design
                    </p>
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                        textShadow: '0 4px 10px rgba(0,0,0,0.7)',
                        color: '#fff'
                    }}>
                        공간의 가치를<br />디자인하다
                    </h1>
                    <p style={{
                        color: '#fff',
                        marginBottom: '2rem',
                        maxWidth: '400px',
                        margin: '0 0 2rem 0', // Left align margin - will be overridden by text-align center if needed, but margin might need auto
                        textShadow: '0 2px 5px rgba(0,0,0,0.8)',
                        fontWeight: 500
                    }}>
                        On and Noch 만의 감각적인 디자인으로<br />
                        당신의 공간을 새롭게 정의하세요.
                    </p>

                    {/* Socials & Story Row */}
                    <div className="responsive-actions" style={{ marginBottom: '1rem' }}>
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/on_and_noch?igsh=MThudjdmYWY3czQzZg%3D%3D&utm_source=qr"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '1px solid #fff',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                color: '#000',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                backdropFilter: 'blur(2px)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>

                        {/* Naver Blog */}
                        <a
                            href="https://m.blog.naver.com/onandnoch"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '1px solid #fff',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                color: '#000',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                backdropFilter: 'blur(2px)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 20h4.5v-9l7 9H20V4h-4.5v9l-7-9H4v16z" />
                            </svg>
                        </a>

                        <button
                            onClick={() => navigate('/story')}
                            style={{
                                padding: '0.9rem 2.5rem',
                                fontSize: '1rem',
                                backgroundColor: '#fff',
                                color: '#000',
                                border: '1px solid #fff',
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            Story
                        </button>
                    </div>

                    {/* Main Actions Row */}
                    <div className="responsive-actions">
                        <button
                            onClick={() => navigate('/type')}
                            style={{
                                padding: '1rem 2.5rem', // Slightly reduced padding for mobile fit
                                fontSize: '1.1rem',
                                backgroundColor: 'var(--color-accent)',
                                color: '#000',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: '50px',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                                cursor: 'pointer',
                                // margin: '0 0.5rem' // Removed margin to save space
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            견적 시작하기
                        </button>

                        <button
                            onClick={() => navigate('/portfolio')}
                            style={{
                                padding: '1rem 2rem', // Adjusted padding
                                fontSize: '1rem',
                                backgroundColor: '#fff',
                                color: '#000',
                                border: '1px solid #fff',
                                borderRadius: '50px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
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
