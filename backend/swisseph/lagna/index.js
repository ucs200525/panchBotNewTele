/**
 * Lagna Module
 * Unified API for all Lagna calculations
 */

const LagnaCalculator = require('./ascendant');

const lagnaCalc = new LagnaCalculator();

/**
 * Get Lagna at specific time
 */
function getLagnaAtTime(date, lat, lng) {
    return lagnaCalc.getLagnaAtTime(date, lat, lng);
}

/**
 * Get all Lagna timings for the day
 */
function calculateDayLagnas(date, lat, lng, timezone, sunriseStr) {
    return lagnaCalc.calculateDayLagnas(date, lat, lng, timezone, sunriseStr);
}

const Hora = require('./hora');

module.exports = {
    LagnaCalculator,
    getLagnaAtTime,
    calculateDayLagnas,
    Hora: new Hora()
};
