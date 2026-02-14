/**
 * Unified Astrology API
 * Factory to access different astrological calculation systems
 */

const VakyaEngine = require('./vakya_engine');
const KPEngine = require('./kp_engine');

const AstrologyAPI = {
    getEngine(type) {
        switch (type.toUpperCase()) {
            case 'VAKYA':
            case 'VAKYA_PANCHANGAM':
                return VakyaEngine;
            case 'KP':
            case 'KP_SYSTEM':
                return KPEngine;
            default:
                throw new Error(`Unsupported engine type: ${type}. Only VAKYA and KP are supported.`);
        }
    },

    /**
     * Calculate comprehensive data across systems
     */
    getFullReport(date, lat, lng) {
        const vakyaData = VakyaEngine.calculateCompletePanchanga ?
            VakyaEngine.calculateCompletePanchanga(date, lat, lng) :
            { moon: VakyaEngine.calculateMoonPosition(0) };

        const kpData = KPEngine.calculatePlacidusHouses ?
            { houses: KPEngine.calculatePlacidusHouses(12, lat), ayanamsa: 23.85 } :
            { houses: [], ayanamsa: 23.85 };

        return {
            date,
            vakya: vakyaData,
            kp_system: kpData
        };
    }
};

module.exports = AstrologyAPI;
