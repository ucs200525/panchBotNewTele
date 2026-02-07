import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import ChartWheel from '../components/charts/ChartWheel';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';
import './ChartsPage.css';

const ChartsPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [birthTime, setBirthTime] = useState('12:00');
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchChartData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            // Save profile on successful attempt (or just on click)
            saveProfile(name, { cityName: city, birthDate: date, birthTime });
            setSavedProfiles(getAllProfiles());

            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/charts/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    time: birthTime,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!response.ok) throw new Error('Failed to fetch chart data');
            const data = await response.json();
            setChartData(data);
            setCityAndDate(city, date);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCitySelect = (city) => {
        setCityName(city.name);
        localStorage.setItem('selectedCity', city.name);
    };

    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);

        // Auto-fill logic
        const profile = getProfile(value);
        if (profile) {
            setCityName(profile.cityName);
            setCurrentDate(profile.birthDate);
            setBirthTime(profile.birthTime);
        }
    };

    const loadProfile = (profile) => {
        setName(profile.name);
        setCityName(profile.cityName);
        setCurrentDate(profile.birthDate);
        setBirthTime(profile.birthTime);
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">📊</div>
                    <h1 className="hero-title">Divisional Charts</h1>
                    <p className="hero-subtitle">
                        Comprehensive Vedic astrology charts including Rasi (D1), Navamsa (D9), and Dasamsa (D10)
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && currentDate) {
                            fetchChartData(cityName, currentDate);
                        }
                    }}>
                        <div className="form-group-inline">
                            <div className="input-wrapper">
                                <label className="input-label">Name</label>
                                <input
                                    type="text"
                                    list="profiles-list"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Enter name..."
                                    className="date-input-hero"
                                    required
                                />
                                <datalist id="profiles-list">
                                    {savedProfiles.map((p, i) => (
                                        <option key={i} value={p.name}>{p.cityName} - {p.birthDate}</option>
                                    ))}
                                </datalist>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">City Search</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onSelect={handleCitySelect}
                                    onChange={setCityName}
                                    placeholder="Select city..."
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Birth Date</label>
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    className="date-input-hero"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Birth Time</label>
                                <input
                                    type="time"
                                    value={birthTime}
                                    onChange={(e) => setBirthTime(e.target.value)}
                                    className="date-input-hero"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="get-panchang-btn-hero"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">✨</span>
                                    Generate Charts
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="results-section">
                {error && (
                    <div className="error-box-hero">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Saved Profiles Quick Select */}
                {savedProfiles.length > 0 && !chartData && !isLoading && (
                    <div className="floating-section">
                        <Section title="Quick Load Profile" icon="👥">
                            <div className="profile-pills">
                                {savedProfiles.slice(0, 5).map((p, i) => (
                                    <button
                                        key={i}
                                        className="profile-pill"
                                        onClick={() => loadProfile(p)}
                                    >
                                        <span className="pill-name">{p.name}</span>
                                        <span className="pill-meta">{p.cityName}</span>
                                    </button>
                                ))}
                            </div>
                        </Section>
                    </div>
                )}

                {chartData && !isLoading && (
                    <div className="charts-view">
                        <Section title="Rasi Chart (D1)" icon="🔮">
                            <div className="chart-card">
                                <ChartWheel
                                    houses={chartData.rasiChart?.houses}
                                    title="D1 - Rasi"
                                    lagnaRashi={chartData.rasiChart?.lagnaRashi}
                                />
                            </div>
                        </Section>

                        <Section title="Navamsa Chart (D9)" icon="✨">
                            <div className="chart-card">
                                <ChartWheel
                                    houses={chartData.navamsaChart?.houses}
                                    title="D9 - Navamsa"
                                    lagnaRashi={chartData.navamsaChart?.lagnaRashi}
                                />
                            </div>
                        </Section>

                        {chartData.dasamsa && (
                            <Section title="Dasamsa Chart (D10)" icon="💼">
                                <div className="chart-card">
                                    <ChartWheel
                                        houses={chartData.dasamsa?.houses}
                                        title="D10 - Dasamsa"
                                        lagnaRashi={chartData.dasamsa?.lagnaRashi}
                                    />
                                </div>
                            </Section>
                        )}

                        <div className="information">
                            <span className="info-icon">ℹ️</span>
                            <p className="info">Charts are presented in the North Indian style. Numbers represent the Rashi (Zodiac Sign) in each house.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartsPage;
