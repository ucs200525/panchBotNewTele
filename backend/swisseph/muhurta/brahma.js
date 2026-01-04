/**
 * Brahma Muhurta Calculator
 */

const BaseCalculator = require('../core/baseCalculator');

class Brahma extends BaseCalculator {
    calculate(sunrise) {
        // 96 minutes before sunrise
        const start = new Date(sunrise.getTime() - 96 * 60000);
        const end = new Date(sunrise.getTime() - 48 * 60000);
        return {
            name: 'Brahma Muhurta',
            start,
            end
        };
    }
}

module.exports = Brahma;
