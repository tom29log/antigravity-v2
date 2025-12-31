import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimation } from '../contexts/EstimationContext';
import Layout from '../components/Layout';

const TypeCard = ({ title, subtitle, onClick, image }) => (
    <div
        onClick={onClick}
        style={{
            flex: 1,
            minWidth: '300px',
            height: '400px',
            margin: '1rem',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.6)',
            transition: 'filter 0.3s'
        }} />
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '2rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
        }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
            <p style={{ color: '#ccc' }}>{subtitle}</p>
        </div>
    </div>
);

export default function ServiceTypePage() {
    const navigate = useNavigate();
    const { setServiceType } = useEstimation();

    const handleSelect = (type) => {
        setServiceType(type);
        navigate('/details');
    };

    return (
        <Layout>
            <div className="container fade-in" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '2rem 0'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
                    어떤 공간을 <span style={{ color: 'var(--color-accent)' }}>디자인</span> 하시나요?
                </h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <TypeCard
                        title="상업 공간"
                        subtitle="카페, 오피스, 매장, 식당 등"
                        image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1447&q=80"
                        onClick={() => handleSelect('commercial')}
                    />
                    <TypeCard
                        title="주거 공간"
                        subtitle="아파트, 주택, 빌라, 오피스텔 등"
                        image="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1453&q=80"
                        onClick={() => handleSelect('residential')}
                    />
                </div>
            </div>
        </Layout>
    );
}
