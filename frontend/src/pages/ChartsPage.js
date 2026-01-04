import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ChartWheel from '../components/charts/ChartWheel';
import { useAuth } from '../context/AuthContext';

const ChartsPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || 'Tadepallegudem');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChartData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // First get coordinates
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${cityName}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/charts/details`,
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

            if (!response.ok) throw new Error('Failed to fetch chart data');
            const data = await response.json();
            setChartData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, [cityName, currentDate]);

    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🗺️ Divisional Charts</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
                        <input 
                            type="text" 
                            value={cityName} 
                            onChange={(e) => setCityName(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                        <input 
                            type="date" 
                            value={currentDate} 
                            onChange={(e) => setCurrentDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <button 
                        onClick={fetchChartData}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Update
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box">{error}</div>}
            
            {chartData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <ChartWheel 
                        houses={chartData.d1.houses} 
                        title="D1 - Rasi Chart" 
                        lagnaRashi={chartData.lagna.name}
                    />
                    <ChartWheel 
                        houses={chartData.d9.houses} 
                        title="D9 - Navamsa Chart" 
                        lagnaRashi={chartData.d9.planets.find(p => p.name === 'Lagna')?.rashi}
                    />
                </div>
            )}
        </div>
    );
};

export default ChartsPage;
