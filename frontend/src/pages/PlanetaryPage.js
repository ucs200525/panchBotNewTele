import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import PlanetTable from '../components/planetary/PlanetTable';
import { useAuth } from '../context/AuthContext';

const PlanetaryPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || 'Tadepallegudem');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [planetData, setPlanetData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPlanetData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/planetary/positions`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ city: cityName, date: currentDate })
                }
            );

            if (!response.ok) throw new Error('Failed to fetch planetary data');
            const data = await response.json();
            setPlanetData(data.planets);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanetData();
    }, [cityName, currentDate]);

    return (
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🪐 Planetary Positions</h1>

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
                        onClick={fetchPlanetData}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Update
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box">{error}</div>}
            {planetData && <PlanetTable planets={planetData} />}
        </div>
    );
};

export default PlanetaryPage;
