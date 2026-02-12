import React, { useState } from 'react';
import '../pages/hero-styles.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import styles from './ChoghadiyaInfo.module.css';

const ChoghadiyaPage = () => {
    const [cityName, setCityName] = useState(localStorage.getItem('selectedCity') || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
    const [choghadiyaData, setChoghadiyaData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChoghadiya = async () => {
        if (!cityName) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`);
            if (!response.ok) throw new Error('Failed to fetch Choghadiya data');
            const result = await response.json();
            console.log('Choghadiya Data:', result);
            setChoghadiyaData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchChoghadiya();
    };

    const handleCitySelect = (city) => {
        setCityName(city.name);
        localStorage.setItem('selectedCity', city.name);
    };

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Choghadiya Calculator</h1>
                    <p className="hero-subtitle">
                        Daily Choghadiya timings with Swiss Ephemeris precision • Day & Night periods
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={handleSubmit}>
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
                            {isLoading ? 'Calculating...' : 'Get Choghadiya Timings'}
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero">{error}</div>}

            {/* Results Section */}
            {choghadiyaData && choghadiyaData.choghadiya && (
                <div className="results-section">
                    {/* Summary Bar */}
                    <div className={styles.summaryBar}>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>LOCATION</div>
                            <div className={styles.summaryValue}>{cityName}</div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>SUNRISE & SUNSET</div>
                            <div className={styles.summaryValue}>{choghadiyaData.sunrise} - {choghadiyaData.sunset}</div>
                        </div>
                        <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>WEEKDAY</div>
                            <div className={styles.summaryValue}>{choghadiyaData.weekday}</div>
                        </div>
                    </div>

                    {/* Day Choghadiya Table */}
                    {choghadiyaData.choghadiya.day && choghadiyaData.choghadiya.day.length > 0 && (
                        <div className={styles.floatingSection}>
                            <h2 className={styles.sectionTitle}>☀️ Day Choghadiya (Sunrise to Sunset)</h2>
                            <p className={styles.sectionSubtitle}>Auspicious and Inauspicious periods of the day divided into 8 parts</p>
                            <div className={styles.tableWrapper}>
                                <table className={styles.panchangTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Muhurat</th>
                                            <th>Nature</th>
                                            <th>Timing Range</th>
                                            <th>Planet</th>
                                            <th>Best For / Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {choghadiyaData.choghadiya.day.map((chog, idx) => (
                                            <tr key={idx} className={chog.type === 'Good' ? styles.goodRow : styles.badRow}>
                                                <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                                                <td style={{ fontWeight: 700, fontSize: '16px' }}>{chog.name}</td>
                                                <td>
                                                    <span className={`${styles.typeBadge} ${chog.type.toLowerCase() === 'good' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                                        {chog.type}
                                                    </span>
                                                </td>
                                                <td className={styles.timeValue}>{chog.start} - {chog.end}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        {chog.name === 'Amrit' && <><span>🌙</span> Moon</>}
                                                        {chog.name === 'Shubh' && <><span>♃</span> Jupiter</>}
                                                        {chog.name === 'Labh' && <><span>☿</span> Mercury</>}
                                                        {chog.name === 'Char' && <><span>♀</span> Venus</>}
                                                        {chog.name === 'Rog' && <><span>♂</span> Mars</>}
                                                        {chog.name === 'Kaal' && <><span>♄</span> Saturn</>}
                                                        {chog.name === 'Udveg' && <><span>☉</span> Sun</>}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                    {chog.name === 'Amrit' && 'Best for all types of auspicious work, new ventures, and ceremonies.'}
                                                    {chog.name === 'Shubh' && 'Marriage, auspicious ceremonies, and religious activities.'}
                                                    {chog.name === 'Labh' && 'Starting new business, gains, education, and trade.'}
                                                    {chog.name === 'Char' && 'Travel, transport, and movement related activities.'}
                                                    {chog.name === 'Rog' && 'Avoid. Highly malefic except for war or competition.'}
                                                    {chog.name === 'Kaal' && 'Avoid. Malefic except for activities to gather wealth.'}
                                                    {chog.name === 'Udveg' && 'Avoid. Malefic except for government or official work.'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Night Choghadiya Table */}
                    {choghadiyaData.choghadiya.night && choghadiyaData.choghadiya.night.length > 0 && (
                        <div className={`${styles.floatingSection} ${styles.nightTable}`}>
                            <h2 className={styles.sectionTitle}>🌙 Night Choghadiya (Sunset to Sunrise)</h2>
                            <p className={styles.sectionSubtitle}>Auspicious and Inauspicious periods of the night divided into 8 parts</p>
                            <div className={styles.tableWrapper}>
                                <table className={styles.panchangTable}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Muhurat</th>
                                            <th>Nature</th>
                                            <th>Timing Range</th>
                                            <th>Planet</th>
                                            <th>Best For / Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {choghadiyaData.choghadiya.night.map((chog, idx) => (
                                            <tr key={idx} className={chog.type === 'Good' ? styles.nightGoodRow : styles.nightBadRow}>
                                                <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                                                <td style={{ fontWeight: 700, fontSize: '16px' }}>{chog.name}</td>
                                                <td>
                                                    <span className={`${styles.typeBadge} ${chog.type.toLowerCase() === 'good' ? styles.badgeSuccess : styles.badgeDanger}`}>
                                                        {chog.type}
                                                    </span>
                                                </td>
                                                <td className={styles.timeValue}>{chog.start} - {chog.end}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        {chog.name === 'Amrit' && <><span>🌙</span> Moon</>}
                                                        {chog.name === 'Shubh' && <><span>♃</span> Jupiter</>}
                                                        {chog.name === 'Labh' && <><span>☿</span> Mercury</>}
                                                        {chog.name === 'Char' && <><span>♀</span> Venus</>}
                                                        {chog.name === 'Rog' && <><span>♂</span> Mars</>}
                                                        {chog.name === 'Kaal' && <><span>♄</span> Saturn</>}
                                                        {chog.name === 'Udveg' && <><span>☉</span> Sun</>}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                    {chog.name === 'Amrit' && 'Best for all types of auspicious work, new ventures, and ceremonies.'}
                                                    {chog.name === 'Shubh' && 'Marriage, auspicious ceremonies, and religious activities.'}
                                                    {chog.name === 'Labh' && 'Starting new business, gains, education, and trade.'}
                                                    {chog.name === 'Char' && 'Travel, transport, and movement related activities.'}
                                                    {chog.name === 'Rog' && 'Avoid. Highly malefic except for war or competition.'}
                                                    {chog.name === 'Kaal' && 'Avoid. Malefic except for activities to gather wealth.'}
                                                    {chog.name === 'Udveg' && 'Avoid. Malefic except for government or official work.'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Information Guide Section */}
            <div className={styles.infoContent}>
                <section className={styles.infoSection}>
                    <h2 className={styles.sectionHeading}>About Choghadiya</h2>
                    <p className={styles.infoText}>
                        Choghadiya or Chogadia is used for checking auspicious time to start new work. Traditionally Choghadiya is used for travel muhurthas but due to its simplicity, it is used for any muhurtha.
                    </p>
                    <p className={styles.infoText}>
                        There are four good Choghadiya, <strong>Amrit</strong>, <strong>Shubh</strong>, <strong>Labh</strong> and <strong>Char</strong>, to start an auspicious work. Three bad Choghadiya, <strong>Rog</strong>, <strong>Kaal</strong> and <strong>Udveg</strong>, should be avoided.
                    </p>
                    <p className={styles.infoText}>
                        The time between sunrise and sunset is called <strong>day Choghadiya</strong> and the time between sunset and next day sunrise is called <strong>night Choghadiya</strong>.
                    </p>
                </section>

                <section className={styles.infoSection}>
                    <h2 className={styles.sectionHeading}>Understanding the Name</h2>
                    <p className={styles.infoText}>
                        In Hindu division of the day, the time between Sunrise to Sunset is divided into 30 Ghati. For Choghadiya Muhurta, the same time duration is divided into 8 parts, which results in 8 Choghadiya Muhurta during the daytime as well as during the night time. As each Choghadiya Muhurta approximates to 4 Ghati, it is known as Choghadiya i.e. <strong>Choghadiya = Cho (four) + Ghadiya (Ghati)</strong>. Choghadiya Muhurta is also known as <strong>Chaturshtika Muhurta</strong>.
                    </p>
                </section>

                <section className={styles.infoSection}>
                    <h2 className={styles.sectionHeading}>Types of Choghadiya</h2>

                    <div className={styles.choghadiyaGrid}>
                        <div className={`${styles.choghadiyaCard} ${styles.goodType}`}>
                            <h3 className={styles.cardTitle}>Amrit Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Moon</p>
                            <p className={styles.cardDescription}>
                                The Moon is usually considered a benefic planet in Vedic astrology. Hence the time under the influence of it is considered auspicious and marked as Amrit. Amrit Choghadiya is considered good for all type of works.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.goodType}`}>
                            <h3 className={styles.cardTitle}>Shubh Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Jupiter</p>
                            <p className={styles.cardDescription}>
                                The Jupiter is considered a benefic planet in Vedic astrology. Hence the time under the influence of it is considered auspicious and marked as Shubh. Shubh Choghadiya is considered good to conduct ceremonies especially marriage ceremony.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.goodType}`}>
                            <h3 className={styles.cardTitle}>Labh Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Mercury</p>
                            <p className={styles.cardDescription}>
                                The Mercury is considered a benefic planet in Vedic astrology. Hence the time under the influence of it is considered auspicious and marked as Labh. Labh Choghadiya is considered most appropriate to start education and to acquire new skills.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.goodType}`}>
                            <h3 className={styles.cardTitle}>Char Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Venus</p>
                            <p className={styles.cardDescription}>
                                The Venus is considered a benefic planet in Vedic astrology. Hence the time under the influence of it is considered auspicious and marked as Char or Chanchal. Due to the moving nature of the Venus, Char Choghadiya is considered most appropriate for travelling purpose.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.badType}`}>
                            <h3 className={styles.cardTitle}>Rog Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Mars</p>
                            <p className={styles.cardDescription}>
                                The Mars is considered a malefic planet in Vedic astrology. Hence the time under the influence of it is considered inauspicious and marked as Rog. No auspicious work is done during Rog Choghadiya. However, Rog Choghadiya is recommended for war and to defeat the enemy.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.badType}`}>
                            <h3 className={styles.cardTitle}>Kala Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Saturn</p>
                            <p className={styles.cardDescription}>
                                The Saturn is considered a malefic planet in Vedic astrology. Hence the time under the influence of it is considered inauspicious and marked as Kala. No auspicious work is done during Kala Choghadiya. However, Kala Choghadiya is recommended for those activities which are performed to accumulate wealth.
                            </p>
                        </div>

                        <div className={`${styles.choghadiyaCard} ${styles.badType}`}>
                            <h3 className={styles.cardTitle}>Udveg Choghadiya</h3>
                            <p className={styles.cardPlanet}>Ruled by: Sun</p>
                            <p className={styles.cardDescription}>
                                The Sun is considered a malefic planet in Vedic astrology. Hence the time under the influence of it is usually considered inauspicious and marked as Udveg. However, for government-related work, Udveg Choghadiya is considered good.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.infoSection}>
                    <h2 className={styles.sectionHeading}>Important Considerations</h2>

                    <h3 className={styles.subsectionTitle}>Overlaps with Rahu Kala</h3>
                    <p className={styles.infoText}>
                        It is quite possible that auspicious Choghadiya might overlap with Rahu Kala. Rahu Kala is considered highly malefic. In south India, it is given utmost importance while selecting any Muhurta. It is always better to abandon that auspicious Choghadiya Muhurta which overlaps with Rahu Kala.
                    </p>

                    <h3 className={styles.subsectionTitle}>Overlaps with Vara, Kala and Ratri Vela</h3>
                    <p className={styles.infoText}>
                        While selecting Choghadiya Muhurta, the adverse time of Vara Vela, Kala Vela and Kala Ratri should be rejected. It is believed that all Manglik works done during these timings are not fruitful and don't give the desired results.
                    </p>

                    <h3 className={styles.subsectionTitle}>How Choghadiya are Marked</h3>
                    <p className={styles.infoText}>
                        The first Muhurta on each weekday is ruled by the weekday lord. The effect of each division, either bad or good, is marked based on the nature of the ruling planet. In Vedic Astrology, the time period under the influence of Venus, Mercury, Moon and Jupiter is usually considered auspicious while the time period under the influence of Sun, Mars and Saturn is usually considered inauspicious.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ChoghadiyaPage;
