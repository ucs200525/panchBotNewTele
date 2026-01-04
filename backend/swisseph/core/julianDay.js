/**
 * Julian Day Number Utilities
 * Conversion between Date objects and Julian Day Numbers
 */

const { swisseph } = require('./config');

/**
 * Convert JavaScript Date to Julian Day Number (UTC)
 * @param {Date} date - JavaScript Date object
 * @returns {number} Julian Day Number
 */
function dateToJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

    return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

/**
 * Convert Julian Day Number to JavaScript Date (UTC)
 * @param {number} julday - Julian Day Number
 * @returns {Date} JavaScript Date object
 */
function julianDayToDate(julday) {
    const utc = swisseph.swe_jdut1_to_utc(julday, swisseph.SE_GREG_CAL);

    return new Date(Date.UTC(
        utc.year,
        utc.month - 1,
        utc.day,
        utc.hour,
        utc.minute,
        Math.floor(utc.second)
    ));
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
