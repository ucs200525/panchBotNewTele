/**
 * Comprehensive Vakya Panchangam Engine
 * Traditional mnemonic-based calculation system from Kerala/Tamil traditions
 * Uses encoded astronomical data (Vakyas) for panchanga calculations
 */

const vakyaData = require('./constants/vakya_tables.json');

// Traditional Nakshatra names (same across systems)
const NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
];

const TITHI_NAMES = {
    shukla: [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
    ],
    krishna: [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ]
};

const KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

class VakyaEngine {
    constructor() {
        this.epochAhargana = 0;
        this.NAKSHATRA_SPAN = 13.333333333;
        this.TITHI_SPAN = 12;
        this.YOGA_SPAN = 13.333333333;
        this.KARANA_SPAN = 6;
    }

    /**
     * Normalize degrees to 0-360 range
     */
    normalizeDeg(degrees) {
        return ((degrees % 360) + 360) % 360;
    }

    /**
     * Get Julian Day Number
     */
    getJulianDay(date) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        let y = year, m = month;
        if (m <= 2) { y -= 1; m += 12; }
        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) +
            day + b - 1524.5 + (hour / 24) + (minute / 1440) + (second / 86400);
    }

    getAhargana(date) {
        return this.getJulianDay(date) - KALI_YUGA_JDN;
    }

    // ====================
    // PLANETARY CALCULATIONS (Ancient Surya Siddhanta Method)
    // ====================

    getJya(degrees) {
        const rad = (this.normalizeDeg(degrees) * Math.PI) / 180;
        return this.RADIUS * Math.sin(rad);
    }

    calculateMeanLongitude(ahargana, planetKey) {
        const revs = REVOLUTIONS[planetKey];
        const totalRevs = (ahargana * revs) / MAHAYUGA_DAYS;
        return this.normalizeDeg((totalRevs % 1) * 360);
    }

    calculateMandaPhala(meanLong, apogee, mandaParidhi) {
        const mandaKendra = this.normalizeDeg(meanLong - apogee);
        const phala = (this.getJya(mandaKendra) * mandaParidhi) / 360;
        return (phala / this.RADIUS) * (180 / Math.PI);
    }

    /**
     * Calculate Sun position using pure Surya Siddhanta
     */
    calculateSunPosition(ahargana) {
        const sunMean = this.calculateMeanLongitude(ahargana, 'SUN');
        const sunPhala = this.calculateMandaPhala(sunMean, FIXED_APOGEES.SUN, MANDAPARIDHIS.SUN);
        return this.normalizeDeg(sunMean - sunPhala);
    }

    /**
     * Calculate Moon position using Vakya interpolation (primary) + Surya Siddhanta (fallback)
     */
    calculateMoonPosition(ahargana) {
        try {
            // Primary: Vakya method
            const totalDays = ahargana - this.epochAhargana;
            const cycleDays = vakyaData.lunar_cycle_days;
            const completedCycles = Math.floor(totalDays / cycleDays);
            const dayInCycle = totalDays % cycleDays;

            const basePos = this.interpolateVakya(dayInCycle, vakyaData.moon_vakyas);
            const totalDhruva = completedCycles * vakyaData.dhruva_per_cycle;

            return this.normalizeDeg(basePos + totalDhruva);
        } catch (error) {
            // Fallback: Surya Siddhanta method
            const moonMean = this.calculateMeanLongitude(ahargana, 'MOON');
            const moonApogee = this.calculateMeanLongitude(ahargana, 'MOON_APOGEE');
            const moonPhala = this.calculateMandaPhala(moonMean, moonApogee, MANDAPARIDHIS.MOON);
            return this.normalizeDeg(moonMean - moonPhala);
        }
    }

    /**
     * Calculate all major planetary positions using Surya Siddhanta
     */
    calculateAllPlanets(ahargana) {
        // Sun
        const sunTrue = this.calculateSunPosition(ahargana);

        // Moon (Vakya priority)
        const moonTrue = this.calculateMoonPosition(ahargana);

        // Mars
        const marsMean = this.calculateMeanLongitude(ahargana, 'MARS');
        const marsPhala = this.calculateMandaPhala(marsMean, FIXED_APOGEES.MARS, MANDAPARIDHIS.MARS);
        const marsTrue = this.normalizeDeg(marsMean - marsPhala);

        // Mercury
        const mercuryMean = this.calculateMeanLongitude(ahargana, 'MERCURY');
        const mercuryPhala = this.calculateMandaPhala(mercuryMean, FIXED_APOGEES.MERCURY, MANDAPARIDHIS.MERCURY);
        const mercuryTrue = this.normalizeDeg(mercuryMean - mercuryPhala);

        // Jupiter
        const jupiterMean = this.calculateMeanLongitude(ahargana, 'JUPITER');
        const jupiterPhala = this.calculateMandaPhala(jupiterMean, FIXED_APOGEES.JUPITER, MANDAPARIDHIS.JUPITER);
        const jupiterTrue = this.normalizeDeg(jupiterMean - jupiterPhala);

        // Venus
        const venusMean = this.calculateMeanLongitude(ahargana, 'VENUS');
        const venusPhala = this.calculateMandaPhala(venusMean, FIXED_APOGEES.VENUS, MANDAPARIDHIS.VENUS);
        const venusTrue = this.normalizeDeg(venusMean - venusPhala);

        // Saturn
        const saturnMean = this.calculateMeanLongitude(ahargana, 'SATURN');
        const saturnPhala = this.calculateMandaPhala(saturnMean, FIXED_APOGEES.SATURN, MANDAPARIDHIS.SATURN);
        const saturnTrue = this.normalizeDeg(saturnMean - saturnPhala);

        // Rahu (always retrograde)
        const rahuMean = this.calculateMeanLongitude(ahargana, 'RAHU');
        const rahuTrue = this.normalizeDeg(360 - rahuMean);

        return {
            sun: sunTrue,
            moon: moonTrue,
            mars: marsTrue,
            mercury: mercuryTrue,
            jupiter: jupiterTrue,
            venus: venusTrue,
            saturn: saturnTrue,
            rahu: rahuTrue,
            ketu: this.normalizeDeg(rahuTrue + 180)
        };
    }

    interpolateVakya(day, table) {
        let lower = table[0];
        let upper = table[table.length - 1];

        for (let i = 0; i < table.length - 1; i++) {
            if (day >= table[i].day && day <= table[i + 1].day) {
                lower = table[i];
                upper = table[i + 1];
                break;
            }
        }

        if (lower.day === upper.day) return lower.long_deg;

        const dayDiff = upper.day - lower.day;
        const posDiff = upper.long_deg - lower.long_deg;
        const fraction = (day - lower.day) / dayDiff;

        return lower.long_deg + (fraction * posDiff);
    }

    // ====================
    // PANCHANGA CALCULATIONS
    // ====================

    calculateTithi(sunLong, moonLong) {
        const elongation = this.normalizeDeg(moonLong - sunLong);
        const tithiNumber = Math.floor(elongation / this.TITHI_SPAN) + 1;
        const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
        const tithiIndex = tithiNumber <= 15 ? tithiNumber - 1 : tithiNumber - 16;
        const tithiName = paksha === 'Shukla' ?
            TITHI_NAMES.shukla[tithiIndex] :
            TITHI_NAMES.krishna[tithiIndex];

        return {
            number: tithiNumber,
            name: tithiName,
            paksha: paksha,
            elongation: elongation.toFixed(3)
        };
    }

    /**
     * Calculate Nakshatra (Lunar Mansion)
     */
    calculateNakshatra(moonLong) {
        const nakshatraNumber = Math.floor(moonLong / this.NAKSHATRA_SPAN) + 1;
        const nakshatraName = NAKSHATRA_NAMES[nakshatraNumber - 1];

        const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
        const lordIndex = (nakshatraNumber - 1) % 9;

        return {
            number: nakshatraNumber,
            name: nakshatraName,
            lord: lords[lordIndex],
            pada: Math.floor((moonLong % this.NAKSHATRA_SPAN) / (this.NAKSHATRA_SPAN / 4)) + 1
        };
    }

    /**
     * Calculate Yoga
     */
    calculateYoga(sunLong, moonLong) {
        const yogaSum = this.normalizeDeg(sunLong + moonLong);
        const yogaNumber = Math.floor(yogaSum / this.YOGA_SPAN) + 1;
        const yogaName = YOGA_NAMES[yogaNumber - 1];

        return {
            number: yogaNumber,
            name: yogaName,
            sum: yogaSum.toFixed(3)
        };
    }

    /**
     * Calculate Karana (Half-Tithi)
     */
    calculateKarana(sunLong, moonLong) {
        const elongation = this.normalizeDeg(moonLong - sunLong);
        const karanaNumber = Math.floor(elongation / this.KARANA_SPAN);

        let karanaName;
        if (karanaNumber === 0) {
            karanaName = KARANA_NAMES[7];  // Shakuni
        } else if (karanaNumber === 59) {
            karanaName = KARANA_NAMES[10]; // Kimstughna
        } else if (karanaNumber === 58) {
            karanaName = KARANA_NAMES[9];  // Naga
        } else {
            const movableIndex = (karanaNumber - 1) % 7;
            karanaName = KARANA_NAMES[movableIndex];
        }

        return {
            number: karanaNumber + 1,
            name: karanaName
        };
    }

    /**
     * Calculate Vaara (Weekday)
     */
    calculateVaara(date) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const lords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
        const dayIndex = date.getUTCDay();

        return {
            day: dayNames[dayIndex],
            lord: lords[dayIndex]
        };
    }

    /**
     * Calculate Rasi (Moon Sign)
     */
    calculateRasi(moonLong) {
        const rasiNames = [
            "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
            "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
        ];
        const rasiNumber = Math.floor(moonLong / 30) + 1;
        return {
            number: rasiNumber,
            name: rasiNames[rasiNumber - 1]
        };
    }

    /**
     * Calculate Lagna (Ascendant) - simplified sidereal calculation
     */
    calculateLagna(date, latitude) {
        const jd = this.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525;

        // Sidereal Time at Greenwich (simplified)
        const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * (0.000387933 - T / 38710000);
        const siderealTime = this.normalizeDeg(gmst);

        // Ascendant (simplified)
        const lagnaLong = this.normalizeDeg(siderealTime + (latitude * 0.5));

        const rasiNumber = Math.floor(lagnaLong / 30) + 1;
        const rasiNames = [
            "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
            "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
        ];

        return {
            longitude: lagnaLong.toFixed(3),
            rasi: rasiNames[rasiNumber - 1],
            degree: (lagnaLong % 30).toFixed(3)
        };
    }

    /**
     * Comprehensive Vakya Panchanga Calculation
     */
    calculateCompletePanchanga(date, latitude = 13.0827) {
        const ahargana = this.getAhargana(date);
        const moonLong = this.calculateMoonPosition(ahargana);
        const sunLong = this.calculateSunPosition(ahargana);

        return {
            date: date.toISOString(),
            ahargana: ahargana,

            // Five Angas of Panchanga
            vara: this.calculateVaara(date),
            tithi: this.calculateTithi(sunLong, moonLong),
            nakshatra: this.calculateNakshatra(moonLong),
            yoga: this.calculateYoga(sunLong, moonLong),
            karana: this.calculateKarana(sunLong, moonLong),

            // Additional elements
            rasi: this.calculateRasi(moonLong),
            lagna: this.calculateLagna(date, latitude),

            // Planetary positions (Vakya primarily focuses on Moon)
            planetaryPositions: {
                sun: sunLong.toFixed(3),
                moon: moonLong.toFixed(3)
            },

            system: "Vakya Panchangam"
        };
    }
}

module.exports = new VakyaEngine();
