import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import './SwissPanchang.css';

const SwissPanchang = () => {
    const [cityName, setCityName] = useState(localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [panchangData, setPanchangData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPanchang = async () => {
        if (!cityName) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`);
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
        fetchPanchang();
    };

    const handleCitySelect = (city) => {
        setCityName(city.name);
        localStorage.setItem('selectedCity', city.name);
    };

    return (
        <div className="content">
            <div className="hero-section swiss-panchang-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '3rem 0' }}>
                <div className="hero-content" style={{ maxWidth: '800px' }}>
                    <h1 className="hero-title" style={{ color: '#f8fafc', fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Swiss Daily Panchang
                    </h1>
                    <p className="hero-subtitle" style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        High-precision astronomical and Vedic report calculated using the Swiss Ephemeris engine
                    </p>

                    <form className="hero-form" onSubmit={handleGetPanchang} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 2 }}>
                                <label className="input-label" style={{ color: '#ccd6f6' }}>Target City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onChange={setCityName}
                                    onSelect={handleCitySelect}
                                    placeholder="Enter city name..."
                                />
                            </div>
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label" style={{ color: '#ccd6f6' }}>Select Date</label>
                                <input
                                    type="date"
                                    className="date-input-hero"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    required
                                    style={{ background: '#0a192f', color: 'white', border: '1px solid #233554' }}
                                />
                            </div>
                        </div>
                        <button type="submit" className="get-panchang-btn-hero" disabled={!cityName} style={{ marginTop: '1.5rem', width: '100%', background: 'linear-gradient(90deg, #64ffda 0%, #48bb78 100%)', color: '#0a192f', fontWeight: '800' }}>
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
