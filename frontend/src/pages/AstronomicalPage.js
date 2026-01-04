import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const AstronomicalPage = () => {
    const { localDate } = useAuth();
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEventData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/astronomical/eclipses`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: currentDate })
                }
            );

            if (!response.ok) throw new Error('Failed to fetch event data');
            const data = await response.json();
            setEventData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, [currentDate]);

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔭 Astronomical Events</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                    <label style={{ fontWeight: 'bold' }}>Reference Date:</label>
                    <input 
                        type="date" 
                        value={currentDate} 
                        onChange={(e) => setCurrentDate(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bae6fd' }}
                    />
                    <button 
                        onClick={fetchEventData}
                        style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Search Upcoming
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box">{error}</div>}
            
            {eventData && (
                <div className="events-list">
                    <h2 className="section-title">🌑 Upcoming Eclipses</h2>
                    <div className="panchang-table">
                        <div className="panchang-row">
                            <div className="panchang-label">Solar Eclipse</div>
                            <div className="panchang-value">
                                {eventData.solar ? (
                                    <div>
                                        <strong>{new Date(eventData.solar.time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            Type: {eventData.solar.type} | Magnitude: {eventData.solar.magnitude.toFixed(4)}
                                        </div>
                                    </div>
                                ) : 'None found in next search window'}
                            </div>
                        </div>
                        <div className="panchang-row">
                            <div className="panchang-label">Lunar Eclipse</div>
                            <div className="panchang-value">
                                {eventData.lunar ? (
                                    <div>
                                        <strong>{new Date(eventData.lunar.time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            Type: {eventData.lunar.type} | Magnitude: {eventData.lunar.magnitude.toFixed(4)}
                                        </div>
                                    </div>
                                ) : 'None found in next search window'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AstronomicalPage;
