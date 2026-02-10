import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import './hero-styles.css';
import './DailyPanchang.css';

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
            console.log('Panchang Data Received:', result); // Debug log
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
            <div className="hero-section panchang-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Daily Panchang
                    </h1>
                    <p className="hero-subtitle">
                        Complete Vedic Calendar with Swiss Ephemeris • Precise Astronomical Calculations
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
                <div className="results-section panchang-results">

                    {/* Sun & Moon Info Card */}
                    <div className="info-card-grid">
                        <div className="info-card sun-card">
                            <div className="card-content">
                                <h3>Sunrise</h3>
                                <p className="card-value">{panchangData.sunrise}</p>
                            </div>
                        </div>
                        <div className="info-card moon-card">
                            <div className="card-content">
                                <h3>Sunset</h3>
                                <p className="card-value">{panchangData.sunset}</p>
                            </div>
                        </div>
                        <div className="info-card vara-card">
                            <div className="card-content">
                                <h3>Weekday (Vara)</h3>
                                <p className="card-value">{panchangData.weekday}</p>
                                {panchangData.varaLord && (
                                    <p className="card-subtext">{panchangData.varaLord.planet}</p>
                                )}
                            </div>
                        </div>
                        {panchangData.moonPhase && (
                            <div className="info-card phase-card">
                                <div className="card-content">
                                    <h3>Moon Phase</h3>
                                    <p className="card-value">{panchangData.moonPhase.name}</p>
                                    <p className="card-subtext">{panchangData.moonPhase.illumination} illuminated</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vedic Calendar */}
                    {(panchangData.masa || panchangData.samvatsara || panchangData.rtu) && (
                        <div className="panchang-section calendar-section">
                            <h2 className="section-header">
                                Vedic Calendar
                            </h2>
                            <div className="info-card-grid three-col">
                                {panchangData.masa && (
                                    <div className="info-card compact">
                                        <div className="card-label">Masa (Month)</div>
                                        <div className="card-value">{panchangData.masa.name}</div>
                                        <div className="card-subtext">{panchangData.masa.type}</div>
                                    </div>
                                )}
                                {panchangData.samvatsara && (
                                    <div className="info-card compact">
                                        <div className="card-label">Samvatsara</div>
                                        <div className="card-value">{panchangData.samvatsara.name}</div>
                                        <div className="card-subtext">Year {panchangData.samvatsara.year}</div>
                                    </div>
                                )}
                                {panchangData.rtu && (
                                    <div className="info-card compact">
                                        <div className="card-label">Rtu (Season)</div>
                                        <div className="card-value">{panchangData.rtu.name}</div>
                                        <div className="card-subtext">{panchangData.rtu.season}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Core Panchanga Elements */}
                    <div className="panchang-section core-section">
                        <h2 className="section-header">
                            Panchanga Elements
                        </h2>
                        <div className="elements-grid">
                            <div className="element-card tithi-card">
                                <div className="element-name">Tithi</div>
                                <div className="element-value">{panchangData.tithi.name}</div>
                                <div className="element-detail">#{panchangData.tithi.number} • {panchangData.paksha}</div>
                            </div>
                            <div className="element-card nakshatra-card">
                                <div className="element-name">Nakshatra</div>
                                <div className="element-value">{panchangData.nakshatra.name}</div>
                                <div className="element-detail">#{panchangData.nakshatra.number}</div>
                            </div>
                            <div className="element-card yoga-card">
                                <div className="element-name">Yoga</div>
                                <div className="element-value">{panchangData.yoga.name}</div>
                                <div className="element-detail">#{panchangData.yoga.number}</div>
                            </div>
                            <div className="element-card karana-card">
                                <div className="element-name">Karana</div>
                                <div className="element-value">{panchangData.karana.name}</div>
                                <div className="element-detail">#{panchangData.karana.number}</div>
                            </div>
                        </div>
                    </div>

                    {/* Auspicious Timings */}
                    <div className="panchang-section auspicious-section">
                        <h2 className="section-header">
                            Auspicious Timings
                        </h2>
                        <div className="timings-grid">
                            {panchangData.abhijitMuhurat && (
                                <div className="timing-card shubh">
                                    <div className="timing-name">Abhijit Muhurat</div>
                                    <div className="timing-time">
                                        {panchangData.abhijitMuhurat.start} - {panchangData.abhijitMuhurat.end}
                                    </div>
                                    <div className="timing-desc">Most auspicious period</div>
                                </div>
                            )}
                            {panchangData.brahmaMuhurat && (
                                <div className="timing-card shubh">
                                    <div className="timing-name">Brahma Muhurat</div>
                                    <div className="timing-time">
                                        {panchangData.brahmaMuhurat.start} - {panchangData.brahmaMuhurat.end}
                                    </div>
                                    <div className="timing-desc">Sacred meditation time</div>
                                </div>
                            )}
                            {panchangData.abhijitLagna && panchangData.abhijitLagna.start !== 'N/A' && (
                                <div className="timing-card shubh">
                                    <div className="timing-name">Abhijit Lagna</div>
                                    <div className="timing-time">
                                        {panchangData.abhijitLagna.start} - {panchangData.abhijitLagna.end}
                                    </div>
                                    <div className="timing-desc">{panchangData.abhijitLagna.rashi}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pancha Rahita Muhurat */}
                    {panchangData.panchaRahitaMuhurat && panchangData.panchaRahitaMuhurat.length > 0 && (
                        <div className="panchang-section rahita-section">
                            <h2 className="section-header">
                                Pancha Rahita Muhurat
                            </h2>
                            <p className="section-subtitle">
                                Periods free from all inauspicious timings - Best for important activities
                            </p>
                            <div className="rahita-grid">
                                {panchangData.panchaRahitaMuhurat.map((period, idx) => (
                                    <div key={idx} className="rahita-card">
                                        <div className="rahita-number">{idx + 1}</div>
                                        <div className="rahita-time">
                                            <span className="start">{period.start}</span>
                                            <span className="separator">→</span>
                                            <span className="end">{period.end}</span>
                                        </div>
                                        <div className="rahita-duration">{period.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inauspicious Timings */}
                    <div className="panchang-section inauspicious-section">
                        <h2 className="section-header">
                            Inauspicious Timings (Avoid)
                        </h2>
                        <div className="timings-grid">
                            {panchangData.rahuKaal && panchangData.rahuKaal.start && (
                                <div className="timing-card ashubh">
                                    <div className="timing-name">Rahu Kaal</div>
                                    <div className="timing-time">
                                        {panchangData.rahuKaal.start} - {panchangData.rahuKaal.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.yamaganda && panchangData.yamaganda.start && (
                                <div className="timing-card ashubh">
                                    <div className="timing-name">Yamaganda</div>
                                    <div className="timing-time">
                                        {panchangData.yamaganda.start} - {panchangData.yamaganda.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.gulika && panchangData.gulika.start && (
                                <div className="timing-card ashubh">
                                    <div className="timing-name">Gulika Kalam</div>
                                    <div className="timing-time">
                                        {panchangData.gulika.start} - {panchangData.gulika.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.varjyam && panchangData.varjyam.start && (
                                <div className="timing-card ashubh">
                                    <div className="timing-name">Varjyam</div>
                                    <div className="timing-time">
                                        {panchangData.varjyam.start} - {panchangData.varjyam.end}
                                    </div>
                                    <div className="timing-desc">{panchangData.varjyam.ghatis} ghatis - Tithi-based</div>
                                </div>
                            )}
                            {panchangData.durMuhurat && panchangData.durMuhurat.map((dur, idx) => (
                                <div key={idx} className="timing-card ashubh">
                                    <div className="timing-name">{dur.name}</div>
                                    <div className="timing-time">
                                        {dur.start} - {dur.end}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Choghadiya - Day */}
                    {panchangData.choghadiya && panchangData.choghadiya.day && panchangData.choghadiya.day.length > 0 && (
                        <div className="panchang-section choghadiya-section">
                            <h2 className="section-header">
                                Choghadiya (Day)
                            </h2>
                            <div className="choghadiya-grid">
                                {panchangData.choghadiya.day.map((chog, idx) => (
                                    <div key={idx} className={`chog-card ${chog.type.toLowerCase()}`}>
                                        <div className="chog-badge">{chog.type === 'Good' ? '✅' : '❌'}</div>
                                        <div className="chog-name">{chog.name}</div>
                                        <div className="chog-time">{chog.start} - {chog.end}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Choghadiya - Night */}
                    {panchangData.choghadiya && panchangData.choghadiya.night && panchangData.choghadiya.night.length > 0 && (
                        <div className="panchang-section choghadiya-section">
                            <h2 className="section-header">
                                Choghadiya (Night)
                            </h2>
                            <div className="choghadiya-grid">
                                {panchangData.choghadiya.night.map((chog, idx) => (
                                    <div key={idx} className={`chog-card ${chog.type.toLowerCase()}`}>
                                        <div className="chog-name">{chog.name}</div>
                                        <div className="chog-time">{chog.start} - {chog.end}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Panchanga Transitions */}
                    {panchangData.lagnas && panchangData.lagnas.length > 0 && (
                        <div className="panchang-section lagna-section">
                            <h2 className="section-header">
                                Lagna Times (Ascendant Changes)
                            </h2>
                            <p className="section-subtitle">
                                All 12 rashi (zodiac sign) ascendant changes throughout the day - Calculated with Swiss Ephemeris
                            </p>
                            <div className="lagna-grid">
                                {panchangData.lagnas.map((lagna, idx) => (
                                    <div key={idx} className="lagna-card">
                                        <div className="lagna-name">{lagna.name}</div>
                                        <div className="lagna-number">#{lagna.number}</div>
                                        <div className="lagna-time">
                                            {lagna.startTime} → {lagna.endTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {panchangData.tithis && panchangData.tithis.length > 1 && (
                        <div className="panchang-section transitions-section">
                            <h2 className="section-header">
                                Tithi Transitions
                            </h2>
                            <div className="transitions-list">
                                {panchangData.tithis.map((tithi, idx) => (
                                    <div key={idx} className="transition-item">
                                        <div className="trans-name">{tithi.name} #{tithi.number}</div>
                                        <div className="trans-times">
                                            <span>{tithi.startTime || 'Previous day'}</span>
                                            <span className="trans-arrow">→</span>
                                            <span>{tithi.endTime || 'Next day'}</span>
                                        </div>
                                        <div className="trans-paksha">{tithi.paksha}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {panchangData.nakshatras && panchangData.nakshatras.length > 1 && (
                        <div className="panchang-section transitions-section">
                            <h2 className="section-header">
                                Nakshatra Transitions
                            </h2>
                            <div className="transitions-list">
                                {panchangData.nakshatras.map((nak, idx) => (
                                    <div key={idx} className="transition-item">
                                        <div className="trans-name">{nak.name} #{nak.number}</div>
                                        <div className="trans-times">
                                            <span>{nak.startTime || 'Previous day'}</span>
                                            <span className="trans-arrow">→</span>
                                            <span>{nak.endTime || 'Next day'}</span>
                                        </div>
                                        {nak.lord && <div className="trans-paksha">Lord: {nak.lord}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyPanchang;
