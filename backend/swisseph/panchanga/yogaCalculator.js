/**
 * Yoga Calculator
 * Calculates Yoga transitions during a day
 */

const swisseph = require('swisseph');
const BaseCalculator = require('../core/baseCalculator');
const julianDay = require('../core/julianDay');

class YogaCalculator extends BaseCalculator {
    constructor() {
        super();
        this.YOGA_NAMES = [
            'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma',
            'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana',
            'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha',
            'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
        ];
    }

    /**
     * Calculate Yoga from Sun and Moon longitudes
     * Yoga = (Sun longitude + Moon longitude) / 13.333...
     */
    calculateYoga(moonLong, sunLong) {
        const sum = (moonLong + sunLong) % 360;
        const yogaNumber = Math.floor(sum / (360 / 27));
        const percentage = (sum % (360 / 27)) / (360 / 27);
        
        return {
            number: yogaNumber,
            name: this.YOGA_NAMES[yogaNumber],
            percentage: percentage * 100
        };
    }

    /**
     * Get Yoga at a specific time
     */
    getYogaAtTime(date) {
        const jd = julianDay.dateToJulianDay(date);
        const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
        
        const moonResult = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
        const sunResult = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
        
        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;
        const sunSidereal = (sunResult.longitude - ayanamsa + 360) % 360;
        
        return this.calculateYoga(moonSidereal, sunSidereal);
    }

    /**
     * Calculate all Yoga transitions during a day
     */
    calculateDayYogas(date, timezone = 'Asia/Kolkata') {
        const yogas = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        let currentYoga = this.getYogaAtTime(startOfDay);
        let startTime = startOfDay;
        
        // Sample every 2 hours to detect transitions
        for (let hour = 2; hour <= 24; hour += 2) {
            const checkTime = new Date(startOfDay);
            checkTime.setHours(hour, 0, 0, 0);
            
            const nextYoga = this.getYogaAtTime(checkTime);
            
            if (nextYoga.number !== currentYoga.number) {
                const transitionTime = this.findTransitionTime(
                    startTime,
                    checkTime,
                    currentYoga.number
                );
                
                yogas.push({
                    number: currentYoga.number,
                    name: currentYoga.name,
                    startTime: startTime.toISOString(),
                    endTime: transitionTime.toISOString()
                });
                
                currentYoga = nextYoga;
                startTime = transitionTime;
            }
        }
        
        // Add the final Yoga
        yogas.push({
            number: currentYoga.number,
            name: currentYoga.name,
            startTime: startTime.toISOString(),
            endTime: null
        });
        
        return yogas;
    }

    findTransitionTime(startTime, endTime, oldYogaNumber) {
        let start = startTime.getTime();
        let end = endTime.getTime();
        
        while (end - start > 60000) {
            const mid = Math.floor((start + end) / 2);
            const midDate = new Date(mid);
            const yoga = this.getYogaAtTime(midDate);
            
            if (yoga.number === oldYogaNumber) {
                start = mid;
            } else {
                end = mid;
            }
        }
        
        return new Date(end);
    }
}

module.exports = YogaCalculator;
