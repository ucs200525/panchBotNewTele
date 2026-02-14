/**
 * Comprehensive Surya Siddhanta Panchanga Engine
 * Implements complete traditional Hindu almanac calculations
 * Based on ancient Surya Siddhanta mathematical astronomy
 */

const SS_CONSTANTS = {
    MAHAYUGA_YEARS: 4320000,
    MAHAYUGA_DAYS: 1577917828,
    REVOLUTIONS: {
        SUN: 4320000,
        MOON: 57753336,
        MARS: 2296832,
        MERCURY_SIGHRA: 17937060,
        JUPITER: 364220,
        VENUS_SIGHRA: 7022376,
        SATURN: 146568,
        MOON_APOGEE: 488203,
        RAHU: -232226  // Retrograde
    },
    RADIUS: 3438,
    KALI_YUGA_JDN: 588465.5,
    NAKSHATRA_SPAN: 13.333333333,  // 360/27 degrees
    TITHI_SPAN: 12,  // degrees
    YOGA_SPAN: 13.333333333,  // 360/27 degrees
    KARANA_SPAN: 6  // degrees (half tithi)
};

// Traditional Nakshatra names
const NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Traditional Yoga names
const YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarman", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
];

// Traditional Tithi names
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

// Karana names (7 movable + 4 fixed)
const KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

const MathUtils = {
    normalizeDeg(degrees) {
        return ((degrees % 360) + 360) % 360;
    },
    getJya(degrees) {
        const rad = (this.normalizeDeg(degrees) * Math.PI) / 180;
        return SS_CONSTANTS.RADIUS * Math.sin(rad);
    }
};

const TimeUtils = {
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
    },
    getAhargana(date) {
        return this.getJulianDay(date) - SS_CONSTANTS.KALI_YUGA_JDN;
    }
};

const PlanetaryModel = {
    calculateMeanLongitude(ahargana, planetKey) {
        const revs = SS_CONSTANTS.REVOLUTIONS[planetKey];
        const totalRevs = (ahargana * revs) / SS_CONSTANTS.MAHAYUGA_DAYS;
        return MathUtils.normalizeDeg((totalRevs % 1) * 360);
    },
    calculateMandaPhala(meanLong, apogee, mandaParidhi) {
        const mandaKendra = MathUtils.normalizeDeg(meanLong - apogee);
        const phala = (MathUtils.getJya(mandaKendra) * mandaParidhi) / 360;
        return (phala / SS_CONSTANTS.RADIUS) * (180 / Math.PI);
    }
};

class SuryaSiddhantaEngine {
    constructor() {
        this.fixedApogees = { SUN: 80, MOON: 0 };
        this.mandaParidhis = { SUN: 14, MOON: 32 };
    }

    /**
     * Calculate planetary positions
     */
    calculatePositions(date) {
        const ahargana = TimeUtils.getAhargana(date);

        // Sun calculation
        const sunMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'SUN');
        const sunPhala = PlanetaryModel.calculateMandaPhala(sunMean, this.fixedApogees.SUN, this.mandaParidhis.SUN);
        const sunTrue = MathUtils.normalizeDeg(sunMean - sunPhala);

        // Moon calculation
        const moonMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'MOON');
        const moonApogee = PlanetaryModel.calculateMeanLongitude(ahargana, 'MOON_APOGEE');
        const moonPhala = PlanetaryModel.calculateMandaPhala(moonMean, moonApogee, this.mandaParidhis.MOON);
        const moonTrue = MathUtils.normalizeDeg(moonMean - moonPhala);

        // Rahu (always retrograde)
        const rahuMean = PlanetaryModel.calculateMeanLongitude(ahargana, 'RAHU');
        const rahuTrue = MathUtils.normalizeDeg(360 - rahuMean);

        return {
            ahargana,
            sun: { mean: sunMean, true: sunTrue },
            moon: { mean: moonMean, apogee: moonApogee, true: moonTrue },
            rahu: { true: rahuTrue }
        };
    }

    /**
     * Calculate Tithi (Lunar Day)
     * Based on elongation between Sun and Moon
     */
    calculateTithi(sunLong, moonLong) {
        const elongation = MathUtils.normalizeDeg(moonLong - sunLong);
        const tithiNumber = Math.floor(elongation / SS_CONSTANTS.TITHI_SPAN) + 1;

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
     * Based on Moon's sidereal position
     */
    calculateNakshatra(moonLong) {
        const nakshatraNumber = Math.floor(moonLong / SS_CONSTANTS.NAKSHATRA_SPAN) + 1;
        const nakshatraName = NAKSHATRA_NAMES[nakshatraNumber - 1];

        // Nakshatra lord (traditional rulership cycle)
        const lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
        const lordIndex = (nakshatraNumber - 1) % 9;

        return {
            number: nakshatraNumber,
            name: nakshatraName,
            lord: lords[lordIndex],
            pada: Math.floor((moonLong % SS_CONSTANTS.NAKSHATRA_SPAN) / (SS_CONSTANTS.NAKSHATRA_SPAN / 4)) + 1
        };
    }

    /**
     * Calculate Yoga
     * Based on sum of Sun and Moon longitudes
     */
    calculateYoga(sunLong, moonLong) {
        const yogaSum = MathUtils.normalizeDeg(sunLong + moonLong);
        const yogaNumber = Math.floor(yogaSum / SS_CONSTANTS.YOGA_SPAN) + 1;
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
        const elongation = MathUtils.normalizeDeg(moonLong - sunLong);
        const karanaNumber = Math.floor(elongation / SS_CONSTANTS.KARANA_SPAN);

        // First and last karanas are fixed, rest are movable
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
        const jd = TimeUtils.getJulianDay(date);
        const T = (jd - 2451545.0) / 36525;

        // Sidereal Time at Greenwich (simplified)
        const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * (0.000387933 - T / 38710000);
        const siderealTime = MathUtils.normalizeDeg(gmst);

        // Ascendant (simplified - would need proper obliquity and RAMC calculation)
        const lagnaLong = MathUtils.normalizeDeg(siderealTime + (latitude * 0.5)); // Simplified

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
     * Comprehensive Panchanga Calculation
     */
    calculateCompletePanchanga(date, latitude = 13.0827) {
        const positions = this.calculatePositions(date);
        const sunLong = positions.sun.true;
        const moonLong = positions.moon.true;

        return {
            date: date.toISOString(),
            ahargana: positions.ahargana,

            // Five Angas of Panchanga
            vara: this.calculateVaara(date),
            tithi: this.calculateTithi(sunLong, moonLong),
            nakshatra: this.calculateNakshatra(moonLong),
            yoga: this.calculateYoga(sunLong, moonLong),
            karana: this.calculateKarana(sunLong, moonLong),

            // Additional elements
            rasi: this.calculateRasi(moonLong),
            lagna: this.calculateLagna(date, latitude),

            // Planetary positions
            planetaryPositions: {
                sun: sunLong.toFixed(3),
                moon: moonLong.toFixed(3),
                rahu: positions.rahu.true.toFixed(3)
            },

            system: "Surya Siddhanta"
        };
    }
}

module.exports = new SuryaSiddhantaEngine();
