import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const HoraPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || 'Tadepallegudem');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [horaData, setHoraData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHoraData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${cityName}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lagna/hora`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      date: currentDate,
                      lat: coords.lat, 
                      lng: coords.lng 
                  })
            });

            if (!response.ok) throw new Error('Failed to fetch hora data');
            const data = await response.json();
            setHoraData(data.horas);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHoraData();
    }, [cityName, currentDate]);

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>⌛ Hora (Planetary Hours)</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                        <input 
                            type="text" 
                            value={cityName} 
                            onChange={(e) => setCityName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                        <input 
                            type="date" 
                            value={currentDate} 
                            onChange={(e) => setCurrentDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd6fe' }}
                        />
                    </div>
                    <button 
                        onClick={fetchHoraData}
                        style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Update
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box">{error}</div>}
            
            {horaData && (
                <div className="hora-list">
                    <h3 style={{ borderBottom: '2px solid #ddd6fe', paddingBottom: '10px', marginTop: '20px' }}>🌞 Day Horas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '30px' }}>
                        {horaData.filter(h => h.type === 'Day').map((hora, idx) => (
                            <div key={idx} style={{ padding: '10px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', color: '#7c3aed' }}>{hora.lord}</div>
                                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                    {formatTime(hora.start)} - {formatTime(hora.end)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ borderBottom: '2px solid #ddd6fe', paddingBottom: '10px' }}>🌙 Night Horas</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {horaData.filter(h => h.type === 'Night').map((hora, idx) => (
                            <div key={idx} style={{ padding: '10px', background: '#f8fafc', border: '1px solid #eee', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', color: '#475569' }}>{hora.lord}</div>
                                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                    {formatTime(hora.start)} - {formatTime(hora.end)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoraPage;
