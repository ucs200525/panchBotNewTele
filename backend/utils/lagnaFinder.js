/**
 * Lagna Helper (Legacy Wrapper)
 * Wraps new swisseph/lagna module for backward compatibility
 * 
 * All calculations now use the professional Swiss Ephemeris modules
 */

const { lagna } = require('../swisseph');

// Export functions from new module
module.exports = {
    calculateDayLagnas: lagna.calculateDayLagnas,
    getLagnaAtTime: lagna.getLagnaAtTime,
    RASHI_NAMES: require('../swisseph/core/config').RASHIS
};
