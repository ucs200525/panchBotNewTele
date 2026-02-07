/**
 * Swiss Ephemeris Main Export
 * Unified API for all Swiss Ephemeris calculations
 */

// Core utilities
const config = require('./core/config');
const julianDay = require('./core/julianDay');
const BaseCalculator = require('./core/baseCalculator');

// Modules
const lagna = require('./lagna');
const panchanga = require('./panchanga');
const muhurta = require('./muhurta');
const planetary = require('./planetary');
const charts = require('./charts');
const dasha = require('./dasha');
const events = require('./events');

// Export everything
module.exports = {
    // Core
    config,
    julianDay,
    BaseCalculator,

    // Modules
    lagna,
    panchanga,
    muhurta,
    planetary,
    charts,
    dasha,
    events,

    // Quick access to commonly used items
    PLANETS: config.PLANETS,
    RASHIS: config.RASHIS,
    RASHI_SYMBOLS: config.RASHI_SYMBOLS,
    NAKSHATRAS: config.NAKSHATRAS,
    TITHIS: config.TITHIS,
    YOGAS: config.YOGAS,
    KARANAS: config.KARANAS
};
