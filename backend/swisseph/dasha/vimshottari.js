/**
 * Dasha System Calculator (Vimshottari)
 */

const BaseCalculator = require('../core/baseCalculator');

class DashaCalculator extends BaseCalculator {
    constructor() {
        super();
        this.DASHA_LORDS = [
            { name: 'Ketu', years: 7 },
            { name: 'Venus', years: 20 },
            { name: 'Sun', years: 6 },
            { name: 'Moon', years: 10 },
            { name: 'Mars', years: 7 },
            { name: 'Rahu', years: 18 },
            { name: 'Jupiter', years: 16 },
            { name: 'Saturn', years: 19 },
            { name: 'Mercury', years: 17 }
        ];
    }

    /**
     * Calculate Vimshottari Mahadasha sequence from birth time 
     */
    calculateVimshottari(moonLongitude, birthDate) {
        // Each Nakshatra is 13°20' (13.33333 degrees)
        const nakshatraLength = 360 / 27;
        const totalDegree = (moonLongitude % 360);
        const nakshatraIndex = Math.floor(totalDegree / nakshatraLength);
        const degreeInNakshatra = totalDegree % nakshatraLength;
        const percentageCompleted = degreeInNakshatra / nakshatraLength;

        // Sequence starts from Ashwini (Ketu lord)
        const startLordIndex = nakshatraIndex % 9;
        const elapsedPercentage = percentageCompleted;
        const remainingPercentage = 1 - percentageCompleted;

        let currentDate = new Date(birthDate);
        const dashaSequence = [];

        // Calculate initial partial dasha
        const firstLord = this.DASHA_LORDS[startLordIndex];
        const initialDurationYears = firstLord.years * remainingPercentage;
        
        let dashaEndDate = new Date(currentDate);
        dashaEndDate.setFullYear(dashaEndDate.getFullYear() + Math.floor(initialDurationYears));
        dashaEndDate.setMonth(dashaEndDate.getMonth() + Math.floor((initialDurationYears % 1) * 12));

        dashaSequence.push({
            lord: firstLord.name,
            duration: firstLord.years,
            start: new Date(currentDate),
            end: new Date(dashaEndDate),
            isInitial: true
        });

        currentDate = new Date(dashaEndDate);

        // Calculate next dashas for a full 120-year cycle
        for (let i = 1; i < 9; i++) {
            const lordIndex = (startLordIndex + i) % 9;
            const lord = this.DASHA_LORDS[lordIndex];
            
            const endDate = new Date(currentDate);
            endDate.setFullYear(endDate.getFullYear() + lord.years);
            
            dashaSequence.push({
                lord: lord.name,
                duration: lord.years,
                start: new Date(currentDate),
                end: new Date(endDate)
            });
            
            currentDate = new Date(endDate);
        }

        return dashaSequence;
    }
}

module.exports = DashaCalculator;
