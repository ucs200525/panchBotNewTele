/**
 * Surya Siddhanta Engine
 * The main entry point for SS calculations
 */

const TimeUtils = require('..\\core\\time_utils');
const PlanetaryModel = require('.\\planetary_model');
const { REVOLUTIONS } = require('..\\constants\\ss_constants');

class SuryaSiddhantaEngine {
    constructor() {
        // Apogees (Mandocca) are also moving, but very slowly. 
        // For a basic implementation, we can use fixed values or calculate them.
        this.fixedApogees = {
            SUN: 80, // Approx for modern era in SS
            MOON: 0  // Moon's apogee moves fast, we'll calculate it
        };

        // Manda Paridhis (Circumferences) from SS
        this.mandaParidhis = {
            SUN: 14,
            MOON: 32
        };
    }

    /**
     * Get planetary positions for a given date
     * @param {Date} date 
     */
    calculatePositions(date) {
        const ahargana = TimeUtils.getAhargana(date);

        // 1. Sun
        const sunMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'SUN');
        const sunPhala = PlanetaryModel.calculateMandaPhala(sunMean, this.fixedApogees.SUN, this.mandaParidhis.SUN);
        const sunTrue = (sunMean - sunPhala + 360) % 360;

        // 2. Moon
        const moonMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'MOON');
        const moonApogee = PlanetaryModel.calculateMeanLongitude(ahargana, 'MOON_APOGEE');
        const moonPhala = PlanetaryModel.calculateMandaPhala(moonMean, moonApogee, this.mandaParidhis.MOON);
        const moonTrue = (moonMean - moonPhala + 360) % 360;

        // 3. Rahu (Retrograde)
        const rahuMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'RAHU');
        const rahuTrue = (360 - rahuMean) % 360; // Ascending Node is 360 - Mean Node in some contexts, but let's keep it simple

        return {
            ahargana,
            sun: { mean: sunMean, true: sunTrue },
            moon: { mean: moonMean, apogee: moonApogee, true: moonTrue },
            rahu: { true: rahuTrue }
        };
    }
}

module.exports = new SuryaSiddhantaEngine();
