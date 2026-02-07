/**
 * D9 - Navamsa Chart Calculator
 */

const DivisionalCharts = require('./divisional');
const config = require('../core/config');

class NavamsaChart extends DivisionalCharts {
    calculate(planetDetails) {
        return planetDetails.map(p => {
            const totalDegrees = p.siderealLongitude;
            // Navamsa is 3°20' (3.3333 degrees)
            const navamsaIndex = Math.floor(totalDegrees / (30 / 9)) % 108;

            const rashiIndex = p.rashiIndex;
            const degInRashi = p.degrees;
            const navPoint = Math.floor(degInRashi / (30 / 9));

            let navRashiIndex;
            if ([0, 4, 8].includes(rashiIndex)) { // Fire
                navRashiIndex = (0 + navPoint) % 12;
            } else if ([1, 5, 9].includes(rashiIndex)) { // Earth
                navRashiIndex = (9 + navPoint) % 12;
            } else if ([2, 6, 10].includes(rashiIndex)) { // Air
                navRashiIndex = (6 + navPoint) % 12;
            } else { // Water
                navRashiIndex = (3 + navPoint) % 12;
            }

            return {
                name: p.name,
                rashi: config.RASHIS[navRashiIndex],
                rashiIndex: navRashiIndex,
                navPoint: navPoint + 1
            };
        });
    }
}

module.exports = NavamsaChart;
