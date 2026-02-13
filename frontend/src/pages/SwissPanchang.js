import React, { useState, useEffect } from 'react';
import '../pages/hero-styles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';

import { useAuth } from '../context/AuthContext';

const SwissPanchang = () => {
    const { localCity, localDate, setCityAndDate, selectedLat, selectedLng, setLocationDetails, timeZone } = useAuth();
    const [cityName, setCityName] = useState(localCity || '');
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [panchangData, setPanchangData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sync from context
    useEffect(() => {
        if (localCity) setCityName(localCity);
        if (localDate) setCurrentDate(localDate);
    }, [localCity, localDate]);

    const fetchPanchang = async () => {
        if (!cityName) return;
        setIsLoading(true);
        setError(null);
        try {
            let url = `${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`;
            if (selectedLat && selectedLng && cityName === localCity) {
                url += `&lat=${selectedLat}&lng=${selectedLng}`;
                if (timeZone) url += `&timeZone=${timeZone}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch Panchang data');
            const result = await response.json();
            setPanchangData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetPanchang = (e) => {
        e.preventDefault();
        setCityAndDate(cityName, currentDate);
        fetchPanchang();
    };

    const handleCitySelect = (city) => {
        setCityName(city.name);
        setLocationDetails({
            name: city.name,
            lat: city.lat,
            lng: city.lng
        });
    };

    return (
        <div className="content">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Daily Precision Panchang
                    </h1>
                    <p className="hero-subtitle">
                        High-precision astronomical and Vedic report calculated using a professional ephemeris engine
                    </p>

                    <form className="hero-form" onSubmit={handleGetPanchang}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">Target City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onChange={setCityName}
                                    onSelect={handleCitySelect}
                                    placeholder="Enter city name..."
                                />
                            </div>
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">Select Date</label>
                                <input
                                    type="date"
                                    className="date-input-hero"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="get-panchang-btn-hero" disabled={!cityName}>
                            {isLoading ? 'Calculating...' : 'Generate Precision Report'}
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero" style={{ maxWidth: '600px', margin: '2rem auto' }}>{error}</div>}

            {panchangData && (
                <div className="swiss-panchang-results">

                    {/* Astronomical Table */}
                    <div className="swiss-section">
                        <h2 className="swiss-section-header">
                            <span style={{ fontSize: '1.5rem' }}>🔭</span> Astronomical Report
                        </h2>
                        <div className="swiss-table-container">
                            <table className="swiss-table">
                                <thead>
                                    <tr>
                                        <th>Calculation Parameter</th>
                                        <th>Precision Data Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="swiss-label">Reporting Date</td>
                                        <td className="swiss-value">{panchangData.date}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Sunrise</td>
                                        <td className="swiss-value time">{panchangData.sunrise}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Sunset</td>
                                        <td className="swiss-value time">{panchangData.sunset}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Moonrise</td>
                                        <td className="swiss-value time">{panchangData.moonrise}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Moonset</td>
                                        <td className="swiss-value time">{panchangData.moonset}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Vedic Weekday (Vara)</td>
                                        <td className="swiss-value">
                                            {panchangData.weekday}
                                            <span className="swiss-tag">{panchangData.varaLord?.planet || 'Ruling Lord'}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Panchanga Essentials Table */}
                    <div className="swiss-section">
                        <h2 className="swiss-section-header">
                            <span style={{ fontSize: '1.5rem' }}>🕉️</span> Panchanga Essentials
                        </h2>
                        <div className="swiss-table-container">
                            <table className="swiss-table">
                                <thead>
                                    <tr>
                                        <th>Vedic Element</th>
                                        <th>Calculated Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="swiss-label">Tithi (Lunar Day)</td>
                                        <td className="swiss-value">
                                            {panchangData.tithi.name}
                                            <span className="swiss-tag" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                                {panchangData.paksha} Paksha
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Nakshatra (Constellation)</td>
                                        <td className="swiss-value">
                                            {panchangData.nakshatra.name}
                                            {panchangData.nakshatra.lord && (
                                                <span className="swiss-tag" style={{ background: '#fef3c7', color: '#92400e' }}>
                                                    Lord: {panchangData.nakshatra.lord}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Yoga</td>
                                        <td className="swiss-value">{panchangData.yoga.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Karana</td>
                                        <td className="swiss-value">{panchangData.karana.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Vedic Masa (Month)</td>
                                        <td className="swiss-value">{panchangData.masa.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="swiss-label">Rtu (Season)</td>
                                        <td className="swiss-value">{panchangData.rtu.name}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lagna Transitions Table */}
                    {panchangData.lagnas && panchangData.lagnas.length > 0 && (
                        <div className="swiss-section">
                            <h2 className="swiss-section-header">
                                <span style={{ fontSize: '1.5rem' }}>♌</span> Lagna Times (Ascendant Transitions)
                            </h2>
                            <div className="swiss-table-container">
                                <table className="swiss-table">
                                    <thead>
                                        <tr>
                                            <th>Zodiac Lagna (Sign)</th>
                                            <th>Calculated Duration (Local Time Window)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {panchangData.lagnas.map((lagna, idx) => (
                                            <tr key={idx} className="swiss-lagna-row">
                                                <td className="swiss-label" style={{ fontWeight: '800', color: '#4338ca' }}>{lagna.name}</td>
                                                <td className="swiss-value" style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                                    {lagna.startTime} <span style={{ color: '#94a3b8' }}>—</span> {lagna.endTime}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SwissPanchang;
