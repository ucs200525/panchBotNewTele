/**
 * Karana Calculator
 * Calculates Karana transitions during a day
 */

const config = require('../core/config');
const BaseCalculator = require('../core/baseCalculator');
const julianDay = require('../core/julianDay');

class KaranaCalculator extends BaseCalculator {
    constructor() {
        super();
        this.KARANA_NAMES = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
            'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
        ];
    }

    /**
     * Calculate Karana from Tithi
     * Each Tithi has 2 Karanas, Karana changes every 6 degrees of elongation
     */
    calculateKarana(moonLong, sunLong) {
        let elongation = moonLong - sunLong;
        if (elongation < 0) elongation += 360;

        // Karana number (0-59, 2 per Tithi)
        const karanaNumber = Math.floor(elongation / 6);
        const percentage = (elongation % 6) / 6;

        // Karana Logic:
        // 0: Kimstughna (Fixed)
        // 1-56: Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (7 repeating 8 times)
        // 57: Shakuni (Fixed)
        // 58: Chatushpada (Fixed)
        // 59: Naga (Fixed)
        let karanaIndex;
        if (karanaNumber === 0) karanaIndex = 10; // Kimstughna
        else if (karanaNumber === 57) karanaIndex = 7; // Shakuni
        else if (karanaNumber === 58) karanaIndex = 8; // Chatushpada
        else if (karanaNumber === 59) karanaIndex = 9; // Naga
        else karanaIndex = (karanaNumber - 1) % 7; // Bava to Vishti cycle 

        return {
            number: karanaNumber,
            name: this.KARANA_NAMES[karanaIndex],
            percentage: percentage * 100
        };
    }

    /**
     * Get Karana at a specific time
     */
    getKaranaAtTime(date) {
        const jd = julianDay.dateToJulianDay(date);
        const ayanamsa = config.swisseph.swe_get_ayanamsa_ut(jd);

        const moonResult = config.swisseph.swe_calc_ut(jd, config.swisseph.SE_MOON, config.swisseph.SEFLG_SWIEPH);
        const sunResult = config.swisseph.swe_calc_ut(jd, config.swisseph.SE_SUN, config.swisseph.SEFLG_SWIEPH);

        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;
        const sunSidereal = (sunResult.longitude - ayanamsa + 360) % 360;

        return this.calculateKarana(moonSidereal, sunSidereal);
    }

    /**
     * Calculate all Karana transitions during a day
     */
    calculateDayKaranas(date, timezone = 'Asia/Kolkata') {
        const karanas = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        let currentKarana = this.getKaranaAtTime(startOfDay);
        let startTime = startOfDay;

        // Sample every hour to detect transitions (Karanas change ~2 times per day)
        for (let hour = 1; hour <= 24; hour++) {
            const checkTime = new Date(startOfDay);
            checkTime.setHours(hour, 0, 0, 0);

            const nextKarana = this.getKaranaAtTime(checkTime);

            if (nextKarana.number !== currentKarana.number) {
                const transitionTime = this.findTransitionTime(
                    startTime,
                    checkTime,
                    currentKarana.number
                );

                karanas.push({
                    number: currentKarana.number,
                    name: currentKarana.name,
                    startTime: startTime.toISOString(),
                    endTime: transitionTime.toISOString()
                });

                currentKarana = nextKarana;
                startTime = transitionTime;
            }
        }

        // Add the final Karana
        karanas.push({
            number: currentKarana.number,
            name: currentKarana.name,
            startTime: startTime.toISOString(),
            endTime: null
        });

        return karanas;
    }

    findTransitionTime(startTime, endTime, oldKaranaNumber) {
        let start = startTime.getTime();
        let end = endTime.getTime();

        while (end - start > 60000) {
            const mid = Math.floor((start + end) / 2);
            const midDate = new Date(mid);
            const karana = this.getKaranaAtTime(midDate);

            if (karana.number === oldKaranaNumber) {
                start = mid;
            } else {
                end = mid;
            }
        }

        return new Date(end);
    }
}

module.exports = KaranaCalculator;
