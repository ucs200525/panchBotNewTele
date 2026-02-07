import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';
import './SadeSatiPage.css';

const SadeSatiPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [birthDate, setBirthDate] = useState('1990-01-01');
    const [birthTime, setBirthTime] = useState('12:00');
    const [sadeSatiData, setSadeSatiData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchSadeSatiData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            saveProfile(name, { cityName: city, birthDate: date, birthTime });
            setSavedProfiles(getAllProfiles());

            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/planetary/sade-sati`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    time: birthTime,
                    lat: coords.lat,
                    lng: coords.lng,
                    tzone: coords.timeZone
                })
            });

            if (!response.ok) throw new Error('Failed to fetch Sade Sati data');
            const data = await response.json();
            setSadeSatiData(data);
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

        const profile = getProfile(value);
        if (profile) {
            setCityName(profile.cityName);
            setBirthDate(profile.birthDate);
            setBirthTime(profile.birthTime);
        }
    };

    const loadProfile = (profile) => {
        setName(profile.name);
        setCityName(profile.cityName);
        setBirthDate(profile.birthDate);
        setBirthTime(profile.birthTime);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section ss-hero">
                <div className="hero-content">
                    <div className="hero-icon">🪐</div>
                    <h1 className="hero-title">Sade Sati Timeline</h1>
                    <p className="hero-subtitle">
                        Analyze the 7.5-year transit periods of Saturn and their impact on your life
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && birthDate) {
                            fetchSadeSatiData(cityName, birthDate);
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
                                <label className="input-label">Birth City</label>
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
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="date-input-hero"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Time</label>
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
                                    Analyzing Transit...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">✨</span>
                                    Calculate Sade Sati
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
                {savedProfiles.length > 0 && !sadeSatiData && !isLoading && (
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

                {sadeSatiData && (
                    <div className="sadesati-results">
                        <Section title="Natal Moon Details" icon="🌙">
                            <div className="natal-moon-card">
                                <div className="moon-sign">
                                    <span className="rashi-label">Natal Moon Sign:</span>
                                    <span className="rashi-value">{sadeSatiData.natalMoonSign}</span>
                                </div>
                                <p className="moon-info">Sade Sati is calculated based on Saturn's transit through the 12th, 1st, and 2nd houses from this sign.</p>
                            </div>
                        </Section>

                        <Section title="Transit Timeline" icon="📅">
                            <div className="timeline-container">
                                {sadeSatiData.periods.map((period, idx) => {
                                    const now = new Date();
                                    const start = new Date(period.start);
                                    const end = new Date(period.end);
                                    const isActive = now >= start && now <= end;

                                    return (
                                        <div key={idx} className={`timeline-item ${period.type} ${isActive ? 'active-transit' : ''}`}>
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="period-header">
                                                    <span className={`period-badge ${period.type}`}>
                                                        {period.type === 'sadeSati' ? 'Sade Sati' : 'Dhaiya'}
                                                    </span>
                                                    {isActive && <span className="active-badge">Currently Active</span>}
                                                    <span className="period-phase">{period.phase}</span>
                                                </div>
                                                <div className="period-dates">
                                                    {formatDate(period.start)} — {formatDate(period.end)}
                                                </div>
                                                <div className="period-rashi">
                                                    Saturn in <strong>{period.rashi}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>

                        <div className="information">
                            <span className="info-icon">ℹ️</span>
                            <div className="info-text">
                                <p><strong>Sade Sati:</strong> A 7.5-year period when Saturn transits the 12th, 1st, and 2nd houses from your natal Moon.</p>
                                <p><strong>Dhaiya:</strong> A 2.5-year period when Saturn transits the 4th or 8th house from your natal Moon.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SadeSatiPage;
