import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import './hero-styles.css';

const DailyPanchang = () => {
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
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-icon">📅</span>
                        Daily Panchang
                    </h1>
                    <p className="hero-subtitle">
                        Complete Vedic daily report including Rahu Kalam, Yamaghandam & Gulika Kalam
                    </p>

                    <form className="hero-form" onSubmit={handleGetPanchang}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 2 }}>
                                <label className="input-label">City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onChange={setCityName}
                                    onSelect={handleCitySelect}
                                    placeholder="Search city"
                                />
                            </div>
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">Date</label>
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
                            Calculate Panchang
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero">{error}</div>}

            {panchangData && (
                <div className="results-section">
                    <div className="data-grid">
                        <div className="data-card transition-card">
                            <div className="data-card-label">Sunrise</div>
                            <div className="data-card-value sunrise-today">{panchangData.sunrise}</div>
                        </div>
                        <div className="data-card transition-card">
                            <div className="data-card-label">Sunset</div>
                            <div className="data-card-value sunset-today">{panchangData.sunset}</div>
                        </div>
                        <div className="data-card transition-card">
                            <div className="data-card-label">Weekday</div>
                            <div className="data-card-value">{panchangData.weekday}</div>
                        </div>
                    </div>

                    <div className="floating-section">
                        <h2 className="section-title">Core Elements</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Entity</th>
                                        <th>Name</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 700 }}>Tithi</td>
                                        <td>{panchangData.tithi.name}</td>
                                        <td>#{panchangData.tithi.number} ({panchangData.paksha})</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 700 }}>Nakshatra</td>
                                        <td>{panchangData.nakshatra.name}</td>
                                        <td>#{panchangData.nakshatra.number}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 700 }}>Yoga</td>
                                        <td>{panchangData.yoga.name}</td>
                                        <td>#{panchangData.yoga.number}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 700 }}>Karana</td>
                                        <td>{panchangData.karana.name}</td>
                                        <td>#{panchangData.karana.number}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="floating-section">
                        <h2 className="section-title">Inauspicious Timings (Kalam)</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Period Name</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="period-ashubh">
                                        <td style={{ fontWeight: 700 }}>Rahu Kalam</td>
                                        <td>{panchangData.rahuKaal ? panchangData.rahuKaal.start : 'N/A'}</td>
                                        <td>{panchangData.rahuKaal ? panchangData.rahuKaal.end : 'N/A'}</td>
                                    </tr>
                                    <tr className="period-ashubh">
                                        <td style={{ fontWeight: 700 }}>Yamaghandam</td>
                                        <td>{panchangData.yamaganda ? panchangData.yamaganda.start : 'N/A'}</td>
                                        <td>{panchangData.yamaganda ? panchangData.yamaganda.end : 'N/A'}</td>
                                    </tr>
                                    <tr className="period-ashubh">
                                        <td style={{ fontWeight: 700 }}>Gulika Kalam</td>
                                        <td>{panchangData.gulika ? panchangData.gulika.start : 'N/A'}</td>
                                        <td>{panchangData.gulika ? panchangData.gulika.end : 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="floating-section">
                        <h2 className="section-title">Auspicious Timings</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Period Name</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="period-special">
                                        <td style={{ fontWeight: 700 }}>Abhijit Muhurat</td>
                                        <td>{panchangData.abhijitMuhurat ? panchangData.abhijitMuhurat.start : 'N/A'}</td>
                                        <td>{panchangData.abhijitMuhurat ? panchangData.abhijitMuhurat.end : 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyPanchang;
