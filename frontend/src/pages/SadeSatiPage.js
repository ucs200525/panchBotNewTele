import React, { useState, useEffect } from 'react';
import styles from './SadeSatiPage.module.css';
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
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section ss-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Saturn Transit Analysis</h1>
                    <p className="hero-subtitle">
                        Comprehensive mapping of Sade Sati & Dhaiya cycles across your lifetime
                    </p>
                </div>

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
                                    placeholder="Name..."
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
                            {isLoading ? "Running Analysis..." : "Calculate Cycles"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="results-section">
                {error && <div className="error-box-hero">{error}</div>}

                {sadeSatiData && (
                    <div className="sadesati-results">
                        <Section title="Natal Moon Details">
                            <div className="natal-moon-card">
                                <div className="moon-sign">
                                    <span className="rashi-label">Birth Moon Sign</span>
                                    <span className="rashi-value">{sadeSatiData.natalMoonSign}</span>
                                </div>
                                <p className="moon-info">Sade Sati occurs when Saturn transits the 12th, 1st, and 2nd houses from your natal Moon position. Each phase lasts approximately 2.5 years.</p>
                            </div>

                            {/* Current Transit Highlight Card */}
                            {sadeSatiData.periods.find(p => {
                                const now = new Date();
                                return now >= new Date(p.start) && now <= new Date(p.end);
                            }) && (
                                    <div className="data-card" style={{ border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
                                        <div className="data-card-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Active Transit Right Now</div>
                                        <div className="data-card-value" style={{ fontSize: '1.5rem', marginTop: '10px' }}>
                                            {sadeSatiData.periods.find(p => {
                                                const now = new Date();
                                                return now >= new Date(p.start) && now <= new Date(p.end);
                                            }).phase}
                                        </div>
                                        <div className="data-card-sub" style={{ color: '#b91c1c' }}>
                                            Impact: {sadeSatiData.periods.find(p => {
                                                const now = new Date();
                                                return now >= new Date(p.start) && now <= new Date(p.end);
                                            }).impact}
                                        </div>
                                    </div>
                                )}
                        </Section>

                        <Section title="Lifetime Transit Timeline">
                            <div className={styles.tableWrapper}>
                                <table className="ss-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Cycle Phase</th>
                                            <th>Timing</th>
                                            <th>Saturn Details</th>
                                            <th>Intensity</th>
                                            <th>Predictions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sadeSatiData.periods.map((period, idx) => {
                                            const now = new Date();
                                            const start = new Date(period.start);
                                            const end = new Date(period.end);
                                            const isActive = now >= start && now <= end;

                                            return (
                                                <tr key={idx} className={`${isActive ? 'row-active' : ''} ${period.type}`}>
                                                    <td>{idx + 1}</td>
                                                    <td>
                                                        <div className="phase-cell">
                                                            <span className={`type-tag ${period.type}`}>
                                                                {period.type === 'sadeSati' ? 'Sade Sati' : 'Dhaiya'}
                                                            </span>
                                                            <div className="phase-name">{period.phase}</div>
                                                            {isActive && <div className="now-badge">ACTUAL</div>}
                                                        </div>
                                                    </td>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        <div className="sub-detail">Start: {formatDate(period.start)}</div>
                                                        <div className="sub-detail">End: {formatDate(period.end)}</div>
                                                    </td>
                                                    <td>
                                                        <div className="transit-details">
                                                            <strong>{period.rashi}</strong>
                                                            <div className="sub-detail">Nak: {period.nakshatra}</div>
                                                            {period.isRetrograde && <span className="retro-tag">Retrograde</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`impact-tag ${period.impact?.toLowerCase()}`}>
                                                            {period.impact}
                                                        </span>
                                                    </td>
                                                    <td className="desc-cell">{period.description}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <div className="information">
                            <div className="info-text" style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', marginTop: '2rem' }}>
                                <p style={{ marginBottom: '1rem' }}><strong>💡 Understanding Transits:</strong></p>
                                <p><strong>Sade Sati:</strong> A 7.5-year cycle occurring when Saturn transits the 12th, 1st, and 2nd houses from your Moon sign. It is a period of significant growth, discipline, and karmic rebalancing.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Dhaiya:</strong> A 2.5-year cycle when Saturn transits the 4th or 8th house from your Moon sign. Often associated with career shifts or internal transformations.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default SadeSatiPage;
