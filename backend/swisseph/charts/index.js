/**
 * Charts Module API - Unified Shodashvarga
 */

const DivisionalCalculator = require('./divisional');
const calculator = new DivisionalCalculator();

module.exports = {
    /**
     * Calculate any varga chart
     * @param {Array} planets - list of planets with longitude
     * @param {Number} v - Varga number (1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60)
     */
    calculateVarga: (planets, v) => calculator.calculateVarga(planets, v),
    
    // Explicit helpers for backward compatibility if needed
    calculateD1: (planets) => calculator.calculateVarga(planets, 1),
    calculateD9: (planets) => calculator.calculateVarga(planets, 9),
    calculateD10: (planets) => calculator.calculateVarga(planets, 10),

    /**
     * Get 12 Houses layout
     * @param {Number} lagnaIdx - Rashi index of Ascendant
     * @param {Array} vargaPlanets - Planets after divisional calculation
     */
    getHouses: (lagnaIdx, vargaPlanets) => calculator.getHouses(lagnaIdx, vargaPlanets),

    /**
     * Get Divisional Rashi for single coordinate
     */
    getVargaRashi: (long, v) => calculator.getVargaRashi(long, v)
};
