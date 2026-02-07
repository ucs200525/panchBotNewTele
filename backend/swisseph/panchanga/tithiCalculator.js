/**
 * Tithi Calculator
 * Calculates Tithi (lunar day) transitions during a day
 */

const { swisseph, useNative } = require('../core/config');
const BaseCalculator = require('../core/baseCalculator');
const julianDay = require('../core/julianDay');

class TithiCalculator extends BaseCalculator {
    constructor() {
        super();
        this.TITHI_NAMES = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];
    }

    /**
     * Calculate Tithi number from Sun and Moon longitudes
     * Tithi = (Moon longitude - Sun longitude) / 12
     */
    calculateTithiNumber(moonLong, sunLong) {
        let elongation = moonLong - sunLong;
        if (elongation < 0) elongation += 360;
        
        const tithiNumber = Math.floor(elongation / 12);
        const percentage = (elongation % 12) / 12;
        
        return { tithiNumber, percentage };
    }

    /**
     * Get Tithi at a specific time
     */
    getTithiAtTime(date) {
        const jd = julianDay.dateToJulianDay(date);
        const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
        
        const moonResult = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
        const sunResult = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
        
        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;
        const sunSidereal = (sunResult.longitude - ayanamsa + 360) % 360;
        
        const { tithiNumber, percentage } = this.calculateTithiNumber(moonSidereal, sunSidereal);
        
        // Determine Paksha
        const paksha = tithiNumber < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
        const tithiInPaksha = tithiNumber % 15;
        
        return {
            number: tithiNumber,
            name: this.TITHI_NAMES[tithiInPaksha],
            paksha: paksha,
            percentage: percentage * 100
        };
    }

    /**
     * Calculate all Tithi transitions during a day
     */
    calculateDayTithis(date, timezone = 'Asia/Kolkata') {
        const tithis = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Check Tithi at start of day
        let currentTithi = this.getTithiAtTime(startOfDay);
        let startTime = startOfDay;
        
        // Sample every hour to detect transitions
        for (let hour = 1; hour <= 24; hour++) {
            const checkTime = new Date(startOfDay);
            checkTime.setHours(hour, 0, 0, 0);
            
            const nextTithi = this.getTithiAtTime(checkTime);
            
            // If Tithi changed, record the transition
            if (nextTithi.number !== currentTithi.number) {
                // Binary search for exact transition time
                const transitionTime = this.findTransitionTime(
                    startTime,
                    checkTime,
                    currentTithi.number
                );
                
                tithis.push({
                    number: currentTithi.number,
                    name: currentTithi.name,
                    paksha: currentTithi.paksha,
                    startTime: startTime.toISOString(),
                    endTime: transitionTime.toISOString()
                });
                
                currentTithi = nextTithi;
                startTime = transitionTime;
            }
        }
        
        // Add the final Tithi (extends to end of day or beyond)
        tithis.push({
            number: currentTithi.number,
            name: currentTithi.name,
            paksha: currentTithi.paksha,
            startTime: startTime.toISOString(),
            endTime: null // Continues beyond current day
        });
        
        return tithis;
    }

    /**
     * Binary search to find exact transition time
     */
    findTransitionTime(startTime, endTime, oldTithiNumber) {
        let start = startTime.getTime();
        let end = endTime.getTime();
        
        // Binary search with 1-minute precision
        while (end - start > 60000) {
            const mid = Math.floor((start + end) / 2);
            const midDate = new Date(mid);
            const tithi = this.getTithiAtTime(midDate);
            
            if (tithi.number === oldTithiNumber) {
                start = mid;
            } else {
                end = mid;
            }
        }
        
        return new Date(end);
    }
}

module.exports = TithiCalculator;
