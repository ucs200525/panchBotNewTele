import React, { useState, useEffect } from 'react';
import { Section } from '../components/layout';
import { CityAutocomplete } from '../components/forms';
import ChartWheel from '../components/charts/ChartWheel';
import { useAuth } from '../context/AuthContext';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';

const VARGA_GROUPS = {
    'Basic': ['D1', 'D9', 'D10'],
    'Physical & Wealth': ['D2', 'D3', 'D4', 'D16'],
    'Growth & Success': ['D7', 'D12', 'D24', 'D27'],
    'Subtle & Karma': ['D20', 'D30', 'D40', 'D45', 'D60']
};

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
    const [activeTab, setActiveTab] = useState('Basic');

    useEffect(() => {
        setSavedProfiles(getAllProfiles());
    }, []);

    const fetchChartData = async (city, date) => {
        setIsLoading(true);
        setError(null);
        try {
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
                    lng: coords.lng,
                    tzone: coords.timeZone
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
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Shodashvarga - 16 Charts</h1>
                    <p className="hero-subtitle">
                        Advanced Vedic Divisional Charts with high-precision calculations • Comprehensive Life Analysis
                    </p>
                </div>

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
                            {isLoading ? "Calculating Shodashvarga..." : "Generate Shodashvarga"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="results-section">
                {error && <div className="error-box-hero">{error}</div>}

                {savedProfiles.length > 0 && !chartData && !isLoading && (
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

                {chartData && (
                    <div className="shodashvarga-container">
                        <div className="floating-section analysis-report">
                            <h2 className="section-title">✨ Planetary Strength Report</h2>
                            <p className="section-subtitle">Analysis of planets across all 16 divisional charts</p>
                            <div className="strength-grid">
                                {chartData.strengthReport.map((p, i) => (
                                    <div key={i} className="strength-card">
                                        <div className="strength-header">
                                            <span className="planet-title">{p.name}</span>
                                            <span className={`strength-badge ${p.vargottamaCount > 2 ? 'high' : 'normal'}`}>
                                                {p.vargottamaCount} Vargottama
                                            </span>
                                        </div>
                                        <div className="strength-info">
                                            {p.vargottamaCount >= 2 ? (
                                                <p className="strength-desc">Exceptionally strong. Highly positive results in its dasha.</p>
                                            ) : p.vargottamaCount === 1 ? (
                                                <p className="strength-desc">Resilient. Consistent results across mental and physical planes.</p>
                                            ) : (
                                                <p className="strength-desc">Normal strength. Results depend on transit and aspects.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="varga-tabs">
                            {Object.keys(VARGA_GROUPS).map(group => (
                                <button
                                    key={group}
                                    className={`varga-tab ${activeTab === group ? 'active' : ''}`}
                                    onClick={() => setActiveTab(group)}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        <div className="charts-grid-view">
                            {VARGA_GROUPS[activeTab].map(vKey => {
                                const vData = chartData.charts[vKey];
                                if (!vData) return null;

                                return (
                                    <div key={vKey} className="varga-card-wrapper">
                                        <div className="varga-info-header">
                                            <h3>{vData.name}</h3>
                                            <div className="info-tooltip-container">
                                                <span className="info-icon">ⓘ</span>
                                                <div className="info-tooltip">{vData.description}</div>
                                            </div>
                                        </div>
                                        <div className="chart-card compact">
                                            <ChartWheel
                                                houses={vData.houses}
                                                title={`${vData.name} - Asc: ${vData.lagnaRashi}`}
                                                lagnaRashi={vData.lagnaRashi}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .shodashvarga-container { margin-top: 2rem; }
                .varga-tabs { display: flex; gap: 10px; margin-bottom: 2rem; justify-content: center; flex-wrap: wrap; }
                .varga-tab { padding: 10px 24px; border-radius: 30px; border: 1px solid #cbd5e0; background: #ffffff; color: #4a5568 !important; cursor: pointer; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .varga-tab.active { background: #667eea !important; color: white !important; border-color: #667eea; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
                .varga-tab:hover:not(.active) { background: #f7fafc; border-color: #a0aec0; }
                .charts-grid-view { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 30px; }
                .varga-card-wrapper { background: var(--glass-bg); border-radius: 20px; border: 1px solid var(--glass-border); padding: 20px; box-shadow: var(--shadow-sm); transition: all 0.3s; }
                .varga-card-wrapper:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
                .varga-info-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--color-border); padding-bottom: 10px; }
                .varga-info-header h3 { margin: 0; font-size: 1.1rem; color: var(--color-primary); }
                .info-icon { font-size: 1.2rem; cursor: pointer; color: var(--color-text-secondary); opacity: 0.6; }
                .info-tooltip-container { position: relative; }
                .info-tooltip { position: absolute; bottom: 100%; right: 0; width: 250px; background: #1e293b; color: white; padding: 12px; border-radius: 10px; font-size: 0.8rem; line-height: 1.4; opacity: 0; visibility: hidden; transition: all 0.3s; z-index: 100; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
                .info-tooltip-container:hover .info-tooltip { opacity: 1; visibility: visible; transform: translateY(-5px); }
                .strength-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 20px; }
                .strength-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
                .strength-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .planet-title { font-weight: 700; color: #1e293b; }
                .strength-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
                .strength-badge.high { background: #dcfce7; color: #166534; }
                .strength-badge.normal { background: #f1f5f9; color: #475569; }
                .strength-desc { font-size: 0.8rem; margin: 0; color: #64748b; line-height: 1.4; }
                .analysis-report { margin-bottom: 30px !important; }
                @media (max-width: 768px) { .charts-grid-view { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
};

export default ChartsPage;
