import React from 'react';
import './PanchangInfo.css';

const PanchangInfo = ({ data }) => {
    if (!data) return null;

    return (
        <div className="panchang-container">
            <h2 className="panchang-title">📅 Daily Panchang Elements</h2>

            <div className="panchang-grid">
                {/* Tithi */}
                <div className="panchang-card">
                    <div className="card-icon">🌙</div>
                    <div className="card-content">
                        <h3>Tithi</h3>
                        <p className="card-value">{data.tithi?.name || 'N/A'}</p>
                        <p className="card-timing">Till {data.tithi?.endTime || 'N/A'}</p>
                    </div>
                </div>

                {/* Nakshatra */}
                <div className="panchang-card">
                    <div className="card-icon">⭐</div>
                    <div className="card-content">
                        <h3>Nakshatra</h3>
                        <p className="card-value">{data.nakshatra?.name || 'N/A'}</p>
                        <p className="card-timing">Till {data.nakshatra?.endTime || 'N/A'}</p>
                    </div>
                </div>

                {/* Yoga */}
                <div className="panchang-card">
                    <div className="card-icon">🕉️</div>
                    <div className="card-content">
                        <h3>Yoga</h3>
                        <p className="card-value">{data.yoga?.name || 'N/A'}</p>
                        <p className="card-timing">Till {data.yoga?.endTime || 'N/A'}</p>
                    </div>
                </div>

                {/* Karana */}
                <div className="panchang-card">
                    <div className="card-icon">⚡</div>
                    <div className="card-content">
                        <h3>Karana</h3>
                        <p className="card-value">{data.karana?.name || 'N/A'}</p>
                        <p className="card-timing">Till {data.karana?.endTime || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <h2 className="panchang-title">⏰ Important Timings</h2>

            <div className="timing-grid">
                {/* Rahu Kaal - Inauspicious */}
                <div className="timing-card timing-bad">
                    <div className="timing-header">
                        <span className="timing-icon">⛔</span>
                        <h3>Rahu Kaal</h3>
                    </div>
                    <div className="timing-content">
                        <p className="timing-range">
                            {data.rahuKaal?.start || 'N/A'} - {data.rahuKaal?.end || 'N/A'}
                        </p>
                        <p className="timing-note">❌ Inauspicious Period - Avoid new ventures</p>
                    </div>
                </div>

                {/* Gulika - Inauspicious */}
                <div className="timing-card timing-bad">
                    <div className="timing-header">
                        <span className="timing-icon">⚠️</span>
                        <h3>Gulika (Yamghanda)</h3>
                    </div>
                    <div className="timing-content">
                        <p className="timing-range">
                            {data.gulika?.start || 'N/A'} - {data.gulika?.end || 'N/A'}
                        </p>
                        <p className="timing-note">❌ Avoid important work</p>
                    </div>
                </div>

                {/* Abhijit Muhurat - Auspicious */}
                <div className="timing-card timing-good">
                    <div className="timing-header">
                        <span className="timing-icon">✨</span>
                        <h3>Abhijit Muhurat</h3>
                    </div>
                    <div className="timing-content">
                        <p className="timing-range">
                            {data.abhijitMuhurat?.start || 'N/A'} - {data.abhijitMuhurat?.end || 'N/A'}
                        </p>
                        <p className="timing-note">✅ Most auspicious time - Perfect for all activities</p>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info">
                <div className="info-item">
                    <span className="info-label">Paksha:</span>
                    <span className="info-value">{data.paksha || 'N/A'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Moon Sign:</span>
                    <span className="info-value">{data.moonSign || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default PanchangInfo;
