import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';
import './DashaPage.css';

const DashaPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [dashaData, setDashaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [birthTime, setBirthTime] = useState('12:00');
    const [expandedDasha, setExpandedDasha] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const toggleDasha = (idx) => {
        setExpandedDasha(expandedDasha === idx ? null : idx);
    };

    const fetchDashaData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            saveProfile(name, { cityName: city, birthDate: date, birthTime });
            setSavedProfiles(getAllProfiles());

            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/dasha/vimshottari`, {
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

            if (!response.ok) throw new Error('Failed to fetch Dasha data');
            const data = await response.json();
            setDashaData(data);
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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">⏳</div>
                    <h1 className="hero-title">Vimshottari Dasha</h1>
                    <p className="hero-subtitle">
                        Explore your life's timeline through the 120-year planetary period system
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && currentDate) {
                            fetchDashaData(cityName, currentDate);
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
                                    View Timeline
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
                {savedProfiles.length > 0 && !dashaData && !isLoading && (
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

                {dashaData && dashaData.birthDetails && (
                    <div className="floating-section">
                        <Section title="Birth Chart Details" icon="🌙">
                            <div className="data-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
                                <div className="data-card">
                                    <div className="data-card-label">Birth Star (Nakshatra)</div>
                                    <div className="data-card-value">
                                        {dashaData.birthDetails.birthStar}
                                        <span style={{fontSize: '0.85rem', color: '#888', marginLeft: '0.5rem'}}>
                                            Pada {dashaData.birthDetails.pada}
                                        </span>
                                    </div>
                                </div>

                                <div className="data-card">
                                    <div className="data-card-label">Moon's Rashi</div>
                                    <div className="data-card-value">{dashaData.birthDetails.moonRashi}</div>
                                    <div className="data-card-sub">
                                        {dashaData.birthDetails.moonLongitude.toFixed(2)}° sidereal
                                    </div>
                                </div>

                                <div className="data-card">
                                    <div className="data-card-label">Birth Dasha Lord</div>
                                    <div className="data-card-value">{dashaData.birthDetails.dashaLord}</div>
                                </div>

                                <div className="data-card">
                                    <div className="data-card-label">Dasha Balance at Birth</div>
                                    <div className="data-card-value">
                                        {dashaData.birthDetails.balanceOfDasha.years}y {dashaData.birthDetails.balanceOfDasha.months}m {dashaData.birthDetails.balanceOfDasha.days}d
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>
                )}

                {dashaData && dashaData.mahadashas && (
                    <div className="floating-section">
                        <Section title="Vimshottari Dasha Timeline" icon="🗓️">
                            <div className="table-wrapper">
                                <table className="dasha-table-modern">
                                    <thead>
                                        <tr>
                                            <th>Planet Period</th>
                                            <th>Starts On</th>
                                            <th>Ends On</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashaData.mahadashas.map((dasha, idx) => {
                                            const now = new Date();
                                            const startDate = new Date(dasha.start);
                                            const endDate = new Date(dasha.end);
                                            const isCurrent = now >= startDate && now <= endDate;
                                            const isExpanded = expandedDasha === idx;

                                            return (
                                                <React.Fragment key={idx}>
                                                    <tr
                                                        className={`mahadasha-row ${isCurrent ? 'current-period-row' : ''} ${isExpanded ? 'active-expansion' : ''}`}
                                                        onClick={() => toggleDasha(idx)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                                            <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▶</span>
                                                            {dasha.lord}
                                                            {isCurrent && <span className="current-badge">Current</span>}
                                                        </td>
                                                        <td>{formatDate(dasha.start)}</td>
                                                        <td>{formatDate(dasha.end)}</td>
                                                        <td>{dasha.years} years</td>
                                                    </tr>
                                                    {isExpanded && dasha.antardashas && dasha.antardashas.map((sub, sIdx) => {
                                                        const subStart = new Date(sub.start);
                                                        const subEnd = new Date(sub.end);
                                                        const isSubCurrent = now >= subStart && now <= subEnd;

                                                        return (
                                                            <tr key={`sub-${idx}-${sIdx}`} className={`antardasha-row ${isSubCurrent ? 'current-sub-period' : ''}`}>
                                                                <td className="sub-lord-cell">
                                                                    <span className="sub-dash-connector">└─</span>
                                                                    {sub.lord}
                                                                    {isSubCurrent && <span className="sub-current-badge">Current Sub</span>}
                                                                </td>
                                                                <td>{formatDate(sub.start)}</td>
                                                                <td>{formatDate(sub.end)}</td>
                                                                <td>{sub.years} y</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="information">
                                <span className="info-icon">ℹ️</span>
                                <p className="info">Vimshottari Dasha periods indicate the major planetary influences throughout your lifetime based on the Moon's position at birth. Click on any Mahadasha to see its sub-periods (Antardashas).</p>
                            </div>
                        </Section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashaPage;
