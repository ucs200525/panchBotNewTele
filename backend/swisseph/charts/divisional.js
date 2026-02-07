/**
 * Base Divisional Chart Class
 */

const BaseCalculator = require('../core/baseCalculator');
const config = require('../core/config');

class DivisionalCharts extends BaseCalculator {
    /**
     * Get Houses for a given Lagna (Generic)
     */
    getHouses(lagnaRashiIndex, planetPositions) {
        // Validation to prevent crash
        if (lagnaRashiIndex === undefined || lagnaRashiIndex === null || isNaN(lagnaRashiIndex)) {
            console.error('getHouses Error: Invalid lagnaRashiIndex', lagnaRashiIndex);
            lagnaRashiIndex = 0; // Fallback
        }

        const houses = Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            rashiIndex: (lagnaRashiIndex + i) % 12,
            rashi: config.RASHIS[(lagnaRashiIndex + i) % 12],
            planets: []
        }));

        planetPositions.forEach(p => {
            const houseIndex = (p.rashiIndex - lagnaRashiIndex + 12) % 12;
            houses[houseIndex].planets.push(p.name);
        });

        return houses;
    }
}

module.exports = DivisionalCharts;
