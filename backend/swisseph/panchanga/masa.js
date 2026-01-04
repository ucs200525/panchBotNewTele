/**
 * Masa Calculator
 * Calculates Hindu Lunar and Solar Months
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS } = require('../core/config');

class MasaCalculator extends BaseCalculator {
    /**
     * Get Solar Masa (Rashi of Sun)
     */
    getSolarMasa(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        const sunPos = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const siderealLong = this.tropicalToSidereal(sunPos.longitude, ayanamsa);

        const masaIndex = Math.floor(siderealLong / 30);
        const solarMasaNames = [
            'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
            'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
        ];

        // Month names based on Solar transit
        const hinduSolarMasaNames = [
            'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwina',
            'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna', 'Chaitra'
        ];

        return {
            index: masaIndex,
            rashi: solarMasaNames[masaIndex],
            name: hinduSolarMasaNames[masaIndex]
        };
    }

    /**
     * Get Lunar Month (Masa)
     * Simplified: Based on Sun's Rashi at New Moon
     */
    getLunarMasa(date) {
        // For more accuracy, we should find the previous Amavasya (New Moon)
        // and check Sun's rashi at that time.
        // For now, returning the solar-based masa which is often used as a proxy
        // in simplified panchangas.
        return this.getSolarMasa(date);
    }
}

module.exports = MasaCalculator;
