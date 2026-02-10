import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';

const HoraPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [horaData, setHoraData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchHoraData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            saveProfile(name, { cityName: city, birthDate: date });
            setSavedProfiles(getAllProfiles());

            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lagna/hora`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!response.ok) throw new Error('Failed to fetch Hora data');
            const data = await response.json();
            setHoraData(data.horas);
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

    const formatTime = (timeObj) => {
        if (!timeObj) return '--:--';
        try {
            const date = new Date(timeObj);
            if (isNaN(date.getTime())) return '--:--';
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return '--:--';
        }
    };

    const dayHoras = horaData ? horaData.filter(h => h.type === 'Day') : [];
    const nightHoras = horaData ? horaData.filter(h => h.type === 'Night') : [];

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Hora (Planetary Hours)</h1>
                    <p className="hero-subtitle">
                        Analyze the 24 planetary hours of the day to find the most auspicious timings
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && currentDate) {
                            fetchHoraData(cityName, currentDate);
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
                                <label className="input-label">Location</label>
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
                                "Get Planetary Hours"
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
                {savedProfiles.length > 0 && !horaData && !isLoading && (
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

                {horaData && (
                    <div className="hora-results">
                        <div className="floating-section">
                            <Section title="Day Horas">
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Hora Lord</th>
                                                <th>Time Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayHoras.map((hora, idx) => (
                                                <tr key={idx}>
                                                    <td>{hora.index}</td>
                                                    <td style={{ fontWeight: 700 }}>{hora.lord}</td>
                                                    <td>{formatTime(hora.start)} - {formatTime(hora.end)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Section>
                        </div>

                        <div className="floating-section">
                            <Section title="Night Horas">
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Hora Lord</th>
                                                <th>Time Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nightHoras.map((hora, idx) => (
                                                <tr key={idx}>
                                                    <td>{hora.index}</td>
                                                    <td style={{ fontWeight: 700 }}>{hora.lord}</td>
                                                    <td>{formatTime(hora.start)} - {formatTime(hora.end)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Section>
                        </div>

                        <div className="floating-section">
                            <div className="information">
                                <p className="info">Each hora is approximately 1 hour long and is ruled by a specific planet. Choose activities that align with the ruling planet's nature.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HoraPage;
