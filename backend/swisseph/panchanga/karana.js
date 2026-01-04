/**
 * Karana Calculator
 * Calculates Karana (Half of Tithi)
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS, KARANAS } = require('../core/config');

class KaranaCalculator extends BaseCalculator {
    /**
     * Get Karana for a specific time
     */
    getKaranaAtTime(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        
        const sunResult = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const sunSidereal = this.tropicalToSidereal(sunResult.longitude, ayanamsa);
        
        const moonResult = this.swisseph.swe_calc_ut(jd, PLANETS.MOON, this.swisseph.SEFLG_SWIEPH);
        const moonSidereal = this.tropicalToSidereal(moonResult.longitude, ayanamsa);
        
        let diff = (moonSidereal - sunSidereal + 360) % 360;
        
        // Karana is 6 degrees (Tithi is 12)
        const karanaValue = diff / 6;
        const totalKaranaIndex = Math.floor(karanaValue); // 0 to 59
        
        let karanaNameIndex;
        if (totalKaranaIndex === 0) {
            karanaNameIndex = 11; // Kimstughna (first half of first tithi)
        } else if (totalKaranaIndex >= 57) {
            // Shakuni, Chatushpada, Naga are the last 3 half-tithis
            karanaNameIndex = totalKaranaIndex - 57 + 8; // 8, 9, 10
        } else {
            // Cyclic 7 karanas (Bava to Vishti)
            karanaNameIndex = ((totalKaranaIndex - 1) % 7) + 1; // 1 to 7
        }
        
        return {
            name: KARANAS[karanaNameIndex - 1],
            number: totalKaranaIndex + 1,
            longitudeDiff: diff
        };
    }

    /**
     * Find precise transition of Karana
     */
    findTransition(startTime, endTime, targetKaranaIndex) {
        const targetDiff = (targetKaranaIndex + 1) * 6;
        const threshold = 10 * 1000;
        
        let start = startTime;
        let end = endTime;
        
        for (let i = 0; i < 20; i++) {
            if ((end.getTime() - start.getTime()) < threshold) break;
            
            const mid = new Date((start.getTime() + end.getTime()) / 2);
            const karana = this.getKaranaAtTime(mid);
            
            let currentDiff = karana.longitudeDiff;
            if (targetKaranaIndex === 59 && currentDiff < 10) currentDiff += 360;
            
            if (currentDiff < targetDiff) {
                start = mid;
            } else {
                end = mid;
            }
        }
        
        return end;
    }

    /**
     * Calculate Day Karanas
     */
    calculateDayKaranas(date, timezone = 'Asia/Kolkata') {
        console.log('  ⚡ Calculating Karana transitions...');
        const karanas = [];
        const startTime = new Date(date);
        startTime.setHours(0, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);
        
        let currentTime = new Date(startTime);
        let currentKarana = this.getKaranaAtTime(currentTime);
        let periodStart = startTime;
        
        const stepSize = 30 * 60 * 1000; // 30 min steps
        
        while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + stepSize);
            const nextKarana = this.getKaranaAtTime(nextTime > endTime ? endTime : nextTime);
            
            if (nextKarana.number !== currentKarana.number) {
                const transitionTime = this.findTransition(currentTime, nextTime, currentKarana.number - 1);
                
                karanas.push({
                    name: currentKarana.name,
                    number: currentKarana.number,
                    startTime: periodStart.getTime() === startTime.getTime() ? null : this.formatTime(periodStart, timezone),
                    endTime: this.formatTime(transitionTime, timezone)
                });
                
                periodStart = transitionTime;
                currentKarana = this.getKaranaAtTime(new Date(transitionTime.getTime() + 1000));
            }
            
            currentTime = nextTime;
        }
        
        karanas.push({
            name: currentKarana.name,
            number: currentKarana.number,
            startTime: this.formatTime(periodStart, timezone),
            endTime: null
        });
        
        return karanas;
    }
}

module.exports = KaranaCalculator;
