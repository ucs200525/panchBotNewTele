import React from 'react';
import './PanchangInfo.css';

const PanchangInfo = ({ data }) => {
    if (!data) return null;

    return (
        <div className="panchang-container">
            <h2 className="panchang-title">📅 Today's Panchanga</h2>

            {/* Compact Panchang Table */}
            <div className="panchang-table">
                {/* Display all Tithis together under one label */}
                <div className="panchang-row">
                    <div className="panchang-label">Tithi</div>
                    <div className="panchang-value">
                        {data.tithis && data.tithis.map((tithi, index) => (
                            <div key={`tithi-${index}`} style={{ marginBottom: index < data.tithis.length - 1 ? '10px' : '0' }}>
                                {tithi.name}
                                {tithi.endTime && <span style={{ color: '#666', marginLeft: '8px' }}>(till {tithi.endTime})</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Display all Nakshatras together under one label */}
                <div className="panchang-row">
                    <div className="panchang-label">Nakshatra</div>
                    <div className="panchang-value">
                        {data.nakshatras && data.nakshatras.map((nakshatra, index) => (
                            <div key={`nakshatra-${index}`} style={{ marginBottom: index < data.nakshatras.length - 1 ? '10px' : '0' }}>
                                {nakshatra.name}
                                {nakshatra.endTime && <span style={{ color: '#666', marginLeft: '8px' }}>(till {nakshatra.endTime})</span>}
                                {nakshatra.pada && <span className="badge-small" style={{ marginLeft: '8px' }}>Pada {nakshatra.pada}</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">Yoga</div>
                    <div className="panchang-value">
                        {data.yoga?.name || 'N/A'}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">Karana</div>
                    <div className="panchang-value">
                        {data.karana?.name || 'N/A'}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">Weekday</div>
                    <div className="panchang-value">
                        {data.vara || data.weekday || 'N/A'}
                    </div>
                </div>

                <div className="panchang-row">
                    <div className="panchang-label">Paksha</div>
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
