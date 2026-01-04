/**
 * Paksha Calculator
 * Determines Shukla or Krishna Paksha
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS } = require('../core/config');

class PakshaCalculator extends BaseCalculator {
    /**
     * Get Paksha at time
     */
    getPakshaAtTime(date) {
        const jd = this.getJD(date);

        const sunResult = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const moonResult = this.swisseph.swe_calc_ut(jd, PLANETS.MOON, this.swisseph.SEFLG_SWIEPH);

        const diff = (moonResult.longitude - sunResult.longitude + 360) % 360;

        if (diff < 180) {
            return {
                name: 'Shukla Paksha',
                short: 'Shukla',
                isShukla: true,
                isKrishna: false
            };
        } else {
            return {
                name: 'Krishna Paksha',
                short: 'Krishna',
                isShukla: false,
                isKrishna: true
            };
        }
    }
}

module.exports = PakshaCalculator;
