/**
 * Rise and Set Calculator
 * Calculates Sunrise, Sunset, Moonrise, Moonset
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS } = require('../core/config');

class PlanetaryCalculator extends BaseCalculator {
    /**
     * Calculate Rise or Set time for a planet
     */
    calculateRiseSet(date, lat, lng, bodyId, isRise) {
        const jd = this.getJD(date);

        // SE_CALC_RISE: 1, SE_CALC_SET: 2
        const rsmi = isRise ? this.swisseph.SE_CALC_RISE : this.swisseph.SE_CALC_SET;

        // Flags: SEFLG_SWIEPH
        const flags = this.swisseph.SEFLG_SWIEPH;

        // Atmosphere/Refraction flags
        const atpress = 1013.25;
        const attemp = 15;

        try {
            const result = this.swisseph.swe_rise_trans(
                jd, bodyId, null, flags, rsmi,
                [lng, lat, 0], atpress, attemp
            );

            if (result && result.transitTime) {
                return this.julianDayToDate(result.transitTime);
            }
            
            // Swiss Ephemeris may fail if ephemeris files are missing
            // Caller should implement fallback mechanism
            if (result && result.error) {
                console.warn(`Swiss Ephemeris warning: ${result.error}`);
            }
            return null;
        } catch (error) {
            console.error(`Error calculating rise/set for body ${bodyId}:`, error);
            return null;
        }
    }

    getMoonrise(date, lat, lng) {
        return this.calculateRiseSet(date, lat, lng, PLANETS.MOON, true);
    }

    getMoonset(date, lat, lng) {
        return this.calculateRiseSet(date, lat, lng, PLANETS.MOON, false);
    }

    getSunrise(date, lat, lng) {
        return this.calculateRiseSet(date, lat, lng, PLANETS.SUN, true);
    }

    getSunset(date, lat, lng) {
        return this.calculateRiseSet(date, lat, lng, PLANETS.SUN, false);
    }
}

module.exports = { PlanetaryCalculator };
