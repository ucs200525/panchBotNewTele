import React, { useState, useEffect } from 'react';
import PanchangInfo from '../components/PanchangInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const PanchangPage = () => {
    const { localCity, localDate } = useAuth();
    const [cityName, setCityName] = useState(localCity || '');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [panchangData, setPanchangData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Panchang data
    const fetchPanchangData = async () => {
        if (!cityName || !currentDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch panchang data');
            }

            const data = await response.json();
            setPanchangData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching panchang data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-geolocation
    const autoGeolocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    try {
                        const cityResponse = await fetch(
                            `${process.env.REACT_APP_API_URL}/api/fetchCityName/${lat}/${lng}`
                        );
                        if (!cityResponse.ok) {
                            throw new Error('Failed to fetch city name');
                        }
                        const cityData = await cityResponse.json();
                        setCityName(cityData.cityName);
                    } catch (error) {
                        setError(error.message || 'Error fetching city name');
                    }
                },
                (error) => {
                    setError('Geolocation error: ' + error.message);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    // Auto-fetch on mount if city and date are available
    useEffect(() => {
        if (cityName && currentDate) {
            fetchPanchangData();
        }
    }, [cityName, currentDate]);

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>📅 Today's Panchanga</h1>

            {/* Input Form */}
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Enter City Name:
                    </label>
                    <input
                        type="text"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        placeholder="Enter city name"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Enter Date:
                    </label>
                    <input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={fetchPanchangData}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Get Panchangam
                    </button>
                    <button
                        onClick={autoGeolocation}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📍 Use My Location
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && <LoadingSpinner />}

            {/* Error State */}
            {error && (
                <div style={{
                    padding: '15px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Panchang Data Display */}
            {panchangData && <PanchangInfo data={panchangData} />}
        </div>
    );
};

export default PanchangPage;
