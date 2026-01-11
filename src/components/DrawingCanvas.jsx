import React, { useRef, useState, useEffect } from 'react';

export default function DrawingCanvas({ onClose, onAttach }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);
    const [history, setHistory] = useState([]);

    // Ruler Mode States
    const [isRulerMode, setIsRulerMode] = useState(false);
    const [startPos, setStartPos] = useState(null); // {x, y}
    const [snapshot, setSnapshot] = useState(null); // ImageData for preview

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const context = canvas.getContext('2d');
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1.0;

        context.fillStyle = '#000000';
        context.fillRect(0, 0, rect.width, rect.height);

        setCtx(context);
    }, []);

    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, imageData]);
    };

    const handleUndo = () => {
        if (history.length === 0 || !ctx) return;
        const lastState = history[history.length - 1];
        ctx.putImageData(lastState, 0, 0);
        setHistory(prev => prev.slice(0, -1));
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;

        saveState(); // Save for Undo

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        if (isRulerMode) {
            // Save current state for preview restoration
            const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setSnapshot(currentData);
            setStartPos({ x, y });
        } else {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !ctx) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        if (isRulerMode && startPos && snapshot) {
            // Restore snapshot to clear previous preview line
            ctx.putImageData(snapshot, 0, 0);

            // Orthogonal Snapping Logic
            let targetX = x;
            let targetY = y;

            // Calculate deltas
            const dx = Math.abs(x - startPos.x);
            const dy = Math.abs(y - startPos.y);

            // Snap to the axis with the greater delta
            if (dx > dy) {
                targetY = startPos.y; // Horizontal line
            } else {
                targetX = startPos.x; // Vertical line
            }

            // Draw straight line preview
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        } else if (!isRulerMode) {
            // Freehand
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isRulerMode && ctx) ctx.closePath();
        // If in ruler mode, we need to commit the line to the 'history' but the stroke was already drawn on the canvas context by 'draw'.
        // Actually, 'draw' clears and redraws ONLY the temporary line. 
        // When mouseup happens, the last state of the canvas IS the committed state. 
        // So we just need to reset the flags.
        // WAIT: 'saveState' saves checking 'history'. We need to save the final state to history too?
        // In freehand, we simply closePath. 
        // In ruler mode, the last 'stroke' was drawn in 'draw'. It persists. 
        // However, we should verify logic.
        // Yes, putImageData + stroke = canvas has the line.

        setIsDrawing(false);
        setSnapshot(null);
        setStartPos(null);
    };

    const handleClear = () => {
        if (!ctx || !canvasRef.current) return;
        saveState();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, rect.width, rect.height);
    };

    const handleAttach = () => {
        if (!canvasRef.current || !onAttach) return;

        try {
            const sourceCanvas = canvasRef.current;
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            // Limit max dimension to 800px for smaller file size
            const MAX_DIM = 800;
            // sourceCanvas.width is strictly pixel width (already scaled by DPR)
            let width = sourceCanvas.width;
            let height = sourceCanvas.height;

            // Calculate scale to fit MAX_DIM
            const scale = Math.min(MAX_DIM / width, MAX_DIM / height, 1);

            const finalWidth = width * scale;
            const finalHeight = height * scale;

            tempCanvas.width = finalWidth;
            tempCanvas.height = finalHeight;

            // Draw resized image
            // We need to fill black background first because transparent pixels might be issues in JPEG
            tempCtx.fillStyle = '#000000';
            tempCtx.fillRect(0, 0, finalWidth, finalHeight);

            tempCtx.drawImage(sourceCanvas, 0, 0, finalWidth, finalHeight);

            // Compress to 0.5 quality JPEG
            const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.5);
            onAttach(dataUrl);
        } catch (e) {
            console.error("Error optimizing drawing", e);
            // Fallback
            if (canvasRef.current) {
                onAttach(canvasRef.current.toDataURL('image/jpeg', 0.6));
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="fade-in" style={{
                width: '90%',
                maxWidth: '600px',
                height: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontWeight: 300, fontSize: '1.2rem' }}>Sketch</h3>

                        {/* Undo Button */}
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            style={{
                                background: 'transparent',
                                border: '1px solid #666',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: history.length > 0 ? 'pointer' : 'default',
                                opacity: history.length > 0 ? 1 : 0.3,
                                color: '#fff',
                                transition: 'all 0.2s'
                            }}
                            title="Undo"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 14L4 9l5-5" />
                                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                            </svg>
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <button
                                onClick={() => setIsRulerMode(!isRulerMode)}
                                style={{
                                    background: isRulerMode ? 'var(--color-accent)' : 'transparent',
                                    border: isRulerMode ? 'none' : '1px solid #666',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: isRulerMode ? '#000' : '#fff',
                                    transition: 'all 0.2s'
                                }}
                                title="Ruler Mode (Straight Line)"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ transform: 'rotate(-45deg)' }}
                                >
                                    <path d="M2 8h20v8H2z" />
                                    <path d="M6 8v4" />
                                    <path d="M10 8v4" />
                                    <path d="M14 8v4" />
                                    <path d="M18 8v4" />
                                </svg>
                            </button>
                            <span style={{ fontSize: '10px', color: isRulerMode ? 'var(--color-accent)' : '#aaa', whiteSpace: 'nowrap' }}>직선그리기</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.5rem', padding: '0.5rem' }}
                    >✕</button>
                </div>

                <div style={{
                    flex: 1,
                    border: '1px solid #444',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    touchAction: 'none'
                }}>
                    <canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: '100%', display: 'block', cursor: isRulerMode ? 'crosshair' : 'default', pointerEvents: 'auto' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={handleClear}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: 'transparent',
                            border: '1px solid #666',
                            color: '#ccc',
                            borderRadius: '50px',
                            cursor: 'pointer'
                        }}
                    >
                        전체 지우기
                    </button>
                    <button
                        onClick={handleAttach}
                        style={{
                            padding: '0.8rem 2rem',
                            background: 'var(--color-accent)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        첨부 및 계속하기
                    </button>
                </div>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: '-0.5rem' }}>
                    완성된 그림은 견적서에 자동으로 포함됩니다.
                </p>
            </div>
        </div>
    );
}
