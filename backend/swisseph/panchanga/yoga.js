/**
 * Yoga Calculator
 * Calculates Nitya Yoga (Sum of Sun and Moon longitudes)
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS, YOGAS } = require('../core/config');

class YogaCalculator extends BaseCalculator {
    /**
     * Get Yoga for a specific time
     * @param {Date} date 
     * @returns {Object} {name, number, percentage}
     */
    getYogaAtTime(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);

        // Get Sun position
        const sunResult = this.swisseph.swe_calc_ut(jd, PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const sunSidereal = this.tropicalToSidereal(sunResult.longitude, ayanamsa);

        // Get Moon position
        const moonResult = this.swisseph.swe_calc_ut(jd, PLANETS.MOON, this.swisseph.SEFLG_SWIEPH);
        const moonSidereal = this.tropicalToSidereal(moonResult.longitude, ayanamsa);

        // Yoga = (Sun + Moon) / 13°20'
        let yogaLong = (sunSidereal + moonSidereal) % 360;

        const yogaValue = yogaLong / (360 / 27);
        const yogaIndex = Math.floor(yogaValue) % 27;
        const percentage = (yogaValue % 1) * 100;

        return {
            name: YOGAS[yogaIndex],
            number: yogaIndex + 1,
            percentage: percentage,
            longitude: yogaLong
        };
    }

    /**
     * Find precise transition of Yoga
     */
    findTransition(startTime, endTime, targetYogaIndex) {
        const targetLong = (targetYogaIndex + 1) * (360 / 27);
        const threshold = 10 * 1000; // 10 seconds

        let start = startTime;
        let end = endTime;

        // Simple binary search
        for (let i = 0; i < 20; i++) {
            if ((end.getTime() - start.getTime()) < threshold) break;

            const mid = new Date((start.getTime() + end.getTime()) / 2);
            const yoga = this.getYogaAtTime(mid);

            // Handle wrap around 360
            let currentVal = yoga.longitude;
            if (targetYogaIndex === 26 && currentVal < 40) currentVal += 360;

            if (currentVal < targetLong) {
                start = mid;
            } else {
                end = mid;
            }
        }

        return end;
    }

    /**
     * Calculate all Yoga transitions for the day
     */
    calculateDayYogas(date, timezone = 'Asia/Kolkata') {
        console.log('  🔗 Calculating Yoga transitions...');
        const yogas = [];
        const startTime = new Date(date);
        startTime.setHours(0, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);

        let currentTime = new Date(startTime);
        let currentYoga = this.getYogaAtTime(currentTime);
        let periodStart = startTime;

        const stepSize = 60 * 60 * 1000; // 1 hour steps

        while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + stepSize);
            const nextYoga = this.getYogaAtTime(nextTime > endTime ? endTime : nextTime);

            if (nextYoga.number !== currentYoga.number) {
                const transitionTime = this.findTransition(currentTime, nextTime, currentYoga.number - 1);

                yogas.push({
                    name: currentYoga.name,
                    number: currentYoga.number,
                    startTime: periodStart.getTime() === startTime.getTime() ? null : this.formatTime(periodStart, timezone),
                    endTime: this.formatTime(transitionTime, timezone),
                    rawStartTime: periodStart,
                    rawEndTime: transitionTime
                });

                periodStart = transitionTime;
                currentYoga = this.getYogaAtTime(new Date(transitionTime.getTime() + 1000));
            }

            currentTime = nextTime;
        }

        // Add last one
        yogas.push({
            name: currentYoga.name,
            number: currentYoga.number,
            startTime: this.formatTime(periodStart, timezone),
            endTime: null,
            rawStartTime: periodStart,
            rawEndTime: null
        });

        return yogas;
    }
}

module.exports = YogaCalculator;
