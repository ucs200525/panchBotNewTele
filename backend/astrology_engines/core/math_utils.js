/**
 * Math utilities for Surya Siddhanta
 * Implements traditional Indian trigonometry (Jya/Sine function)
 */

const { RADIUS } = require('../constants/ss_constants');

const MathUtils = {
    /**
     * Get Jya (Indian Sine) for a given angle in degrees
     * Uses Radius R = 3438
     * @param {number} degrees 
     * @returns {number} Jya value
     */
    getJya(degrees) {
        // Normalize degrees to [0, 360)
        let normalized = ((degrees % 360) + 360) % 360;

        // Convert to radians (internal use for now, or we could use a table for "true" SS)
        // SS uses interpolation from 24 sine values. 
        // For precision and modern environment, we'll use Math.sin but scaled by RADIUS.
        const radians = (normalized * Math.PI) / 180;
        return RADIUS * Math.sin(radians);
    },

    /**
     * Get Kotijya (Indian Cosine)
     * @param {number} degrees 
     * @returns {number} Kotijya value
     */
    getKotijya(degrees) {
        let normalized = ((degrees % 360) + 360) % 360;
        const radians = (normalized * Math.PI) / 180;
        return RADIUS * Math.cos(radians);
    },

    /**
     * Normalize an angle to [0, 360) range
     * @param {number} degrees 
     */
    normalizeDeg(degrees) {
        return ((degrees % 360) + 360) % 360;
    }
};

module.exports = MathUtils;
