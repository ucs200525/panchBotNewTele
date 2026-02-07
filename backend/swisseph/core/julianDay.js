/**
 * Julian Day Number Utilities
 * Conversion between Date objects and Julian Day Numbers
 * Works with or without native swisseph
 */

const { swisseph, useNative } = require('./config');

/**
 * JavaScript-based Julian Day calculation (for when native swisseph is not available)
 */
function jsDateToJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (hour - 12) / 24;
}

/**
 * Convert JavaScript Date to Julian Day Number (UTC)
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Day Number
 */
function dateToJulianDay(date) {
    if (useNative && swisseph.swe_julday) {
        try {
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
            return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
        } catch (e) {
            console.log('⚠️  Native JD calculation failed, using JS fallback');
            return jsDateToJulianDay(date);
        }
    }
    return jsDateToJulianDay(date);
}

/**
 * Convert Julian Day Number to JavaScript Date (UTC)
 * @param {number} julday - Julian Day Number
 * @returns {Date} JavaScript Date object
 */
function julianDayToDate(julday) {
    if (useNative && swisseph.swe_jdut1_to_utc) {
        try {
            const utc = swisseph.swe_jdut1_to_utc(julday, swisseph.SE_GREG_CAL);
            return new Date(Date.UTC(
                utc.year,
                utc.month - 1,
                utc.day,
                utc.hour,
                utc.minute,
                Math.floor(utc.second)
            ));
        } catch (e) {
            console.log('⚠️  Native JD to date conversion failed, using JS fallback');
        }
    }
    
    // JavaScript fallback
    const jd = julday + 0.5;
    const z = Math.floor(jd);
    const f = jd - z;
    
    let a = z;
    if (z >= 2299161) {
        const alpha = Math.floor((z - 1867216.25) / 36524.25);
        a = z + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    
    const day = b - d - Math.floor(30.6001 * e) + f;
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    
    const hours = (day - Math.floor(day)) * 24;
    const minutes = (hours - Math.floor(hours)) * 60;
    const seconds = (minutes - Math.floor(minutes)) * 60;
    
    return new Date(Date.UTC(year, month - 1, Math.floor(day), Math.floor(hours), Math.floor(minutes), Math.floor(seconds)));
}

/**
 * Get Julian Day for local midnight of a date
 * @param {Date} date - Local date
 * @returns {number} Julian Day at midnight UTC
 */
function getLocalMidnightJD(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const midnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    return dateToJulianDay(midnight);
}

/**
 * Get current Julian Day
 * @returns {number} Current Julian Day Number
 */
function getCurrentJD() {
    return dateToJulianDay(new Date());
}

module.exports = {
    dateToJulianDay,
    julianDayToDate,
    getLocalMidnightJD,
    getCurrentJD
};
