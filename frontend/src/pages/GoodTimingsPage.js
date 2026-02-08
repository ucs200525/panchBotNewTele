import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import './hero-styles.css';
import './GoodTimings.css';

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
            <div className="hero-section good-timings-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-icon">⭐</span>
                        Good Timings
                    </h1>
                    <p className="hero-subtitle">
                        Pancha Rahita Muhurat & Auspicious Periods • Swiss Ephemeris Calculations
                    </p>

                    <form className="hero-form" onSubmit={handleGetTimings}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: 2 }}>
                                <label className="input-label">📍 City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onChange={setCityName}
                                    onSelect={handleCitySelect}
                                    placeholder="Search city"
                                />
                            </div>
                            <div className="input-wrapper" style={{ flex: 1 }}>
                                <label className="input-label">📅 Date</label>
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
                            <span>✨</span> Find Good Timings
                        </button>
                    </form>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <div className="error-box-hero">{error}</div>}

            {timingsData && (
                <div className="results-section good-timings-results">
                    
                    {/* Day Summary Card */}
                    <div className="summary-card">
                        <div className="summary-icon">🌅</div>
                        <div className="summary-content">
                            <h2>Day Overview</h2>
                            <div className="summary-details">
                                <div className="detail-item">
                                    <span className="detail-label">Sunrise:</span>
                                    <span className="detail-value">{timingsData.sunrise}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Sunset:</span>
                                    <span className="detail-value">{timingsData.sunset}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Weekday:</span>
                                    <span className="detail-value">{timingsData.weekday}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Tithi:</span>
                                    <span className="detail-value">{timingsData.tithi.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pancha Rahita Muhurat - Featured Section */}
                    {timingsData.panchaRahitaMuhurat && timingsData.panchaRahitaMuhurat.length > 0 && (
                        <div className="featured-section pancha-rahita-featured">
                            <div className="featured-header">
                                <div className="featured-icon">🌟</div>
                                <div className="featured-title">
                                    <h2>Pancha Rahita Muhurat</h2>
                                    <p>Golden Periods - Free from ALL Inauspicious Timings</p>
                                </div>
                            </div>
                            <div className="featured-description">
                                <p>
                                    These are the most auspicious periods of the day, completely free from ALL FIVE inauspicious timings:<br/>
                                    <strong>1. Rahu Kaal</strong> • <strong>2. Yamaganda</strong> • <strong>3. Gulika Kalam</strong> • <strong>4. Varjyam</strong> • <strong>5. Dur Muhurat</strong>
                                </p>
                                <p>Perfect for important activities like:</p>
                                <div className="activity-tags">
                                    <span className="tag">🏠 Griha Pravesh</span>
                                    <span className="tag">💍 Marriage Ceremonies</span>
                                    <span className="tag">📝 Important Contracts</span>
                                    <span className="tag">💼 New Business</span>
                                    <span className="tag">🎓 Education Start</span>
                                    <span className="tag">🚗 Vehicle Purchase</span>
                                </div>
                            </div>
                            <div className="pancha-rahita-list">
                                {timingsData.panchaRahitaMuhurat.map((period, idx) => (
                                    <div key={idx} className="golden-period-card">
                                        <div className="period-badge">Period {idx + 1}</div>
                                        <div className="period-time-range">
                                            <div className="time-display">
                                                <div className="time-label">Starts</div>
                                                <div className="time-value">{period.start}</div>
                                            </div>
                                            <div className="time-arrow">→</div>
                                            <div className="time-display">
                                                <div className="time-label">Ends</div>
                                                <div className="time-value">{period.end}</div>
                                            </div>
                                        </div>
                                        <div className="period-duration">
                                            <span className="duration-icon">⏱️</span>
                                            <span className="duration-text">{period.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Premium Auspicious Timings */}
                    <div className="premium-section">
                        <h2 className="section-title">
                            <span className="title-icon">✨</span>
                            Premium Auspicious Timings
                        </h2>
                        <div className="premium-grid">
                            {timingsData.abhijitMuhurat && (
                                <div className="premium-card abhijit">
                                    <div className="card-badge">Most Powerful</div>
                                    <div className="card-icon">☀️</div>
                                    <h3>Abhijit Muhurat</h3>
                                    <p className="card-desc">The 8th muhurat - Most auspicious 24-minute period</p>
                                    <div className="card-timing">
                                        <div className="timing-row">
                                            <span className="timing-label">From:</span>
                                            <span className="timing-value">{timingsData.abhijitMuhurat.start}</span>
                                        </div>
                                        <div className="timing-row">
                                            <span className="timing-label">To:</span>
                                            <span className="timing-value">{timingsData.abhijitMuhurat.end}</span>
                                        </div>
                                    </div>
                                    <div className="card-benefits">
                                        <div className="benefit">✓ Removes all doshas</div>
                                        <div className="benefit">✓ Success in all ventures</div>
                                        <div className="benefit">✓ No inauspicious effects</div>
                                    </div>
                                </div>
                            )}

                            {timingsData.brahmaMuhurat && (
                                <div className="premium-card brahma">
                                    <div className="card-badge">Sacred</div>
                                    <div className="card-icon">🌅</div>
                                    <h3>Brahma Muhurat</h3>
                                    <p className="card-desc">Divine early morning period for meditation & study</p>
                                    <div className="card-timing">
                                        <div className="timing-row">
                                            <span className="timing-label">From:</span>
                                            <span className="timing-value">{timingsData.brahmaMuhurat.start}</span>
                                        </div>
                                        <div className="timing-row">
                                            <span className="timing-label">To:</span>
                                            <span className="timing-value">{timingsData.brahmaMuhurat.end}</span>
                                        </div>
                                    </div>
                                    <div className="card-benefits">
                                        <div className="benefit">✓ Spiritual practices</div>
                                        <div className="benefit">✓ Yoga & meditation</div>
                                        <div className="benefit">✓ Academic studies</div>
                                    </div>
                                </div>
                            )}

                            {timingsData.abhijitLagna && timingsData.abhijitLagna.start !== 'N/A' && (
                                <div className="premium-card lagna">
                                    <div className="card-badge">Astrological</div>
                                    <div className="card-icon">♋</div>
                                    <h3>Abhijit Lagna</h3>
                                    <p className="card-desc">{timingsData.abhijitLagna.rashi} - Cancer ascendant period</p>
                                    <div className="card-timing">
                                        <div className="timing-row">
                                            <span className="timing-label">From:</span>
                                            <span className="timing-value">{timingsData.abhijitLagna.start}</span>
                                        </div>
                                        <div className="timing-row">
                                            <span className="timing-label">To:</span>
                                            <span className="timing-value">{timingsData.abhijitLagna.end}</span>
                                        </div>
                                    </div>
                                    <div className="card-benefits">
                                        <div className="benefit">✓ Highly favorable lagna</div>
                                        <div className="benefit">✓ Emotional harmony</div>
                                        <div className="benefit">✓ Nurturing activities</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Good Choghadiya */}
                    {timingsData.choghadiya && (
                        <>
                            {(() => {
                                const goodChog = getGoodChoghadiya(timingsData.choghadiya);
                                return (
                                    <>
                                        {goodChog.day.length > 0 && (
                                            <div className="choghadiya-section day-section">
                                                <h2 className="section-title">
                                                    <span className="title-icon">☀️</span>
                                                    Good Choghadiya (Daytime)
                                                </h2>
                                                <div className="choghadiya-grid-good">
                                                    {goodChog.day.map((chog, idx) => (
                                                        <div key={idx} className={`chog-good-card ${chog.name.toLowerCase()}`}>
                                                            <div className="chog-name">{chog.name}</div>
                                                            <div className="chog-time-good">
                                                                {chog.start} - {chog.end}
                                                            </div>
                                                            <div className="chog-meaning">
                                                                {chog.name === 'Amrit' && '💎 Nectar - Best for all activities'}
                                                                {chog.name === 'Shubh' && '🌟 Auspicious - Good for new beginnings'}
                                                                {chog.name === 'Labh' && '💰 Profit - Favorable for business'}
                                                                {chog.name === 'Char' && '🚶 Movement - Good for travel'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {goodChog.night.length > 0 && (
                                            <div className="choghadiya-section night-section">
                                                <h2 className="section-title">
                                                    <span className="title-icon">🌙</span>
                                                    Good Choghadiya (Night)
                                                </h2>
                                                <div className="choghadiya-grid-good">
                                                    {goodChog.night.map((chog, idx) => (
                                                        <div key={idx} className={`chog-good-card ${chog.name.toLowerCase()}`}>
                                                            <div className="chog-name">{chog.name}</div>
                                                            <div className="chog-time-good">
                                                                {chog.start} - {chog.end}
                                                            </div>
                                                            <div className="chog-meaning">
                                                                {chog.name === 'Amrit' && '💎 Nectar - Best for all activities'}
                                                                {chog.name === 'Shubh' && '🌟 Auspicious - Good for new beginnings'}
                                                                {chog.name === 'Labh' && '💰 Profit - Favorable for business'}
                                                                {chog.name === 'Char' && '🚶 Movement - Good for travel'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    )}

                    {/* Tips Section */}
                    <div className="tips-section">
                        <h2 className="section-title">
                            <span className="title-icon">💡</span>
                            How to Use These Timings
                        </h2>
                        <div className="tips-grid">
                            <div className="tip-card">
                                <div className="tip-icon">🌟</div>
                                <h3>Pancha Rahita</h3>
                                <p>Best for all important life events - marriages, house warming, business launches, major purchases</p>
                            </div>
                            <div className="tip-card">
                                <div className="tip-icon">☀️</div>
                                <h3>Abhijit Muhurat</h3>
                                <p>Short but powerful - ideal when you need quick success in urgent matters</p>
                            </div>
                            <div className="tip-card">
                                <div className="tip-icon">🌅</div>
                                <h3>Brahma Muhurat</h3>
                                <p>Perfect for spiritual practices, yoga, meditation, and studying sacred texts</p>
                            </div>
                            <div className="tip-card">
                                <div className="tip-icon">🎯</div>
                                <h3>Choghadiya</h3>
                                <p>Choose based on activity type - Amrit for important work, Labh for business, Char for travel</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoodTimingsPage;
