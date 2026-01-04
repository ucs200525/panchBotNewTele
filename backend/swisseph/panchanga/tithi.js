/**
 * Tithi Calculator
 * Calculates lunar day (Tithi) with precise start and end times
 */

const BaseCalculator = require('../core/baseCalculator');
const { TITHIS, PLANETS } = require('../core/config');

class TithiCalculator extends BaseCalculator {
    /**
     * Get Tithi at specific time
     * @param {Date} date 
     * @returns {Object} {name, index, percentage, longitude}
     */
    getTithiAtTime(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        
        // Get Sun position
        const sunResult = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const sunTropical = sunResult.longitude;
        const sunSidereal = this.tropicalToSidereal(sunTropical, ayanamsa);
        
        // Get Moon position
        const moonResult = this.swisseph.swe_calc_ut(jd, PLANETS.MOON, this.swisseph.SEFLG_SWIEPH);
        const moonTropical = moonResult.longitude;
        const moonSidereal = this.tropicalToSidereal(moonTropical, ayanamsa);
        
        // Tithi = (Moon - Sun) / 12
        let elongation = moonSidereal - sunSidereal;
        if (elongation < 0) elongation += 360;
        
        const tithiValue = elongation / 12;
        const tithiIndex = Math.floor(tithiValue);
        const percentage = ((tithiValue - tithiIndex) * 100);
        
        // Determine Paksha
        const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
        const tithiInPaksha = tithiIndex % 15;
        
        return {
            name: TITHIS[tithiInPaksha],
            index: tithiIndex,
            percentage: percentage,
            elongation: elongation,
            paksha: paksha
        };
    }

    /**
     * Calculate all Tithis for the day
     * @param {Date} date 
     * @param {string} timezone 
     * @returns {Array} Array of Tithi periods
     */
    calculateDayTithis(date, timezone = 'Asia/Kolkata') {
        console.log('  📅 Calculating Tithi transitions...');
        
        const tithis = [];
        const startTime = new Date(date);
        startTime.setHours(0, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);
        
        let currentTithi = this.getTithiAtTime(startTime);
        let tithiStartTime = startTime;
        
        console.log(`  📍 Starting Tithi: ${currentTithi.name} (${currentTithi.percentage.toFixed(1)}%)`);
        
        // Search for transitions
        let currentTime = new Date(startTime);
        const stepSize = 15 * 60 * 1000; // 15 minutes
        
        while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + stepSize);
            const nextTithi = this.getTithiAtTime(nextTime);
            
            if (nextTithi.index !== currentTithi.index) {
                // Tithi changed - find exact transition
                const transitionTime = this.binarySearch(
                    currentTime,
                    nextTime,
                    (t) => this.getTithiAtTime(t).elongation,
                    (currentTithi.index + 1) * 12
                );
                
                console.log(`  🔍 ${currentTithi.name} → ${nextTithi.name} at ${this.formatTime(transitionTime, timezone)}`);
                
                tithis.push({
                    name: currentTithi.name,
                    index: currentTithi.index,
                    paksha: currentTithi.paksha,
                    startTime: tithiStartTime,
                    endTime: transitionTime
                });
                
                currentTithi = this.getTithiAtTime(transitionTime);
                tithiStartTime = transitionTime;
            }
            
            currentTime = nextTime;
        }
        
        // Add last Tithi if it extends to next day
        if (currentTithi && tithiStartTime < endTime) {
            tithis.push({
                name: currentTithi.name,
                index: currentTithi.index,
                paksha: currentTithi.paksha,
                startTime: tithiStartTime,
                endTime: null // Extends to next day
            });
        }
        
        console.log(`  ✅ Found ${tithis.length} Tithi period(s)`);
        return tithis;
    }
}

module.exports = TithiCalculator;
