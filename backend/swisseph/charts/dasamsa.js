/**
 * D10 - Dasamsa Chart Calculator
 */

const DivisionalCharts = require('./divisional');
const config = require('../core/config');

class DasamsaChart extends DivisionalCharts {
    calculate(planetDetails) {
        return planetDetails.map(p => {
            // D10 Logic:
            // Odd Signs: Start from same sign
            // Even Signs: Start from 9th from same sign

            const rashiIndex = p.rashiIndex;
            const degInRashi = p.degrees;
            const part = Math.floor(degInRashi / 3); // 3 degrees per part

            let d10Index;
            if (rashiIndex % 2 === 0) { // Odd Sign (0=Mesha/Aries which is 1st sign)
                d10Index = (rashiIndex + part) % 12;
            } else { // Even Sign
                d10Index = (rashiIndex + 8 + part) % 12; // +9th house = +8 index
            }

            return {
                name: p.name,
                rashi: config.RASHIS[d10Index],
                rashiIndex: d10Index,
                part: part + 1
            };
        });
    }
}

module.exports = DasamsaChart;
