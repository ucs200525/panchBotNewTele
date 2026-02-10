import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';

const LagnaPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [lagnaData, setLagnaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchLagnaData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            saveProfile(name, { cityName: city, birthDate: date });
            setSavedProfiles(getAllProfiles());

            // First, fetch coordinates for the city
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            // Then fetch panchang data with coordinates
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/panchang`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city,
                    date,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            setLagnaData(data.lagnas);
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
        }
    };

    const loadProfile = (profile) => {
        setName(profile.name);
        setCityName(profile.cityName);
        setCurrentDate(profile.birthDate);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '--:--';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Lagna (Ascendant)</h1>
                    <p className="hero-subtitle">
                        Daily transitions of the rising zodiac sign at your location
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && currentDate) {
                            fetchLagnaData(cityName, currentDate);
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
                                <label className="input-label">Date</label>
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
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
                                "Calculate Lagnas"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="results-section">
                {error && (
                    <div className="error-box-hero">
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                )}

                {/* Saved Profiles Quick Select */}
                {savedProfiles.length > 0 && !lagnaData && !isLoading && (
                    <div className="floating-section">
                        <Section title="Quick Load Profile">
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

                {lagnaData && lagnaData.length > 0 && (
                    <div className="floating-section">
                        <Section title="Daily Lagna Periods">
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Zodiac Sign</th>
                                            <th>Starts On</th>
                                            <th>Ends On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lagnaData.map((lagna, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 700 }}>
                                                    <span style={{ marginRight: '8px', opacity: 0.7 }}>{lagna.symbol}</span>
                                                    {lagna.name}
                                                </td>
                                                <td>{formatTime(lagna.startTime)}</td>
                                                <td>{formatTime(lagna.endTime)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="information">
                                <p className="info">Lagna (Ascendant) duration varies based on geographical latitude and the day of the year. Each sign typically rises for about 2 hours, but this is an approximation.</p>
                            </div>
                        </Section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LagnaPage;
