/**
 * Time utilities for Surya Siddhanta
 * Implements Ahargana (day count) calculation
 */

const { KALI_YUGA_JDN } = require('../constants/ss_constants');

const TimeUtils = {
    /**
     * Convert Gregorian date to Julian Day Number (JDN)
     * @param {Date} date 
     * @returns {number} JDN
     */
    getJulianDay(date) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();

        let y = year;
        let m = month;
        if (m <= 2) {
            y -= 1;
            m += 12;
        }

        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);

        const jdn = Math.floor(365.25 * (y + 4716)) +
            Math.floor(30.6001 * (m + 1)) +
            day + b - 1524.5 +
            (hour / 24) + (minute / 1440) + (second / 86400);

        return jdn;
    },

    /**
     * Calculate Ahargana (Kali Ahargana) from a Date
     * @param {Date} date 
     * @returns {number} Ahargana
     */
    getAhargana(date) {
        const jdn = this.getJulianDay(date);
        return jdn - KALI_YUGA_JDN;
    }
};

module.exports = TimeUtils;
