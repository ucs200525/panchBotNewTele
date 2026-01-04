/**
 * Muhurta Calculator
 * Calculates Gulika Kalam, Yamaganda, and other inauspicious timings
 */

const BaseCalculator = require('../core/baseCalculator');

class MuhurtaCalculator extends BaseCalculator {
    /**
     * Calculate Gulika Kalam (Son of Saturn - inauspicious period)
     * @param {Date} sunrise 
     * @param {Date} sunset 
     * @param {number} weekday - 0=Sunday, 1=Monday, etc.
     * @returns {Object} {start, end}
     */
    calculateGulikaKalam(sunrise, sunset, weekday) {
        const dayDuration = sunset.getTime() - sunrise.getTime();
        const onePart = dayDuration / 8; // Divide day into 8 parts

        // Gulika order: Sun-6, Mon-5, Tue-4, Wed-3, Thu-2, Fri-1, Sat-7
        const gulikaOrder = [6, 5, 4, 3, 2, 1, 7]; // Sunday to Saturday
        const partNumber = gulikaOrder[weekday];

        const start = new Date(sunrise.getTime() + (partNumber - 1) * onePart);
        const end = new Date(sunrise.getTime() + partNumber * onePart);

        return { start, end };
    }

    /**
     * Calculate Yamaganda (Son of Jupiter - inauspicious period)
     * @param {Date} sunrise 
     * @param {Date} sunset 
     * @param {number} weekday 
     * @returns {Object} {start, end}
     */
    calculateYamaganda(sunrise, sunset, weekday) {
        const dayDuration = sunset.getTime() - sunrise.getTime();
        const onePart = dayDuration / 8;

        // Yamaganda order: Sun-5, Mon-4, Tue-3, Wed-2, Thu-1, Fri-7, Sat-6
        const yamagandaOrder = [5, 4, 3, 2, 1, 7, 6];
        const partNumber = yamagandaOrder[weekday];

        const start = new Date(sunrise.getTime() + (partNumber - 1) * onePart);
        const end = new Date(sunrise.getTime() + partNumber * onePart);

        return { start, end };
    }

    /**
     * Calculate Brahma Muhurta (auspicious early morning period)
     * @param {Date} sunrise 
     * @returns {Object} {start, end}
     */
    calculateBrahmaMuhurta(sunrise) {
        // Brahma Muhurta is 1 hour 36 minutes before sunrise
        const muhurtaDuration = 96 * 60 * 1000; // 96 minutes = 1h 36m
        const end = new Date(sunrise.getTime());
        const start = new Date(sunrise.getTime() - muhurtaDuration);

        return { start, end };
    }
}

module.exports = MuhurtaCalculator;
