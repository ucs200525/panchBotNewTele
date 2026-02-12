/**
 * Base Calculator Class
 * Parent class for all Swiss Ephemeris calculators
 */

const config = require('./config');
const { dateToJulianDay } = require('./julianDay');

class BaseCalculator {
    constructor() {
        this.swisseph = config.swisseph;

        // ✅ Ensure Lahiri Ayanamsa mode is set for native Swiss Ephemeris
        if (this.swisseph.swe_set_sid_mode && this.swisseph.SE_SIDM_LAHIRI !== undefined) {
            try {
                this.swisseph.swe_set_sid_mode(this.swisseph.SE_SIDM_LAHIRI, 0, 0);
            } catch (e) {
                console.warn('⚠️ Failed to set sidereal mode (Lahiri):', e.message);
            }
        }
    }

    /**
     * Get Julian Day for a date
     * @param {Date} date 
     * @returns {number}
     */
    getJD(date) {
        // If Swiss Ephemeris is available, prefer its JD for consistency
        if (this.swisseph.swe_julday) {
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const hour =
                date.getUTCHours() +
                date.getUTCMinutes() / 60 +
                date.getUTCSeconds() / 3600 +
                date.getUTCMilliseconds() / 3600000;

            return this.swisseph.swe_julday(year, month, day, hour, this.swisseph.SE_GREG_CAL);
        }

        // Fallback
        return dateToJulianDay(date);
    }

    /**
     * Convert Julian Day to Date
     * @param {number} jd 
     * @returns {Date}
     */
    julianDayToDate(jd) {
        const swisseph = this.swisseph;

        if (swisseph.swe_revjul) {
            const date = swisseph.swe_revjul(jd, swisseph.SE_GREG_CAL);

            const timeDec = date.hour;
            const hour = Math.floor(timeDec);
            const minDec = (timeDec - hour) * 60;
            const min = Math.floor(minDec);
            const sec = Math.floor((minDec - min) * 60);

            return new Date(Date.UTC(date.year, date.month - 1, date.day, hour, min, sec));
        }

        // Fallback (approx)
        const ms = (jd - 2440587.5) * 86400000;
        return new Date(ms);
    }

    /**
     * Get ayanamsa for a given Julian Day
     * @param {number} jd - Julian Day
     * @returns {number} Ayanamsa in degrees
     */
    getAyanamsa(jd) {
        // ✅ Always use Swiss Ephemeris native ayanamsa when available
        if (this.swisseph.swe_get_ayanamsa_ut) {
            return this.swisseph.swe_get_ayanamsa_ut(jd);
        }

        // Fallback (should rarely happen now)
        return 0;
    }

    /**
     * Convert tropical to sidereal longitude
     * @param {number} tropical - Tropical longitude
     * @param {number} ayanamsa - Ayanamsa value
     * @returns {number} Sidereal longitude (0-360)
     */
    tropicalToSidereal(tropical, ayanamsa) {
        let sidereal = tropical - ayanamsa;
        while (sidereal < 0) sidereal += 360;
        while (sidereal >= 360) sidereal -= 360;
        return sidereal;
    }

    /**
     * Normalize angle to 0-360 range
     * @param {number} angle 
     * @returns {number}
     */
    normalizeAngle(angle) {
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        return angle;
    }

    /**
     * Format time from Date object
     * @param {Date} date 
     * @param {string} timezone 
     * @returns {string} Formatted time
     */
    formatTime(date, timezone = 'Asia/Kolkata') {
        return date.toLocaleTimeString('en-IN', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    /**
     * Binary search for exact moment when value crosses boundary
     * @param {Date} startTime 
     * @param {Date} endTime 
     * @param {Function} valueGetter - Function that returns current value
     * @param {number} boundary - Target boundary value
     * @param {number} maxIterations 
     * @returns {Date} Exact crossing time
     */
    binarySearch(startTime, endTime, valueGetter, boundary, maxIterations = 30) {
        const threshold = 5 * 1000; // 🎯 Improve precision to 5 seconds
        let iterations = 0;

        while ((endTime - startTime) > threshold && iterations < maxIterations) {
            const midTime = new Date((startTime.getTime() + endTime.getTime()) / 2);
            iterations++;

            const value = valueGetter(midTime);

            if (value >= boundary) {
                endTime = midTime;
            } else {
                startTime = midTime;
            }
        }

        return endTime;
    }
}

module.exports = BaseCalculator;
