import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AstronomicalPage = () => {
    const { localDate } = useAuth();
    const [currentDate, setCurrentDate] = useState(localDate || new Date().toISOString().substring(0, 10));
    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEventData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/astronomical/eclipses`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: currentDate })
                }
            );

            if (!response.ok) throw new Error('Failed to fetch event data');
            const data = await response.json();
            setEventData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);

    return (
        <div className="content">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-icon">🔭</div>
                    <h1 className="hero-title">Astronomical Events</h1>
                    <p className="hero-subtitle">
                        Track significant celestial phenomena including solar and lunar eclipses
                    </p>
                </div>

                {/* Hero Form */}
                <div className="hero-form">
                    <form onSubmit={(e) => { e.preventDefault(); fetchEventData(); }}>
                        <div className="form-group-inline">
                            <div className="input-wrapper" style={{ flex: '2' }}>
                                <label className="input-label">Reference Date</label>
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
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">✨</span>
                                    Find Upcoming Events
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

                {eventData && (
                    <div className="events-grid">
                        <h2 className="section-title">🌑 Upcoming Eclipses</h2>

                        <div className="data-grid">
                            <div className="data-card">
                                <div className="data-card-label">Solar Eclipse</div>
                                <div className="data-card-value">
                                    {eventData.solar ? (
                                        <div>
                                            {new Date(eventData.solar.time).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    ) : 'No Upcoming Solar Eclipse'}
                                </div>
                                {eventData.solar && (
                                    <div className="data-card-sub">
                                        Type: {eventData.solar.type} | Magnitude: {eventData.solar.magnitude.toFixed(4)}
                                    </div>
                                )}
                            </div>

                            <div className="data-card">
                                <div className="data-card-label">Lunar Eclipse</div>
                                <div className="data-card-value">
                                    {eventData.lunar ? (
                                        <div>
                                            {new Date(eventData.lunar.time).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    ) : 'No Upcoming Lunar Eclipse'}
                                </div>
                                {eventData.lunar && (
                                    <div className="data-card-sub">
                                        Type: {eventData.lunar.type} | Magnitude: {eventData.lunar.magnitude.toFixed(4)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="information">
                            <span className="info-icon">ℹ️</span>
                            <p className="info">Eclipses are calculated for the entire planet. Visibility and precise timings depend on your specific geographical location.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AstronomicalPage;
