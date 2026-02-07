import React from 'react';
import './SwissEphemerisAttribution.css';

const SwissEphemerisAttribution = () => {
    return (
        <div className="swiss-ephemeris-attribution">
            <div className="swiss-header">
                <span className="swiss-icon">🛰️</span>
                <h4 className="swiss-title">Powered by Swiss Ephemeris</h4>
            </div>
            <p className="swiss-description">
                Professional-grade astronomical calculations using the industry-standard 
                <strong> Swiss Ephemeris</strong> library, trusted by astrologers worldwide.
            </p>
            <div className="swiss-features">
                <div className="swiss-feature">
                    <span className="feature-icon">✨</span>
                    <span className="feature-text">Sub-arc-second precision</span>
                </div>
                <div className="swiss-feature">
                    <span className="feature-icon">🌍</span>
                    <span className="feature-text">Lahiri Ayanamsa (IAU standard)</span>
                </div>
                <div className="swiss-feature">
                    <span className="feature-icon">🔬</span>
                    <span className="feature-text">NASA JPL DE431 ephemeris data</span>
                </div>
                <div className="swiss-feature">
                    <span className="feature-icon">📐</span>
                    <span className="feature-text">True geometric calculations</span>
                </div>
                <div className="swiss-feature">
                    <span className="feature-icon">🌙</span>
                    <span className="feature-text">Accurate Rahu/Ketu (True Node)</span>
                </div>
                <div className="swiss-feature">
                    <span className="feature-icon">⏰</span>
                    <span className="feature-text">Precise rise/set timings</span>
                </div>
            </div>
            <p className="swiss-footer">
                Swiss Ephemeris © Astrodienst AG • Used under GNU General Public License
            </p>
        </div>
    );
};

export default SwissEphemerisAttribution;
