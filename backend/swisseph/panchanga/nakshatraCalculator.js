/**
 * Nakshatra Calculator
 * Calculates Nakshatra (lunar mansion) transitions during a day
 */

const swisseph = require('swisseph');
const BaseCalculator = require('../core/baseCalculator');
const julianDay = require('../core/julianDay');

class NakshatraCalculator extends BaseCalculator {
    constructor() {
        super();
        this.NAKSHATRA_NAMES = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        this.NAKSHATRA_LORDS = [
            'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
            'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
            'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
            'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu',
            'Jupiter', 'Saturn', 'Mercury'
        ];
    }

    /**
     * Calculate Nakshatra from Moon longitude
     * Each Nakshatra spans 13°20' (800')
     */
    calculateNakshatra(moonLong) {
        const nakshatraNumber = Math.floor(moonLong / (360 / 27));
        const nakshatraProgress = (moonLong % (360 / 27)) / (360 / 27);
        const pada = Math.floor(nakshatraProgress * 4) + 1;

        return {
            number: nakshatraNumber,
            name: this.NAKSHATRA_NAMES[nakshatraNumber],
            lord: this.NAKSHATRA_LORDS[nakshatraNumber],
            pada: pada,
            percentage: nakshatraProgress * 100
        };
    }

    /**
     * Get Nakshatra at a specific time
     */
    getNakshatraAtTime(date) {
        const jd = julianDay.dateToJulianDay(date);
        const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);

        const moonResult = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;

        return this.calculateNakshatra(moonSidereal);
    }

    /**
     * Calculate all Nakshatra transitions during a day
     */
    calculateDayNakshatras(date, timezone = 'Asia/Kolkata') {
        const nakshatras = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Check Nakshatra at start of day
        let currentNakshatra = this.getNakshatraAtTime(startOfDay);
        let startTime = startOfDay;

        // Sample every hour to detect transitions
        for (let hour = 1; hour <= 24; hour++) {
            const checkTime = new Date(startOfDay);
            checkTime.setHours(hour, 0, 0, 0);

            const nextNakshatra = this.getNakshatraAtTime(checkTime);

            // If Nakshatra changed, record the transition
            if (nextNakshatra.number !== currentNakshatra.number) {
                // Binary search for exact transition time
                const transitionTime = this.findTransitionTime(
                    startTime,
                    checkTime,
                    currentNakshatra.number
                );

                nakshatras.push({
                    number: currentNakshatra.number,
                    name: currentNakshatra.name,
                    lord: currentNakshatra.lord,
                    pada: currentNakshatra.pada,
                    startTime: startTime.toISOString(),
                    endTime: transitionTime.toISOString()
                });

                currentNakshatra = nextNakshatra;
                startTime = transitionTime;
            }
        }

        // Add the final Nakshatra
        nakshatras.push({
            number: currentNakshatra.number,
            name: currentNakshatra.name,
            lord: currentNakshatra.lord,
            pada: currentNakshatra.pada,
            startTime: startTime.toISOString(),
            endTime: null
        });

        return nakshatras;
    }

    /**
     * Binary search to find exact transition time
     */
    findTransitionTime(startTime, endTime, oldNakshatraNumber) {
        let start = startTime.getTime();
        let end = endTime.getTime();

        // Binary search with 1-minute precision
        while (end - start > 60000) {
            const mid = Math.floor((start + end) / 2);
            const midDate = new Date(mid);
            const nakshatra = this.getNakshatraAtTime(midDate);

            if (nakshatra.number === oldNakshatraNumber) {
                start = mid;
            } else {
                end = mid;
            }
        }

        return new Date(end);
    }
}

module.exports = NakshatraCalculator;
