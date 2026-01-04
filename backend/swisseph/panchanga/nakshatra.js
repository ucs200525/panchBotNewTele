/**
 * Nakshatra Calculator
 * Calculates lunar mansion (Nakshatra) with precise start and end times
 */

const BaseCalculator = require('../core/baseCalculator');
const { NAKSHATRAS, PLANETS } = require('../core/config');

class NakshatraCalculator extends BaseCalculator {
    /**
     * Get Nakshatra at specific time
     * @param {Date} date 
     * @returns {Object} {name, index, pada, longitude}
     */
    getNakshatraAtTime(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);

        // Get Moon position
        const moonResult = this.swisseph.swe_calc_ut(jd, PLANETS.MOON, this.swisseph.SEFLG_SWIEPH);
        const moonTropical = moonResult.longitude;
        const moonSidereal = this.tropicalToSidereal(moonTropical, ayanamsa);

        // Each Nakshatra = 13°20' (360° / 27)
        const nakshatraSize = 360 / 27;
        const nakshatraValue = moonSidereal / nakshatraSize;
        const nakshatraIndex = Math.floor(nakshatraValue);

        // Each Nakshatra has 4 padas (quarters)
        const padaValue = (nakshatraValue - nakshatraIndex) * 4;
        const pada = Math.floor(padaValue) + 1;

        return {
            name: NAKSHATRAS[nakshatraIndex],
            index: nakshatraIndex,
            pada: pada,
            longitude: moonSidereal,
            percentage: ((nakshatraValue - nakshatraIndex) * 100)
        };
    }

    /**
     * Calculate all Nakshatras for the day
     * @param {Date} date 
     * @param {string} timezone 
     * @returns {Array} Array of Nakshatra periods
     */
    calculateDayNakshatras(date, timezone = 'Asia/Kolkata') {
        console.log('  ⭐ Calculating Nakshatra transitions...');

        const nakshatras = [];
        const startTime = new Date(date);
        startTime.setHours(0, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);

        let currentNakshatra = this.getNakshatraAtTime(startTime);
        let nakshatraStartTime = startTime;

        console.log(`  📍 Starting Nakshatra: ${currentNakshatra.name} Pada ${currentNakshatra.pada}`);

        // Search for transitions
        let currentTime = new Date(startTime);
        const stepSize = 30 * 60 * 1000; // 30 minutes

        while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + stepSize);
            const nextNakshatra = this.getNakshatraAtTime(nextTime);

            if (nextNakshatra.index !== currentNakshatra.index) {
                // Nakshatra changed - find exact transition
                const nakshatraSize = 360 / 27;
                const boundary = (currentNakshatra.index + 1) * nakshatraSize;

                const transitionTime = this.binarySearch(
                    currentTime,
                    nextTime,
                    (t) => this.getNakshatraAtTime(t).longitude,
                    boundary
                );

                console.log(`  🔍 ${currentNakshatra.name} → ${nextNakshatra.name} at ${this.formatTime(transitionTime, timezone)}`);

                nakshatras.push({
                    name: currentNakshatra.name,
                    index: currentNakshatra.index,
                    pada: currentNakshatra.pada,
                    startTime: nakshatraStartTime,
                    endTime: transitionTime
                });

                currentNakshatra = this.getNakshatraAtTime(transitionTime);
                nakshatraStartTime = transitionTime;
            }

            currentTime = nextTime;
        }

        // Add last Nakshatra if it extends to next day
        if (currentNakshatra && nakshatraStartTime < endTime) {
            nakshatras.push({
                name: currentNakshatra.name,
                index: currentNakshatra.index,
                pada: currentNakshatra.pada,
                startTime: nakshatraStartTime,
                endTime: null
            });
        }

        console.log(`  ✅ Found ${nakshatras.length} Nakshatra period(s)`);
        return nakshatras;
    }
}

module.exports = NakshatraCalculator;
