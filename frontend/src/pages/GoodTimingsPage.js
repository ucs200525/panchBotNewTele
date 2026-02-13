import React, { useState } from 'react';
import '../pages/hero-styles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import styles from './GoodTimings.module.css';

const GoodTimingsPage = () => {
    const [cityName, setCityName] = useState(localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [timingsData, setTimingsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTimings = async () => {
        if (!cityName) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`);
            if (!response.ok) throw new Error('Failed to fetch timing data');
            const result = await response.json();
            console.log('Good Timings Data:', result);
            setTimingsData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetTimings = (e) => {
        e.preventDefault();
        fetchTimings();
    };

    const handleCitySelect = (city) => {
        setCityName(city.name);
        localStorage.setItem('selectedCity', city.name);
    };

    // Filter good choghadiya
    const getGoodChoghadiya = (choghadiya) => {
        if (!choghadiya) return { day: [], night: [] };
        return {
            day: choghadiya.day?.filter(c => c.type === 'Good') || [],
            night: choghadiya.night?.filter(c => c.type === 'Good') || []
        };
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Auspicious Periods</h1>
                    <p className="hero-subtitle">
                        Pancha Rahita Muhurat & Good Timings • High Precision Calculation
                    </p>
                </div>

                <div className="hero-form">
                    <form onSubmit={handleGetTimings}>
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
                        <button type="submit" className="get-panchang-btn-hero" disabled={!cityName || isLoading}>
                            {isLoading ? 'Calculating...' : 'Find Good Timings'}
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero">{error}</div>}

            {timingsData && (
                <div className="results-section">

                    {/* Summary Bar */}
                    <div className={styles.summaryBar}>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>LOCATION</div>
                            <div className={styles.summaryValue}>{cityName}</div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>SUNRISE & SUNSET</div>
                            <div className={styles.summaryValue}>{timingsData.sunrise} - {timingsData.sunset}</div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>WEEKDAY</div>
                            <div className={styles.summaryValue}>{timingsData.weekday}</div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>TITHI</div>
                            <div className={styles.summaryValue}>{timingsData.tithi.name}</div>
                        </div>
                    </div>

                    {/* Pancha Rahita Muhurat - Table Format */}
                    {timingsData.panchaRahitaMuhurat && timingsData.panchaRahitaMuhurat.length > 0 && (
                        <div className={`${styles.sectionWrapper} ${styles.featuredSection}`}>
                            <h2 className={styles.sectionTitle}>
                                🏆 Pancha Rahita Muhurat
                            </h2>
                            <p className={styles.sectionSubtitle}>Golden Periods - Completely Free from ALL Inauspicious Timings</p>

                            <div className={styles.descriptionBlock}>
                                <p>
                                    These rare periods are free from <strong>Rahu Kaal, Yamaganda, Gulika, Varjyam, and Dur Muhurat</strong>. They are ideal for high-stakes activities like Griha Pravesh, Marriages, or Launching Businesses.
                                </p>
                                <div className={styles.activityTags}>
                                    <span className={styles.tag}>Griha Pravesh</span>
                                    <span className={styles.tag}>Marriage</span>
                                    <span className={styles.tag}>Business Launch</span>
                                    <span className={styles.tag}>Pooja</span>
                                    <span className={styles.tag}>Contracts</span>
                                </div>
                            </div>

                            <div className={styles.tableWrapper}>
                                <table className={styles.panchangTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Duration</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timingsData.panchaRahitaMuhurat
                                            .filter(p => p.category === 'Good')
                                            .map((period, idx) => (
                                                <tr key={idx} className={styles.goldenRow}>
                                                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                                                    <td className={styles.timeValue}>{period.start}</td>
                                                    <td className={styles.timeValue}>{period.end}</td>
                                                    <td className={styles.durationText}>{period.duration}</td>
                                                    <td>
                                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>Golden Period</span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Premium Auspicious Timings - Table Format */}
                    <div className={styles.sectionWrapper}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div>
                                <h2 className={styles.sectionTitle}>✨ Premium Auspicious Timings</h2>
                                <p className={styles.sectionSubtitle}>Most favorable specific periods of the day for important beginnings</p>
                            </div>
                            <div className={styles.descriptionBlock} style={{ maxWidth: '400px', padding: '1rem', fontSize: '13px', marginBottom: '1.5rem' }}>
                                <strong>💡 Note on Abhijit:</strong> You may see similar timings for Abhijit Muhurat and Abhijit Lagna. The <em>Muhurat</em> is based on the sun's position (Solar Noon), while the <em>Lagna</em> is the rising sign (Karkata). They are both highly auspicious and often coincide.
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.panchangTable}>
                                <thead>
                                    <tr>
                                        <th>Muhurat Name</th>
                                        <th>Timing Range</th>
                                        <th>Key Benefits</th>
                                        <th>Classification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timingsData.abhijitMuhurat && (
                                        <tr className={styles.premiumRow}>
                                            <td style={{ fontWeight: 700 }}>Abhijit Muhurat</td>
                                            <td className={styles.timeValue}>
                                                {timingsData.abhijitMuhurat.start} - {timingsData.abhijitMuhurat.end}
                                            </td>
                                            <td>
                                                <div className={styles.benefitsList}>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>✓</span> Success in all ventures</div>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>✓</span> Destroys all negative Doshas</div>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Top Auspicious</span></td>
                                        </tr>
                                    )}
                                    {timingsData.brahmaMuhurat && (
                                        <tr className={styles.premiumRow}>
                                            <td style={{ fontWeight: 700 }}>Brahma Muhurat</td>
                                            <td className={styles.timeValue}>
                                                {timingsData.brahmaMuhurat.start} - {timingsData.brahmaMuhurat.end}
                                            </td>
                                            <td>
                                                <div className={styles.benefitsList}>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>🧘</span> Spiritual & Mental Clarity</div>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>✓</span> Best for Yoga & Meditation</div>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Divine</span></td>
                                        </tr>
                                    )}
                                    {timingsData.abhijitLagna && timingsData.abhijitLagna.start !== 'N/A' && (
                                        <tr className={styles.premiumRow}>
                                            <td style={{ fontWeight: 700 }}>Abhijit Lagna ({timingsData.abhijitLagna.rashi})</td>
                                            <td className={styles.timeValue}>
                                                {timingsData.abhijitLagna.start} - {timingsData.abhijitLagna.end}
                                            </td>
                                            <td>
                                                <div className={styles.benefitsList}>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>♌</span> Auspicious Ascendant (Karkata)</div>
                                                    <div className={styles.benefitItem}><span className={styles.benefitIcon}>✓</span> Favorable Planetary Alignment</div>
                                                </div>
                                            </td>
                                            <td><span className={`${styles.badge} ${styles.badgeInfo}`}>Astrological</span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Inauspicious Timings Section */}
                    <div className={`${styles.sectionWrapper} ${styles.negativeSection}`}>
                        <h2 className={styles.sectionTitle}>⚠️ Inauspicious Timings (Periods to Avoid)</h2>
                        <p className={styles.sectionSubtitle}>Malefic periods where starting new ventures should be strictly avoided</p>

                        <div className={styles.tableWrapper}>
                            <table className={styles.panchangTable}>
                                <thead>
                                    <tr>
                                        <th>Period Name</th>
                                        <th>Timing Range</th>
                                        <th>Reason/Effect</th>
                                        <th>Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timingsData.rahuKaal && (
                                        <tr className={styles.negativeRow}>
                                            <td style={{ fontWeight: 700 }}>Rahu Kaal</td>
                                            <td className={styles.timeValue} style={{ color: '#dc2626' }}>
                                                {timingsData.rahuKaal.start} - {timingsData.rahuKaal.end}
                                            </td>
                                            <td>Obstacles and unforeseen delays in work</td>
                                            <td><span className={`${styles.badge} ${styles.badgeDanger}`}>Critical</span></td>
                                        </tr>
                                    )}
                                    {timingsData.kaalRatri && (
                                        <tr className={styles.negativeRow}>
                                            <td style={{ fontWeight: 700 }}>Kaal Ratri (Night)</td>
                                            <td className={styles.timeValue} style={{ color: '#dc2626' }}>
                                                {timingsData.kaalRatri.start} - {timingsData.kaalRatri.end}
                                            </td>
                                            <td>Highly malefic period during the night</td>
                                            <td><span className={`${styles.badge} ${styles.badgeNight}`}>Night Hazard</span></td>
                                        </tr>
                                    )}
                                    {timingsData.yamaganda && (
                                        <tr className={styles.negativeRow}>
                                            <td style={{ fontWeight: 700 }}>Yamaganda</td>
                                            <td className={styles.timeValue} style={{ color: '#dc2626' }}>
                                                {timingsData.yamaganda.start} - {timingsData.yamaganda.end}
                                            </td>
                                            <td>Results in termination or death of the venture</td>
                                            <td><span className={`${styles.badge} ${styles.badgeWarning}`}>High</span></td>
                                        </tr>
                                    )}
                                    {timingsData.gulika && (
                                        <tr className={styles.negativeRow}>
                                            <td style={{ fontWeight: 700 }}>Gulika Kalam</td>
                                            <td className={styles.timeValue} style={{ color: '#dc2626' }}>
                                                {timingsData.gulika.start} - {timingsData.gulika.end}
                                            </td>
                                            <td>Any work started now keeps repeating (loop)</td>
                                            <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Moderate</span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Good Choghadiya Section */}
                    {timingsData.choghadiya && (
                        <div className={styles.sectionWrapper}>
                            <h2 className={styles.sectionTitle}>🕒 Best Choghadiya Timings</h2>
                            <p className={styles.sectionSubtitle}>Selected auspicious periods from Choghadiya cycle</p>

                            {(() => {
                                const goodChog = getGoodChoghadiya(timingsData.choghadiya);
                                const combinedGood = [
                                    ...goodChog.day.map(c => ({ ...c, period: 'Day' })),
                                    ...goodChog.night.map(c => ({ ...c, period: 'Night' }))
                                ];

                                if (combinedGood.length === 0) return null;

                                return (
                                    <div className={styles.tableWrapper}>
                                        <table className={styles.panchangTable}>
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Period</th>
                                                    <th>Timing</th>
                                                    <th>Suggested Activities</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {combinedGood.map((chog, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 700 }}>{chog.name}</td>
                                                        <td>
                                                            <span className={`${styles.badge} ${chog.period === 'Day' ? styles.badgeInfo : styles.badgeWarning}`}>
                                                                {chog.period}
                                                            </span>
                                                        </td>
                                                        <td className={styles.timeValue}>{chog.start} - {chog.end}</td>
                                                        <td>
                                                            {chog.name === 'Amrit' && 'Best for all types of work'}
                                                            {chog.name === 'Shubh' && 'Marriage, Ceremonies, Religious activities'}
                                                            {chog.name === 'Labh' && 'Business launch, Education, Shop opening'}
                                                            {chog.name === 'Char' && 'Travel, Transportation, Vehicle use'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* How to Use Tips Section */}
                    <div className={styles.sectionWrapper}>
                        <h2 className={styles.sectionTitle}>💡 Timing Guidelines</h2>
                        <div className={styles.tipsGrid}>
                            <div className={styles.tipCard}>
                                <h3>Pancha Rahita Priority</h3>
                                <p>Always prioritize <strong>Pancha Rahita</strong> periods for major life events like marriages or buying property.</p>
                            </div>
                            <div className={styles.tipCard}>
                                <h3>Urgent Matters</h3>
                                <p>Use <strong>Abhijit Muhurat</strong> when you need a quick, powerful window for immediate success.</p>
                            </div>
                            <div className={styles.tipCard}>
                                <h3>Internal Growth</h3>
                                <p><strong>Brahma Muhurat</strong> is unsurpassed for meditation, academic study, and mental clarity.</p>
                            </div>
                            <div className={styles.tipCard}>
                                <h3>Routine Operations</h3>
                                <p>Use <strong>Good Choghadiya</strong> for daily tasks like travelling (Char) or business meetings (Labh).</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default GoodTimingsPage;
