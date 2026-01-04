import React from 'react';
import './PanchangInfo.css';

const PanchangInfo = ({ data }) => {
    if (!data) return null;

    // Helper function to format time strings
    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        
        // If it's already formatted (contains AM/PM), return as is
        if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
            return timeStr;
        }
        
        // If it's an ISO string, parse and format
        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;
            
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="panchang-container">
            <h2 className="panchang-title">📅 Today's Panchanga</h2>

            {/* Compact Panchang Table */}
            <div className="panchang-table">
                {/* Display all Tithis together under one label */}
                <div className="panchang-row">
                    <div className="panchang-label">🌙 Tithi</div>
                    <div className="panchang-value">
                        {data.tithis && data.tithis.map((tithi, index) => (
                            <div key={`tithi-${index}`} className="panchang-item">
                                <div className="item-header">
                                    <strong>{tithi.name}</strong>
                                    {tithi.paksha && (
                                        <span className="badge-small">
                                            {tithi.paksha === 'Shukla Paksha' ? '🤍' : '🖤'} {tithi.paksha}
                                        </span>
                                    )}
                                </div>
                                {tithi.startTime && tithi.endTime && (
                                    <div className="item-time">
                                        {formatTime(tithi.startTime)} → {formatTime(tithi.endTime)}
                                    </div>
                                )}
                                {tithi.endTime && !tithi.startTime && (
                                    <div className="item-time">
                                        till {formatTime(tithi.endTime)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Display all Nakshatras together under one label */}
                <div className="panchang-row">
                    <div className="panchang-label">⭐ Nakshatra</div>
                    <div className="panchang-value">
                        {data.nakshatras && data.nakshatras.map((nakshatra, index) => (
                            <div key={`nakshatra-${index}`} className="panchang-item">
                                <div className="item-header">
                                    <strong>{nakshatra.name}</strong>
                                    {nakshatra.pada && (
                                        <span className="badge-small">Pada {nakshatra.pada}</span>
                                    )}
                                </div>
                                {nakshatra.startTime && nakshatra.endTime && (
                                    <div className="item-time">
                                        {formatTime(nakshatra.startTime)} → {formatTime(nakshatra.endTime)}
                                    </div>
                                )}
                                {nakshatra.endTime && !nakshatra.startTime && (
                                    <div className="item-time">
                                        till {formatTime(nakshatra.endTime)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">🔗 Yoga</div>
                    <div className="panchang-value">
                        {data.yogas && data.yogas.map((yoga, index) => (
                            <div key={`yoga-${index}`} className="panchang-item">
                                <div className="item-header">
                                    <strong>{yoga.name}</strong>
                                </div>
                                {yoga.startTime && yoga.endTime && (
                                    <div className="item-time">
                                        {formatTime(yoga.startTime)} → {formatTime(yoga.endTime)}
                                    </div>
                                )}
                                {yoga.endTime && !yoga.startTime && (
                                    <div className="item-time">
                                        till {formatTime(yoga.endTime)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">⚡ Karana</div>
                    <div className="panchang-value">
                        {data.karanas && data.karanas.map((karana, index) => (
                            <div key={`karana-${index}`} className="panchang-item">
                                <div className="item-header">
                                    <strong>{karana.name}</strong>
                                </div>
                                {karana.startTime && karana.endTime && (
                                    <div className="item-time">
                                        {formatTime(karana.startTime)} → {formatTime(karana.endTime)}
                                    </div>
                                )}
                                {karana.endTime && !karana.startTime && (
                                    <div className="item-time">
                                        till {formatTime(karana.endTime)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">📆 Weekday</div>
                    <div className="panchang-value">
                        {data.vara || data.weekday || 'N/A'}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">🌓 Paksha</div>
                    <div className="panchang-value">
                        {data.paksha ? `${data.paksha} Paksha` : 'N/A'}
                    </div>
                </div>
            </div>

            {/* Important Timings */}
            <h3 className="section-title">⏰ Important Timings</h3>
            <div className="timings-compact">
                <div className="timing-row timing-neutral">
                    <span className="timing-icon">☀️</span>
                    <span className="timing-label">Sunrise</span>
                    <span className="timing-time">{data.sunrise || 'N/A'}</span>
                </div>
                <div className="timing-row timing-neutral">
                    <span className="timing-icon">🌅</span>
                    <span className="timing-label">Sunset</span>
                    <span className="timing-time">{data.sunset || 'N/A'}</span>
                </div>
                {data.moonrise && data.moonrise !== 'N/A' && (
                    <div className="timing-row timing-neutral">
                        <span className="timing-icon">🌔</span>
                        <span className="timing-label">Moonrise</span>
                        <span className="timing-time">{data.moonrise}</span>
                    </div>
                )}
                {data.moonset && data.moonset !== 'N/A' && (
                    <div className="timing-row timing-neutral">
                        <span className="timing-icon">🌘</span>
                        <span className="timing-label">Moonset</span>
                        <span className="timing-time">{data.moonset}</span>
                    </div>
                )}
                <div className="timing-row timing-good">
                    <span className="timing-icon">✨</span>
                    <span className="timing-label">Abhijit Muhurat</span>
                    <span className="timing-time">
                        {data.abhijitMuhurat?.start || 'N/A'} - {data.abhijitMuhurat?.end || 'N/A'}
                    </span>
                </div>
                {data.brahmaMuhurta && (
                    <div className="timing-row timing-good">
                        <span className="timing-icon">☸️</span>
                        <span className="timing-label">Brahma Muhurta</span>
                        <span className="timing-time">
                            {data.brahmaMuhurta.start} - {data.brahmaMuhurta.end}
                        </span>
                    </div>
                )}
                {data.rahuKaal && (
                    <div className="timing-row timing-bad">
                        <span className="timing-icon">⛔</span>
                        <span className="timing-label">Rahu Kaal</span>
                        <span className="timing-time">
                            {data.rahuKaal.start} - {data.rahuKaal.end}
                        </span>
                    </div>
                )}
                {data.gulika && (
                    <div className="timing-row timing-bad">
                        <span className="timing-icon">⚠️</span>
                        <span className="timing-label">Gulika</span>
                        <span className="timing-time">
                            {data.gulika.start} - {data.gulika.end}
                        </span>
                    </div>
                )}
                {data.yamaganda && (
                    <div className="timing-row timing-bad">
                        <span className="timing-icon">⚠️</span>
                        <span className="timing-label">Yamaganda</span>
                        <span className="timing-time">
                            {data.yamaganda.start} - {data.yamaganda.end}
                        </span>
                    </div>
                )}
            </div>

            {/* Additional Info */}
            {(data.moonPhase || data.moonSign || data.sunSign || data.masa || data.samvatsara || data.ayanamsa) && (
                <>
                    <h3 className="section-title">🌌 Astronomical Details</h3>
                    <div className="info-compact">
                        {data.moonPhase && data.moonPhase !== 'N/A' && (
                            <div className="info-tag">🌙 {data.moonPhase}</div>
                        )}
                        {data.moonSign && data.moonSign !== 'N/A' && (
                            <div className="info-tag">Moon Sign: {data.moonSign}</div>
                        )}
                        {data.sunSign && data.sunSign !== 'N/A' && (
                            <div className="info-tag">Sun Sign: {data.sunSign}</div>
                        )}
                    </div>
                </>
            )}

            {/* Hindu Calendar Details */}
            {(data.masa || data.samvatsara || data.vikramaYear || data.shakaYear || data.amantaMonth || data.purnimantaMonth) && (
                <>
                    <h3 className="section-title">📅 Hindu Calendar</h3>
                    <div className="panchang-table">
                        {data.rtu && data.rtu !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Rtu (Season)</div>
                                <div className="panchang-value">{data.rtu}</div>
                            </div>
                        )}
                        {data.masa && data.masa !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Masa</div>
                                <div className="panchang-value">{data.masa}</div>
                            </div>
                        )}
                        {data.amantaMonth && data.amantaMonth !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Amanta Month</div>
                                <div className="panchang-value">{data.amantaMonth}</div>
                            </div>
                        )}
                        {data.purnimantaMonth && data.purnimantaMonth !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Purnimanta Month</div>
                                <div className="panchang-value">{data.purnimantaMonth}</div>
                            </div>
                        )}
                        {data.samvatsara && data.samvatsara !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Samvatsara</div>
                                <div className="panchang-value">{data.samvatsara}</div>
                            </div>
                        )}
                        {data.vikramaYear && data.vikramaYear !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Vikrama Year</div>
                                <div className="panchang-value">{data.vikramaYear}</div>
                            </div>
                        )}
                        {data.shakaYear && data.shakaYear !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Shaka Year</div>
                                <div className="panchang-value">{data.shakaYear}</div>
                            </div>
                        )}
                        {data.ayanamsa && data.ayanamsa !== 'N/A' && (
                            <div className="panchang-row">
                                <div className="panchang-label">Ayanamsa</div>
                                <div className="panchang-value">{data.ayanamsa}</div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Choghadiya Timings */}
            {data.choghadiya && (
                <>
                    <h3 className="section-title">⏱️ Choghadiya Timings</h3>
                    <div className="choghadiya-container">
                        <div className="choghadiya-column">
                            <h4 className="choghadiya-subtitle">Day Choghadiya</h4>
                            <div className="panchang-table">
                                {data.choghadiya.day.map((p, i) => (
                                    <div key={`day-chog-${i}`} className={`panchang-row ${p.type.toLowerCase()}-row`}>
                                        <div className="panchang-label">{p.name}</div>
                                        <div className="panchang-value">
                                            {p.start} - {p.end}
                                            <span className={`badge-${p.type.toLowerCase()}`}>{p.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="choghadiya-column">
                            <h4 className="choghadiya-subtitle">Night Choghadiya</h4>
                            <div className="panchang-table">
                                {data.choghadiya.night.map((p, i) => (
                                    <div key={`night-chog-${i}`} className={`panchang-row ${p.type.toLowerCase()}-row`}>
                                        <div className="panchang-label">{p.name}</div>
                                        <div className="panchang-value">
                                            {p.start} - {p.end}
                                            <span className={`badge-${p.type.toLowerCase()}`}>{p.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Lagna (Ascendant) Timings */}
            {data.lagnas && data.lagnas.length > 0 && (
                <>
                    <h3 className="section-title">🌅 Lagna Muhurta for the day</h3>
                    <div className="panchang-table">
                        {data.lagnas.map((lagna, index) => {
                            // Zodiac symbols for each Rashi
                            const rashiSymbols = {
                                'Mesha': '♈', 'Vrishabha': '♉', 'Mithuna': '♊',
                                'Karka': '♋', 'Simha': '♌', 'Kanya': '♍',
                                'Tula': '♎', 'Vrishchika': '♏', 'Dhanu': '♐',
                                'Makara': '♑', 'Kumbha': '♒', 'Meena': '♓'
                            };
                            const symbol = rashiSymbols[lagna.name] || '⭐';
                            
                            // Format the display value with date when crossing midnight
                            let timeDisplay = '';
                            const showStartDate = lagna.startDate && lagna.startDate !== data.date;
                            const showEndDate = lagna.endDate && lagna.endDate !== data.date;
                            
                            if (lagna.startTime && lagna.endTime) {
                                const startStr = showStartDate ? `${lagna.startTime}, ${lagna.startDate}` : lagna.startTime;
                                const endStr = showEndDate ? `${lagna.endTime}, ${lagna.endDate}` : lagna.endTime;
                                timeDisplay = `${startStr} to ${endStr}`;
                            } else if (lagna.startTime) {
                                const startStr = showStartDate ? `${lagna.startTime}, ${lagna.startDate}` : lagna.startTime;
                                timeDisplay = `${startStr} onwards`;
                            } else if (lagna.endTime) {
                                const endStr = showEndDate ? `${lagna.endTime}, ${lagna.endDate}` : lagna.endTime;
                                timeDisplay = `Start of Day to ${endStr}`;
                            }
                            
                            return (
                                <div className="panchang-row" key={`lagna-${index}`}>
                                    <div className="panchang-label">{symbol} {lagna.name}</div>
                                    <div className="panchang-value">{timeDisplay}</div>
                                </div>
                            );
                        })}
                    </div>
                    <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
                        ℹ️ Lagna duration varies by latitude and date. Not fixed 2-hour blocks.
                    </p>
                </>
            )}

            {/* Footer */}
            <div className="panchang-footer-compact">
                <span>✨ Powered by Swiss Ephemeris</span>
            </div>
        </div>
    );
};

export default PanchangInfo;
