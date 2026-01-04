import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const LagnaPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || 'Tadepallegudem');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [lagnaData, setLagnaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLagnaData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Get Coordinates
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${cityName}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            // 2. We need sunrise for accurate lagna calculation (pass it if known, or let backend fallback)
            // For now, let's just ask for timings. Backend needs sunriseStr.
            // Ideally we get sunrise from panchang API first or pass a default.
            // Simplified workflow: Fetch full panchang to get accurate sunrise, then use it?
            // actually backend's calculateDayLagnas needs sunrise. 
            // Let's use a simpler approach: call the main panchang endpoint which ALREADY returns lagnas!
            // But this page is specific to Lagna module. Let's try to stick to modular route.
            // We will pass a dummy sunrise if we don't have it, or fetch it.
            // Let's rely on the main panchang data for now as it's more robust with sunrise.
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      city: cityName, 
                      date: currentDate,
                      lat: coords.lat, 
                      lng: coords.lng 
                  })
            });

            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setLagnaData(data.lagnas); // Use the lagnas array from standard response
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLagnaData();
    }, [cityName, currentDate]);

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        // Check if it matches "HH:MM AM/PM" format or ISO
        return timeStr; 
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🌅 Lagna (Ascendant) Timings</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                        <input 
                            type="text" 
                            value={cityName} 
                            onChange={(e) => setCityName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fed7aa' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                        <input 
                            type="date" 
                            value={currentDate} 
                            onChange={(e) => setCurrentDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #fed7aa' }}
                        />
                    </div>
                    <button 
                        onClick={fetchLagnaData}
                        style={{ padding: '10px 20px', background: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Update
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box">{error}</div>}
            
            {lagnaData && (
                <div className="lagna-list">
                   {lagnaData.map((lagna, idx) => (
                       <div key={idx} style={{ 
                           display: 'flex', 
                           justifyContent: 'space-between', 
                           padding: '15px',
                           borderBottom: '1px solid #eee',
                           background: idx % 2 === 0 ? '#fff' : '#fffaf0'
                       }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <span style={{ fontSize: '1.5rem' }}>{lagna.symbol}</span>
                               <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{lagna.name}</span>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                               <div style={{ fontWeight: '600', color: '#ea580c' }}>
                                   {formatTime(lagna.startTime)} - {formatTime(lagna.endTime)}
                               </div>
                           </div>
                       </div>
                   ))}
                </div>
            )}
        </div>
    );
};

export default LagnaPage;
