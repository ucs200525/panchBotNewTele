/**
 * Rtu (Season) Calculator
 * Calculates the six Hindu seasons
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS } = require('../core/config');

class RtuCalculator extends BaseCalculator {
    /**
     * Get Rtu based on Sun's longitude
     */
    getRtu(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        const sunPos = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const siderealLong = this.tropicalToSidereal(sunPos.longitude, ayanamsa);
        
        // Rtu is based on 60° segments of Sun's sidereal movement
        const rtuIndex = Math.floor(siderealLong / 60) % 6;
        
        const rtuNames = [
            'Vasanta (Spring)', 
            'Grishma (Summer)', 
            'Varsha (Monsoon)', 
            'Sharad (Autumn)', 
            'Hemanta (Pre-winter)', 
            'Shishira (Winter)'
        ];

        return {
            index: rtuIndex,
            name: rtuNames[rtuIndex]
        };
    }
}

module.exports = RtuCalculator;
