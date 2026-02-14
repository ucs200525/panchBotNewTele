/**
 * Surya Siddhanta Planetary Model
 * Implements Mean and True Longitude calculations
 */

const { MAHAYUGA_DAYS, REVOLUTIONS } = require('..\\..\\constants\\ss_constants');
const MathUtils = require('..\\..\\core\\math_utils');

const PlanetaryModel = {
    /**
     * Calculate Mean Longitude for a planet
     * @param {number} ahargana 
     * @param {string} planetKey - Key from SS_CONSTANTS.REVOLUTIONS
     * @returns {number} Mean Longitude in degrees [0, 360)
     */
    calculateMeanLongitude(ahargana, planetKey) {
        const revs = REVOLUTIONS[planetKey];
        if (!revs) throw new Error(`Unknown planet: ${planetKey}`);

        // Mean Position = (Ahargana * Revolutions in Mahayuga) / Days in Mahayuga
        // We use fractional part to get position within one revolution
        const totalRevs = (ahargana * revs) / MAHAYUGA_DAYS;
        const fraction = totalRevs % 1;

        return MathUtils.normalizeDeg(fraction * 360);
    },

    /**
     * Calculate Manda Phala (Equation of Center)
     * Simplified version for Sun and Moon
     * @param {number} meanLong 
     * @param {number} apogee 
     * @param {number} mandaParidhi - Simplified constant for now
     * @returns {number} Manda Phala in degrees
     */
    calculateMandaPhala(meanLong, apogee, mandaParidhi) {
        const mandaKendra = MathUtils.normalizeDeg(meanLong - apogee);
        const jyaKendra = MathUtils.getJya(mandaKendra);

        // Manda Phala = (Jya(Kendra) * MandaParidhi) / 360
        const phala = (jyaKendra * mandaParidhi) / 360;

        // Convert Jya back to degrees (inverse sin of phala/R)
        // Since phala is Jya-scale, we scale it to degrees
        return (phala / 3438) * (180 / Math.PI);
    }
};

module.exports = PlanetaryModel;
