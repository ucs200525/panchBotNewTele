const { PlanetaryCalculator } = require('../swisseph/planetary/riseSet');
const logger = require('./logger');

const planetary = new PlanetaryCalculator();

/**
 * Fetch Sun and Moon rise/set times using Swiss Ephemeris
 * @param {number} lat 
 * @param {number} lng 
 * @param {string} date - YYYY-MM-DD
 * @param {string} timeZone 
 */
async function getSunMoonTimesSwiss(lat, lng, date, timeZone) {
    try {
        const dateObj = new Date(date);
        
        // Calculate events
        const sunRise = planetary.getSunrise(dateObj, lat, lng);
        const sunSet = planetary.getSunset(dateObj, lat, lng);
        const moonRise = planetary.getMoonrise(dateObj, lat, lng);
        const moonSet = planetary.getMoonset(dateObj, lat, lng);
        
        // Calculate tomorrow's sunrise
        const tmrw = new Date(dateObj);
        tmrw.setDate(tmrw.getDate() + 1);
        const sunRiseTmrw = planetary.getSunrise(tmrw, lat, lng);

        // Helper to format in 24h as expected by existing code
        const format24h = (d) => {
            if (!d) return 'N/A';
            return d.toLocaleTimeString('en-GB', { timeZone, hour12: false });
        };

        const results = {
            sunriseToday: format24h(sunRise?.date),
            sunsetToday: format24h(sunSet?.date),
            moonriseToday: format24h(moonRise?.date),
            moonsetToday: format24h(moonSet?.date),
            sunriseTmrw: format24h(sunRiseTmrw?.date),
            
            // Also include human readable version
            formatted: {
                sunrise: sunRise?.time,
                sunset: sunSet?.time,
                moonrise: moonRise?.time,
                moonset: moonSet?.time
            },
            engine: 'Swiss Ephemeris'
        };

        logger.info({ message: 'Swiss Sun/Moon times calculated', lat, lng, date, results });
        return results;
    } catch (error) {
        logger.error({ message: 'Error in getSunMoonTimesSwiss', error: error.message });
        return null;
    }
}

module.exports = { getSunMoonTimesSwiss };
