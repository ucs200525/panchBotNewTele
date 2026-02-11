import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getAllProfiles } from '../utils/profileStorage';
import styles from './HoraPage.module.css';
import '../pages/hero-styles.css';

const horaInfo = {
    'Sun': {
        planet: 'Sun (Surya)',
        bestFor: 'Authority, Government work, Leadership, Medical matters, Health',
        className: styles.badgeSun
    },
    'Moon': {
        planet: 'Moon (Chandra)',
        bestFor: 'Family, Liquids, Ladies, Emotional peace, Traveling',
        className: styles.badgeMoon
    },
    'Mars': {
        planet: 'Mars (Mangala)',
        bestFor: 'Competition, Property, Physical exertion, Logic',
        className: styles.badgeMars
    },
    'Mercury': {
        planet: 'Mercury (Budha)',
        bestFor: 'Business, Trade, Accounts, Writing, Education',
        className: styles.badgeMerc
    },
    'Jupiter': {
        planet: 'Jupiter (Guru)',
        bestFor: 'Knowledge, Expansion, Children, Wealth, Religious deeds',
        className: styles.badgeJup
    },
    'Venus': {
        planet: 'Venus (Shukra)',
        bestFor: 'Love, Luxury, Art, Entertainment, Marriage, Clothes',
        className: styles.badgeVen
    },
    'Saturn': {
        planet: 'Saturn (Shani)',
        bestFor: 'Discipline, Labor, Patience, Dealing with old things',
        className: styles.badgeSat
    }
};

const HoraPage = () => {
    const { setCityAndDate } = useAuth();
    const [name, setName] = useState('');
    const [cityName, setCityName] = useState(() => localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [horaData, setHoraData] = useState(null);
    const [choghadiyaData, setChoghadiyaData] = useState(null);
    const [panchangSummary, setPanchangSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchAllData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
            if (name) {
                saveProfile(name, { cityName: city, birthDate: date });
                setSavedProfiles(getAllProfiles());
            }

            // Fetch Hora Data
            const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${city}`);
            if (!geoResponse.ok) throw new Error('Could not find city');
            const coords = await geoResponse.json();

            const horaResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/lagna/hora`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    lat: coords.lat,
                    lng: coords.lng
                })
            });

            if (!horaResponse.ok) throw new Error('Failed to fetch Hora data');
            const hData = await horaResponse.json();
            setHoraData(hData.horas);

            // Fetch Panchang/Choghadiya Data
            const panchangResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(city)}&date=${date}`);
            if (panchangResponse.ok) {
                const pData = await panchangResponse.json();
                setChoghadiyaData(pData.choghadiya);
                setPanchangSummary({
                    sunrise: pData.sunrise,
                    sunset: pData.sunset,
                    weekday: pData.weekday,
                    tithi: pData.tithi.name
                });
            }

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
                    <h1 className="hero-title">Shubha Hora</h1>
                    <p className="hero-subtitle">
                        Planetary hours & auspicious periods powered by Swiss Ephemeris
                    </p>
                </div>

                <div className="hero-form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (cityName && currentDate) {
                            fetchAllData(cityName, currentDate);
                        }
                    }}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onSelect={handleCitySelect}
                                    onChange={setCityName}
                                    placeholder="Search city"
                                />
                            </div>
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">Date</label>
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    className="date-input-hero"
                                />
                            </div>
                        </div>

                        <button type="submit" className="get-panchang-btn-hero" disabled={isLoading || !cityName}>
                            {isLoading ? 'Calculating...' : 'Generate Hora Report'}
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero">{error}</div>}

            {horaData && (
                <div className="results-section">

                    {/* Summary Bar */}
                    {panchangSummary && (
                        <div className={styles.summaryBar}>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>LOCATION</div>
                                <div className={styles.summaryValue}>{cityName}</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>SUNRISE / SUNSET</div>
                                <div className={styles.summaryValue}>{panchangSummary.sunrise} / {panchangSummary.sunset}</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>DAY</div>
                                <div className={styles.summaryValue}>{panchangSummary.weekday}</div>
                            </div>
                            <div className={styles.summaryItem}>
                                <div className={styles.summaryLabel}>CURR. TITHI</div>
                                <div className={styles.summaryValue}>{panchangSummary.tithi}</div>
                            </div>
                        </div>
                    )}

                    {/* Day Horas Table */}
                    <div className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitle}>☀️ Day Horas</h2>
                        <p className={styles.sectionSubtitle}>Planetary hours from Sunrise to Sunset</p>
                        <div className={styles.tableWrapper}>
                            <table className={styles.panchangTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Hora Lord</th>
                                        <th>Time Period</th>
                                        <th>Best For / Activities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dayHoras.map((hora, idx) => (
                                        <tr key={idx} className={`${styles.horaRow} ${styles[hora.lord.toLowerCase() + 'Hora']}`}>
                                            <td style={{ fontWeight: 700 }}>{hora.index}</td>
                                            <td>
                                                <span className={`${styles.badge} ${horaInfo[hora.lord]?.className}`}>
                                                    {hora.lord}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#4f46e5' }}>
                                                {formatTime(hora.start)} - {formatTime(hora.end)}
                                            </td>
                                            <td style={{ color: '#444', fontSize: '14px' }}>
                                                {horaInfo[hora.lord]?.bestFor || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Night Horas Table */}
                    <div className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitle}>🌙 Night Horas</h2>
                        <p className={styles.sectionSubtitle}>Planetary hours from Sunset to tomorrow's Sunrise</p>
                        <div className={styles.tableWrapper}>
                            <table className={styles.panchangTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Hora Lord</th>
                                        <th>Time Period</th>
                                        <th>Best For / Activities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nightHoras.map((hora, idx) => (
                                        <tr key={idx} className={`${styles.horaRow} ${styles[hora.lord.toLowerCase() + 'Hora']}`}>
                                            <td style={{ fontWeight: 700 }}>{hora.index}</td>
                                            <td>
                                                <span className={`${styles.badge} ${horaInfo[hora.lord]?.className}`}>
                                                    {hora.lord}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#4f46e5' }}>
                                                {formatTime(hora.start)} - {formatTime(hora.end)}
                                            </td>
                                            <td style={{ color: '#444', fontSize: '14px' }}>
                                                {horaInfo[hora.lord]?.bestFor || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <div className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitle}>✨ Planetary Hora Influence</h2>
                        <p className={styles.sectionSubtitle}>Detailed characteristics and recommended activities for each ruling planet</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                            {Object.entries(horaInfo).map(([name, info]) => (
                                <div key={name} className={styles.tipCard} style={{ borderLeft: '4px solid', borderColor: 'currentColor' }}>
                                    <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={info.className} style={{ width: '12px', height: '12px', borderRadius: '50%' }}></span>
                                        {info.planet}
                                    </h3>
                                    <p style={{ fontWeight: 600, margin: '0.5rem 0', color: '#1e293b' }}>Best For:</p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
                                        {info.bestFor}
                                    </p>
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '13px', fontStyle: 'italic', color: '#64748b' }}>
                                        {name === 'Sun' && "Good for government favors and physical vitality."}
                                        {name === 'Moon' && "Good for household work and mental peace."}
                                        {name === 'Mars' && "Avoid major decisions; focus on courage and technical tasks."}
                                        {name === 'Mercury' && "Excellent for business deals, writing, and communication."}
                                        {name === 'Jupiter' && "The most auspicious hora for starting new, significant ventures."}
                                        {name === 'Venus' && "Favorable for romantic pursuits and luxury purchases."}
                                        {name === 'Saturn' && "Slow but steady. Good for chores that require discipline."}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitle}>💡 How to use Horas</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                            <div className={styles.tipCard}>
                                <h4 style={{ color: '#4f46e5', marginBottom: '0.5rem' }}>Match the Planet</h4>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>A Sun Hora is great for power, while a Venus Hora is best for luxury or entertainment.</p>
                            </div>
                            <div className={styles.tipCard}>
                                <h4 style={{ color: '#4f46e5', marginBottom: '0.5rem' }}>Sunrise Rule</h4>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>The first Hora of any day is always ruled by the planet of that weekday.</p>
                            </div>
                            <div className={styles.tipCard}>
                                <h4 style={{ color: '#4f46e5', marginBottom: '0.5rem' }}>Transition</h4>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>Try starting work at the beginning of a Hora for maximum planetary alignment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoraPage;
