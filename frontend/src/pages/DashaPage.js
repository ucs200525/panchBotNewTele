import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const DashaPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || 'Tadepallegudem');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [dashaData, setDashaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashaData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${cityName}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/dasha/vimshottari`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        date: currentDate,
                        lat: coords.lat,
                        lng: coords.lng
                    })
                }
            );

            if (!response.ok) throw new Error('Failed to fetch dasha data');
            const data = await response.json();
            setDashaData(data.dasha);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashaData();
    }, [cityName, currentDate]);

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>⏳ Vimshottari Mahadasha</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City Name (Birth Location)</label>
                        <input 
                            type="text" 
                            value={cityName} 
                            onChange={(e) => setCityName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Birth Date</label>
                        <input 
                            type="date" 
                            value={currentDate} 
                            onChange={(e) => setCurrentDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <button 
                        onClick={fetchDashaData}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Calculate
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box" style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
            
            {dashaData && (
                <div className="dasha-timeline">
                    {dashaData.map((d, i) => (
                        <div key={i} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '150px 1fr 150px', 
                            padding: '15px', 
                            borderBottom: '1px solid #e2e8f0',
                            background: i % 2 === 0 ? '#fff' : '#f8fafc'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{d.lord}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Duration: {d.duration} Years 
                                {d.isInitial && <span style={{ marginLeft: '10px', color: '#3b82f6', fontStyle: 'italic' }}>(Balance at birth)</span>}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#475569' }}>
                                Ends: {new Date(d.end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashaPage;
