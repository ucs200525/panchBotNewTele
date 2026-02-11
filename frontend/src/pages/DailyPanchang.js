import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import '../pages/hero-styles.css';
import styles from './DailyPanchang.module.css';

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
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Daily Panchang
                    </h1>
                    <p className="hero-subtitle">
                        Complete Vedic Calendar with Swiss Ephemeris • Precise Astronomical Calculations
                    </p>

                    <form className="hero-form" onSubmit={handleGetPanchang}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 1 }}>
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
                <div className="results-section panchangResults">

                    {/* Sun & Moon Info Card */}
                    <div className={styles.infoCardGrid}>
                        <div className={`${styles.infoCard} sun-card`}>
                            <div className={styles.cardContent}>
                                <h3>Sunrise</h3>
                                <p className={styles.cardValue}>{panchangData.sunrise}</p>
                            </div>
                        </div>
                        <div className={`${styles.infoCard} moon-card`}>
                            <div className={styles.cardContent}>
                                <h3>Sunset</h3>
                                <p className={styles.cardValue}>{panchangData.sunset}</p>
                            </div>
                        </div>
                        <div className={`${styles.infoCard} vara-card`}>
                            <div className={styles.cardContent}>
                                <h3>Weekday (Vara)</h3>
                                <p className={styles.cardValue}>{panchangData.weekday}</p>
                                {panchangData.varaLord && (
                                    <p className={styles.cardSubtext}>{panchangData.varaLord.planet}</p>
                                )}
                            </div>
                        </div>
                        {panchangData.moonPhase && (
                            <div className={`${styles.infoCard} phase-card`}>
                                <div className={styles.cardContent}>
                                    <h3>Moon Phase</h3>
                                    <p className={styles.cardValue}>{panchangData.moonPhase.name}</p>
                                    <p className={styles.cardSubtext}>{panchangData.moonPhase.illumination} illuminated</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vedic Calendar */}
                    {(panchangData.masa || panchangData.samvatsara || panchangData.rtu) && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Vedic Calendar
                            </h2>
                            <div className={`${styles.infoCardGrid} ${styles.threeCol}`}>
                                {panchangData.masa && (
                                    <div className={`${styles.infoCard} ${styles.compact}`}>
                                        <div className={styles.cardLabel}>Masa (Month)</div>
                                        <div className={styles.cardValue}>{panchangData.masa.name}</div>
                                        <div className={styles.cardSubtext}>{panchangData.masa.type}</div>
                                    </div>
                                )}
                                {panchangData.samvatsara && (
                                    <div className={`${styles.infoCard} ${styles.compact}`}>
                                        <div className={styles.cardLabel}>Samvatsara</div>
                                        <div className={styles.cardValue}>{panchangData.samvatsara.name}</div>
                                        <div className={styles.cardSubtext}>Year {panchangData.samvatsara.year}</div>
                                    </div>
                                )}
                                {panchangData.rtu && (
                                    <div className={`${styles.infoCard} ${styles.compact}`}>
                                        <div className={styles.cardLabel}>Rtu (Season)</div>
                                        <div className={styles.cardValue}>{panchangData.rtu.name}</div>
                                        <div className={styles.cardSubtext}>{panchangData.rtu.season}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Core Panchanga Elements */}
                    <div className={styles.panchangSection}>
                        <h2 className={styles.sectionHeader}>
                            Panchanga Elements
                        </h2>
                        <div className={styles.elementsGrid}>
                            <div className={styles.elementCard}>
                                <div className={styles.elementName}>Tithi</div>
                                <div className={styles.elementValue}>{panchangData.tithi.name}</div>
                                <div className={styles.elementDetail}>#{panchangData.tithi.number} • {panchangData.paksha}</div>
                            </div>
                            <div className={styles.elementCard}>
                                <div className={styles.elementName}>Nakshatra</div>
                                <div className={styles.elementValue}>{panchangData.nakshatra.name}</div>
                                <div className={styles.elementDetail}>#{panchangData.nakshatra.number}</div>
                            </div>
                            <div className={styles.elementCard}>
                                <div className={styles.elementName}>Yoga</div>
                                <div className={styles.elementValue}>{panchangData.yoga.name}</div>
                                <div className={styles.elementDetail}>#{panchangData.yoga.number}</div>
                            </div>
                            <div className={styles.elementCard}>
                                <div className={styles.elementName}>Karana</div>
                                <div className={styles.elementValue}>{panchangData.karana.name}</div>
                                <div className={styles.elementDetail}>#{panchangData.karana.number}</div>
                            </div>
                        </div>
                    </div>

                    {/* Auspicious Timings */}
                    <div className={styles.panchangSection}>
                        <h2 className={styles.sectionHeader}>
                            Auspicious Timings
                        </h2>
                        <div className={styles.timingsGrid}>
                            {panchangData.abhijitMuhurat && (
                                <div className={`${styles.timingCard} shubh`}>
                                    <div className={styles.timingName}>Abhijit Muhurat</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.abhijitMuhurat.start} - {panchangData.abhijitMuhurat.end}
                                    </div>
                                    <div className={styles.timingDesc}>Most auspicious period</div>
                                </div>
                            )}
                            {panchangData.brahmaMuhurat && (
                                <div className={`${styles.timingCard} shubh`}>
                                    <div className={styles.timingName}>Brahma Muhurat</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.brahmaMuhurat.start} - {panchangData.brahmaMuhurat.end}
                                    </div>
                                    <div className={styles.timingDesc}>Sacred meditation time</div>
                                </div>
                            )}
                            {panchangData.abhijitLagna && panchangData.abhijitLagna.start !== 'N/A' && (
                                <div className={`${styles.timingCard} shubh`}>
                                    <div className={styles.timingName}>Abhijit Lagna</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.abhijitLagna.start} - {panchangData.abhijitLagna.end}
                                    </div>
                                    <div className={styles.timingDesc}>{panchangData.abhijitLagna.rashi}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pancha Rahita Muhurat */}
                    {panchangData.panchaRahitaMuhurat && panchangData.panchaRahitaMuhurat.length > 0 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Pancha Rahita Muhurat
                            </h2>
                            <p className={styles.sectionSubtitle}>
                                Periods free from all inauspicious timings - Best for important activities
                            </p>
                            <div className={styles.rahitaGrid}>
                                {panchangData.panchaRahitaMuhurat.map((period, idx) => (
                                    <div key={idx} className={styles.rahitaCard}>
                                        <div className={styles.rahitaNumber}>{idx + 1}</div>
                                        <div className={styles.rahitaTime}>
                                            <span className="start">{period.start}</span>
                                            <span className={styles.separator}>→</span>
                                            <span className="end">{period.end}</span>
                                        </div>
                                        <div className={styles.rahitaDuration}>{period.duration}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inauspicious Timings */}
                    <div className={styles.panchangSection}>
                        <h2 className={styles.sectionHeader}>
                            Inauspicious Timings (Avoid)
                        </h2>
                        <div className={styles.timingsGrid}>
                            {panchangData.rahuKaal && panchangData.rahuKaal.start && (
                                <div className={`${styles.timingCard} ashubh`}>
                                    <div className={styles.timingName}>Rahu Kaal</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.rahuKaal.start} - {panchangData.rahuKaal.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.yamaganda && panchangData.yamaganda.start && (
                                <div className={`${styles.timingCard} ashubh`}>
                                    <div className={styles.timingName}>Yamaganda</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.yamaganda.start} - {panchangData.yamaganda.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.gulika && panchangData.gulika.start && (
                                <div className={`${styles.timingCard} ashubh`}>
                                    <div className={styles.timingName}>Gulika Kalam</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.gulika.start} - {panchangData.gulika.end}
                                    </div>
                                </div>
                            )}
                            {panchangData.varjyam && panchangData.varjyam.start && (
                                <div className={`${styles.timingCard} ashubh`}>
                                    <div className={styles.timingName}>Varjyam</div>
                                    <div className={styles.timingTime}>
                                        {panchangData.varjyam.start} - {panchangData.varjyam.end}
                                    </div>
                                    <div className={styles.timingDesc}>{panchangData.varjyam.ghatis} ghatis - Tithi-based</div>
                                </div>
                            )}
                            {panchangData.durMuhurat && panchangData.durMuhurat.map((dur, idx) => (
                                <div key={idx} className={`${styles.timingCard} ashubh`}>
                                    <div className={styles.timingName}>{dur.name}</div>
                                    <div className={styles.timingTime}>
                                        {dur.start} - {dur.end}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Choghadiya - Day */}
                    {panchangData.choghadiya && panchangData.choghadiya.day && panchangData.choghadiya.day.length > 0 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Choghadiya (Day)
                            </h2>
                            <div className={styles.choghadiyaGrid}>
                                {panchangData.choghadiya.day.map((chog, idx) => (
                                    <div key={idx} className={`chog-card ${chog.type.toLowerCase()}`}>
                                        <div className={styles.chogBadge}>{chog.type === 'Good' ? '✅' : '❌'}</div>
                                        <div className={styles.chogName}>{chog.name}</div>
                                        <div className={styles.chogTime}>{chog.start} - {chog.end}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Choghadiya - Night */}
                    {panchangData.choghadiya && panchangData.choghadiya.night && panchangData.choghadiya.night.length > 0 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Choghadiya (Night)
                            </h2>
                            <div className={styles.choghadiyaGrid}>
                                {panchangData.choghadiya.night.map((chog, idx) => (
                                    <div key={idx} className={`chog-card ${chog.type.toLowerCase()}`}>
                                        <div className={styles.chogName}>{chog.name}</div>
                                        <div className={styles.chogTime}>{chog.start} - {chog.end}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Panchanga Transitions */}
                    {panchangData.lagnas && panchangData.lagnas.length > 0 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Lagna Times (Ascendant Changes)
                            </h2>
                            <p className={styles.sectionSubtitle}>
                                All 12 rashi (zodiac sign) ascendant changes throughout the day - Calculated with Swiss Ephemeris
                            </p>
                            <div className={styles.lagnaGrid}>
                                {panchangData.lagnas.map((lagna, idx) => (
                                    <div key={idx} className={styles.lagnaCard}>
                                        <div className={styles.lagnaName}>{lagna.name}</div>
                                        <div className={styles.lagnaNumber}>#{lagna.number}</div>
                                        <div className={styles.lagnaTime}>
                                            {lagna.startTime} → {lagna.endTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {panchangData.tithis && panchangData.tithis.length > 1 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Tithi Transitions
                            </h2>
                            <div className={styles.transitionsList}>
                                {panchangData.tithis.map((tithi, idx) => (
                                    <div key={idx} className={styles.transitionItem}>
                                        <div className={styles.transName}>{tithi.name} #{tithi.number}</div>
                                        <div className={styles.transTimes}>
                                            <span>{tithi.startTime || 'Previous day'}</span>
                                            <span className={styles.transArrow}>→</span>
                                            <span>{tithi.endTime || 'Next day'}</span>
                                        </div>
                                        <div className={styles.transPaksha}>{tithi.paksha}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {panchangData.nakshatras && panchangData.nakshatras.length > 1 && (
                        <div className={styles.panchangSection}>
                            <h2 className={styles.sectionHeader}>
                                Nakshatra Transitions
                            </h2>
                            <div className={styles.transitionsList}>
                                {panchangData.nakshatras.map((nak, idx) => (
                                    <div key={idx} className={styles.transitionItem}>
                                        <div className={styles.transName}>{nak.name} #{nak.number}</div>
                                        <div className={styles.transTimes}>
                                            <span>{nak.startTime || 'Previous day'}</span>
                                            <span className={styles.transArrow}>→</span>
                                            <span>{nak.endTime || 'Next day'}</span>
                                        </div>
                                        {nak.lord && <div className={styles.transPaksha}>Lord: {nak.lord}</div>}
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
