/**
 * D1 - Rasi Chart Calculator
 */

const DivisionalCharts = require('./divisional');

class RasiChart extends DivisionalCharts {
    calculate(planetDetails) {
        return planetDetails.map(p => ({
            name: p.name,
            rashi: p.rashi,
            rashiIndex: p.rashiIndex,
            degrees: p.degrees
        }));
    }
}

module.exports = RasiChart;
