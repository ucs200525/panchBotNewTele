import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './DailyPanchang.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import './hero-styles.css';

const DailyPanchang = () => {
    const { localCity, setCityAndDate, selectedLat, selectedLng, setLocationDetails, timeZone } = useAuth();
    const [cityName, setCityName] = useState(localCity || '');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [panchangData, setPanchangData] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sync local state with context when context changes
    useEffect(() => {
        if (localCity) setCityName(localCity);
    }, [localCity]);

    const fetchPanchang = useCallback(async () => {
        if (!cityName || !currentDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
            let url = `${API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`;

            // Use coordinates and timezone from context if available and matching current city
            if (selectedLat && selectedLng && selectedLat !== 'undefined' && selectedLng !== 'undefined') {
                url += `&lat=${selectedLat}&lng=${selectedLng}`;
                if (timeZone) url += `&timeZone=${timeZone}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch Panchang data');

            const data = await response.json();
            setPanchangData(data);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [cityName, currentDate, selectedLat, selectedLng]);

    // Removed automatic fetch on mount to allow user to click Calculate manually
    /*
    useEffect(() => {
        if (cityName) {
            fetchPanchang();
        }
    }, [fetchPanchang]);
    */

    const formatDisplayTime = (timeStr, fallback = '', showDate = false) => {
        if (!timeStr || timeStr === 'N/A') return fallback;

        const getFormattedDate = (dateObj) => {
            return dateObj.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
            });
        };

        if (timeStr === 'Previous day') {
            const dateObj = new Date(currentDate);
            return showDate ? `12:00 AM, ${getFormattedDate(dateObj)}` : '12:00 AM';
        }

        if (timeStr === 'Next day') return 'Next Day Time & Date';

        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;

            const timeFormatted = date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            if (showDate) {
                return `${timeFormatted}, ${getFormattedDate(date)}`;
            }

            return timeFormatted;
        } catch (e) {
            return timeStr;
        }
    };

    const handleGetPanchang = (e) => {
        e.preventDefault();
        setCityAndDate(cityName, currentDate);
        fetchPanchang();
    };

    const renderTableSection = (title, subtitle, headers, rows) => (
        <div className={styles.panchangSection}>
            <h2 className={styles.sectionHeader}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
            <div className={styles.tableWrapper}>
                <table className={styles.panchangTable}>
                    <thead>
                        <tr>
                            {headers.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className={row.className || ''}>
                                {row.cells.map((cell, j) => (
                                    <td key={j} className={cell.className || ''}>{cell.content}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="content">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="hero-icon">🌞</span> DAILY PANCHANG
                    </h1>
                    <p className="hero-subtitle">Premium Vedic calendar and astronomical data for any city</p>

                    <form className="hero-form" onSubmit={handleGetPanchang}>
                        <div className="form-row">
                            <div className="input-wrapper">
                                <label className="input-label">Select City</label>
                                <CityAutocomplete
                                    value={cityName}
                                    onChange={(newValue) => setCityName(newValue)}
                                    onSelect={(cityData) => {
                                        setCityName(cityData.name);
                                        setLocationDetails({
                                            name: cityData.name,
                                            lat: cityData.lat,
                                            lng: cityData.lng,
                                            // timeZone: cityData.timeZone // If CityAutocomplete provides this
                                        });
                                    }}
                                />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Select Date</label>
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
                <div className={`results-section ${styles.panchangResults}`}>

                    {/* Sun & Moon Timings Table */}
                    {renderTableSection(
                        "Sun & Moon Timings",
                        null,
                        ["Event", "Time"],
                        [
                            { cells: [{ content: "Sunrise", className: styles.labelCell }, { content: panchangData.sunrise, className: styles.valueCell }] },
                            { cells: [{ content: "Sunset", className: styles.labelCell }, { content: panchangData.sunset, className: styles.valueCell }] },
                            { cells: [{ content: "Moonrise", className: styles.labelCell }, { content: panchangData.moonrise || "N/A", className: styles.valueCell }] },
                            { cells: [{ content: "Moonset", className: styles.labelCell }, { content: panchangData.moonset || "N/A", className: styles.valueCell }] }
                        ]
                    )}

                    {/* Vedic Elements Table */}
                    {renderTableSection(
                        "Panchanga Elements",
                        "Key Vedic calendar details for the day",
                        ["Element", "Description / Value"],
                        [
                            { cells: [{ content: "Weekday (Vara)", className: styles.labelCell }, { content: `${panchangData.weekday} (${panchangData.varaLord?.planet || ""})`, className: styles.valueCell }] },
                            { cells: [{ content: "Tithi", className: styles.labelCell }, { content: `${panchangData.tithi.name} (#${panchangData.tithi.number}) ${panchangData.tithi.endTime ? `Upto ${formatDisplayTime(panchangData.tithi.endTime)}` : ""}`, className: styles.valueCell }] },
                            { cells: [{ content: "Nakshatra", className: styles.labelCell }, { content: `${panchangData.nakshatra.name} (#${panchangData.nakshatra.number}) ${panchangData.nakshatra.endTime ? `Upto ${formatDisplayTime(panchangData.nakshatra.endTime)}` : ""}`, className: styles.valueCell }] },
                            { cells: [{ content: "Yoga", className: styles.labelCell }, { content: `${panchangData.yoga.name} (#${panchangData.yoga.number}) ${panchangData.yoga.endTime ? `Upto ${formatDisplayTime(panchangData.yoga.endTime)}` : ""}`, className: styles.valueCell }] },
                            { cells: [{ content: "Karana", className: styles.labelCell }, { content: `${panchangData.karana.name} (#${panchangData.karana.number}) ${panchangData.karana.endTime ? `Upto ${formatDisplayTime(panchangData.karana.endTime)}` : ""}`, className: styles.valueCell }] },
                            { cells: [{ content: "Paksha", className: styles.labelCell }, { content: panchangData.paksha, className: styles.pakshaCell }] },
                            { cells: [{ content: "Masa (Month)", className: styles.labelCell }, { content: `${panchangData.masa?.name || "N/A"} (${panchangData.masa?.type || ""})`, className: styles.valueCell }] },
                            { cells: [{ content: "Samvatsara", className: styles.labelCell }, { content: `${panchangData.samvatsara?.name || "N/A"} (Year ${panchangData.samvatsara?.year || ""})`, className: styles.valueCell }] },
                            { cells: [{ content: "Rtu (Season)", className: styles.labelCell }, { content: `${panchangData.rtu?.name || "N/A"} (${panchangData.rtu?.season || ""})`, className: styles.valueCell }] },
                            { cells: [{ content: "Moon Phase", className: styles.labelCell }, { content: `${panchangData.moonPhase?.emoji || ""} ${panchangData.moonPhase?.name || ""} (${panchangData.moonPhase?.illumination || ""})`, className: styles.valueCell }] }
                        ]
                    )}

                    {/* Auspicious Muhurats */}
                    {renderTableSection(
                        "Auspicious Muhurats",
                        "Best periods for starting new work or spiritual activities",
                        ["Muhurat", "Time Range", "Status"],
                        [
                            panchangData.abhijitMuhurat && { cells: [{ content: "Abhijit Muhurat", className: styles.nameCell }, { content: `${panchangData.abhijitMuhurat.start} - ${panchangData.abhijitMuhurat.end}` }, { content: <span className={styles.bageShubh}>Very Auspicious</span> }] },
                            panchangData.brahmaMuhurat && { cells: [{ content: "Brahma Muhurat", className: styles.nameCell }, { content: `${panchangData.brahmaMuhurat.start} - ${panchangData.brahmaMuhurat.end}` }, { content: <span className={styles.bageShubh}>Spiritual</span> }] },
                            panchangData.abhijitLagna && panchangData.abhijitLagna.start !== 'N/A' && { cells: [{ content: "Abhijit Lagna", className: styles.nameCell }, { content: `${panchangData.abhijitLagna.start} - ${panchangData.abhijitLagna.end}` }, { content: <span className={styles.bageShubh}>{panchangData.abhijitLagna.rashi}</span> }] }
                        ].filter(Boolean)
                    )}

                    {/* Inauspicious Timings */}
                    {renderTableSection(
                        "Inauspicious Timings",
                        "Periods considered malefic - Avoid important activities",
                        ["Period", "Time Range", "Impact"],
                        [
                            panchangData.rahuKaal && { cells: [{ content: "Rahu Kaal", className: styles.nameCell }, { content: `${panchangData.rahuKaal.start} - ${panchangData.rahuKaal.end}` }, { content: <span className={styles.bageAshubh}>Avoid</span> }] },
                            panchangData.yamaganda && { cells: [{ content: "Yamaganda", className: styles.nameCell }, { content: `${panchangData.yamaganda.start} - ${panchangData.yamaganda.end}` }, { content: <span className={styles.bageAshubh}>Obstacles</span> }] },
                            panchangData.gulika && { cells: [{ content: "Gulika Kalam", className: styles.nameCell }, { content: `${panchangData.gulika.start} - ${panchangData.gulika.end}` }, { content: <span className={styles.bageAshubh}>Delayed</span> }] },
                            panchangData.varjyam && { cells: [{ content: "Varjyam", className: styles.nameCell }, { content: `${panchangData.varjyam.start} - ${panchangData.varjyam.end}` }, { content: <span className={styles.bageAshubh}>Inauspicious</span> }] },
                            ...(panchangData.durMuhurat || []).map(dur => ({
                                cells: [{ content: dur.name, className: styles.nameCell }, { content: `${dur.start} - ${dur.end}` }, { content: <span className={styles.bageAshubh}>Negative</span> }]
                            }))
                        ].filter(Boolean)
                    )}

                    {/* Pancha Rahita Muhurat Table */}
                    {panchangData.panchaRahitaMuhurat && (
                        renderTableSection(
                            "Pancha Rahita Muhurat",
                            "Detailed breakdown of periods based on Panchaka Rahitam calculation",
                            ["#", "Muhurat", "Category", "Start Time", "End Time", "Duration"],
                            panchangData.panchaRahitaMuhurat.map((p, idx) => {
                                const isGood = p.category.toLowerCase().includes('good');
                                return {
                                    className: isGood ? styles.shubhRow : styles.ashubhRow,
                                    cells: [
                                        { content: idx + 1, className: styles.detailCell },
                                        { content: p.muhurat, className: styles.nameCell },
                                        { 
                                            content: <span className={isGood ? styles.bageShubh : styles.bageAshubh}>{p.category}</span>,
                                            className: styles.valueCell
                                        },
                                        { content: p.start, className: styles.valueCell },
                                        { content: p.end, className: styles.valueCell },
                                        { content: <span className={styles.durationBadge}>{p.duration}</span> }
                                    ]
                                };
                            })
                        )
                    )}

                    {/* Choghadiya Day & Night Tables */}
                    <div className={styles.panchangSection}>
                        <h2 className={styles.sectionHeader}>Choghadiya (Day & Night)</h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.panchangTable}>
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Muhurat</th>
                                        <th>Timing</th>
                                        <th className={styles.chogType}>Quality</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={styles.subHeaderRow}>
                                        <td colSpan="4">🌞 Day Choghadiya</td>
                                    </tr>
                                    {panchangData.choghadiya?.day?.map((chog, i) => (
                                        <tr key={`day-${i}`}>
                                            <td>{i + 1}</td>
                                            <td className={styles.nameCell}>{chog.name}</td>
                                            <td>{chog.start} - {chog.end}</td>
                                            <td className={chog.type === 'Good' ? styles.goodCell : styles.badCell}>{chog.type}</td>
                                        </tr>
                                    ))}
                                    <tr className={styles.subHeaderRow}>
                                        <td colSpan="4">🌙 Night Choghadiya</td>
                                    </tr>
                                    {panchangData.choghadiya?.night?.map((chog, i) => (
                                        <tr key={`night-${i}`}>
                                            <td>{i + 1}</td>
                                            <td className={styles.nameCell}>{chog.name}</td>
                                            <td>{chog.start} - {chog.end}</td>
                                            <td className={chog.type === 'Good' ? styles.goodCell : styles.badCell}>{chog.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lagna Transitions Table */}
                    {panchangData.lagnas && (
                        renderTableSection(
                            "Lagna Times (Ascendant Changes)",
                            "All 12 rashi (zodiac sign) ascendant changes throughout the day",
                            ["#", "Lagna (Rashi)", "Start Time", "End Time"],
                            panchangData.lagnas.map((l, i) => ({
                                cells: [
                                    { content: l.number, className: styles.detailCell },
                                    { content: l.name, className: styles.nameCell },
                                    { content: l.startTime, className: styles.valueCell },
                                    { content: l.endTime, className: styles.valueCell }
                                ]
                            }))
                        )
                    )}

                    {/* Tithi Transitions */}
                    {panchangData.tithis && panchangData.tithis.length > 1 && (
                        renderTableSection(
                            "Tithi Transitions",
                            null,
                            ["Tithi", "Time Range", "Paksha"],
                            panchangData.tithis.map(t => ({
                                cells: [
                                    { content: `${t.name} (#${t.number})`, className: styles.nameCell },
                                    { content: <div className={styles.transTimes}><span>{formatDisplayTime(t.startTime, 'Before Day Time', true)}</span><span className={styles.transArrow}>→</span><span>{formatDisplayTime(t.endTime, 'Next Day Time & Date', true)}</span></div> },
                                    { content: t.paksha, className: styles.pakshaCell }
                                ]
                            }))
                        )
                    )}

                    {/* Nakshatra Transitions */}
                    {panchangData.nakshatras && panchangData.nakshatras.length > 1 && (
                        renderTableSection(
                            "Nakshatra Transitions",
                            null,
                            ["Nakshatra", "Time Range", "Lord"],
                            panchangData.nakshatras.map(n => ({
                                cells: [
                                    { content: `${n.name} (#${n.number})`, className: styles.nameCell },
                                    { content: <div className={styles.transTimes}><span>{formatDisplayTime(n.startTime, 'Before Day Time', true)}</span><span className={styles.transArrow}>→</span><span>{formatDisplayTime(n.endTime, 'Next Day Time & Date', true)}</span></div> },
                                    { content: n.lord || "N/A", className: styles.pakshaCell }
                                ]
                            }))
                        )
                    )}


                </div>
            )}
        </div>
    );
};

export default DailyPanchang;
