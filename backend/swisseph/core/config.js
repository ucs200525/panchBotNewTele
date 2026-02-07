/**
 * Swiss Ephemeris Configuration - Complete Fallback Implementation
 * Provides JavaScript fallbacks for all essential swisseph functions
 */

// Try to load native swisseph, fallback to mock if not available
let swisseph;
let useNative = false;

try {
    swisseph = require('swisseph');
    useNative = true;
    console.log('✅ Native SwissEph loaded successfully');
} catch (e) {
    console.log('⚠️  Native SwissEph not available, using JavaScript fallback');

    // JavaScript-based astronomical calculations
    function jsGetAyanamsa(jd) {
        const T = (jd - 2451545.0) / 36525;
        const ayanamsa = 23.85 + 0.013888889 * (jd - 2451545.0) / 365.25;
        return ayanamsa;
    }

    function jsCalcPlanet(jd, planet, flags) {
        const T = (jd - 2451545.0) / 36525;
        let longitude = 0;

        if (planet === 0) { // Sun
            const L = 280.460 + 0.9856474 * (jd - 2451545.0);
            const g = 357.528 + 0.9856003 * (jd - 2451545.0);
            longitude = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
        } else if (planet === 1) { // Moon
            // Mean longitude
            const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
            // Mean elongation
            const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
            // Sun's mean anomaly
            const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
            // Moon's mean anomaly
            const Mm = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
            // Moon's argument of latitude
            const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;

            const rD = D * Math.PI / 180;
            const rM = M * Math.PI / 180;
            const rMm = Mm * Math.PI / 180;
            const rF = F * Math.PI / 180;

            // Major perturbations
            let e = L0;
            e += 6.289 * Math.sin(rMm);
            e += -1.274 * Math.sin(rMm - 2 * rD);
            e += 0.658 * Math.sin(2 * rD);
            e += 0.214 * Math.sin(2 * rMm);
            e += -0.186 * Math.sin(rM);
            e += -0.114 * Math.sin(2 * rF);
            e += -0.059 * Math.sin(2 * rMm - 2 * rD);
            e += 0.057 * Math.sin(rMm - 2 * rD + rM);
            e += 0.053 * Math.sin(rMm + 2 * rD);
            e += 0.046 * Math.sin(2 * rD - rM);

            longitude = e;
        } else if (planet === 2) { // Mercury
            longitude = 252.25 + 149472.68 * T;
        } else if (planet === 3) { // Venus
            longitude = 181.98 + 58517.82 * T;
        } else if (planet === 4) { // Mars
            longitude = 355.45 + 19141.70 * T;
        } else if (planet === 5) { // Jupiter
            longitude = 34.35 + 3034.91 * T;
        } else if (planet === 6) { // Saturn
            longitude = 50.08 + 1222.11 * T;
        } else if (planet === 10 || planet === 11) { // Rahu/Ketu
            longitude = 125.04 - 1934.14 * T;
        }

        longitude = (longitude % 360 + 360) % 360;

        return {
            longitude: longitude,
            latitude: 0,
            distance: 1,
            longitudeSpeed: 0.98, // Average speed
            latitudeSpeed: 0,
            distanceSpeed: 0
        };
    }

    // Mock swisseph with complete function implementations
    swisseph = {
        // Constants
        SE_SUN: 0,
        SE_MOON: 1,
        SE_MERCURY: 2,
        SE_VENUS: 3,
        SE_MARS: 4,
        SE_JUPITER: 5,
        SE_SATURN: 6,
        SE_MEAN_NODE: 10,
        SE_TRUE_NODE: 11,
        SE_URANUS: 7,
        SE_NEPTUNE: 8,
        SE_PLUTO: 9,
        SEFLG_SWIEPH: 2,
        SE_GREG_CAL: 1,
        SE_SIDM_LAHIRI: 1,
        SE_SIDM_RAMAN: 3,
        SE_SIDM_KRISHNAMURTI: 5,
        SE_SIDM_FAGAN_BRADLEY: 0,
        SE_SIDM_TRUE_CHITRAPAKSHA: 27,
        SE_SIDM_YUKTESHWAR: 7,
        SE_CALC_RISE: 1,
        SE_CALC_SET: 2,

        // Function implementations
        swe_get_ayanamsa_ut: function (jd) {
            return jsGetAyanamsa(jd);
        },

        swe_calc_ut: function (jd, planet, flags) {
            return jsCalcPlanet(jd, planet, flags);
        },

        swe_julday: function (year, month, day, hour, calType) {
            let a = Math.floor((14 - month) / 12);
            let y = year + 4800 - a;
            let m = month + 12 * a - 3;
            let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
                Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
            return jdn + (hour - 12) / 24;
        },

        swe_set_ephe_path: function () { },
        swe_set_sid_mode: function () { },

        swe_jdut1_to_utc: function (jd, calType) {
            const jd2 = jd + 0.5;
            const z = Math.floor(jd2);
            const f = jd2 - z;

            let a = z;
            if (z >= 2299161) {
                const alpha = Math.floor((z - 1867216.25) / 36524.25);
                a = z + 1 + alpha - Math.floor(alpha / 4);
            }

            const b = a + 1524;
            const c = Math.floor((b - 122.1) / 365.25);
            const d = Math.floor(365.25 * c);
            const e = Math.floor((b - d) / 30.6001);

            const day = b - d - Math.floor(30.6001 * e) + f;
            const month = e < 14 ? e - 1 : e - 13;
            const year = month > 2 ? c - 4716 : c - 4715;

            const hours = (day - Math.floor(day)) * 24;
            const minutes = (hours - Math.floor(hours)) * 60;
            const seconds = (minutes - Math.floor(minutes)) * 60;

            return {
                year: year,
                month: month,
                day: Math.floor(day),
                hour: Math.floor(hours),
                minute: Math.floor(minutes),
                second: Math.floor(seconds)
            };
        },

        swe_houses: function (jd, lat, lng, hsys) {
            // Calculate Local Sidereal Time
            const T = (jd - 2451545.0) / 36525.0;
            const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
                0.000387933 * T * T - T * T * T / 38710000;
            const LST = (GMST + lng + 360) % 360;

            // Calculate ascendant (simplified formula)
            const LSTrad = LST * Math.PI / 180;
            const latRad = lat * Math.PI / 180;
            const epsilon = 23.4393 * Math.PI / 180; // Mean obliquity

            const tanAsc = Math.cos(LSTrad) / (Math.cos(epsilon) * Math.sin(LSTrad) + Math.sin(epsilon) * Math.tan(latRad));
            let ascendant = Math.atan(tanAsc) * 180 / Math.PI;

            // Adjust quadrant
            if (Math.sin(LSTrad) < 0) {
                ascendant += 180;
            }
            ascendant = (ascendant + 360) % 360;

            // Calculate MC (Midheaven)
            const mc = (LST + 360) % 360;

            // Placidus house cusps (simplified - using equal houses as approximation)
            const houses = new Array(13);
            houses[0] = 0; // Not used
            houses[1] = ascendant; // ASC
            houses[10] = mc; // MC

            // Equal house division for other cusps
            for (let i = 2; i < 10; i++) {
                houses[i] = (ascendant + (i - 1) * 30) % 360;
            }
            houses[11] = (mc + 30) % 360;
            houses[12] = (mc + 60) % 360;

            return {
                houses: houses,
                ascendant: ascendant,
                mc: mc,
                armc: LST,
                vertex: 0,
                equatorialAscendant: ascendant,
                coAscendantKoch: 0,
                coAscendantMunkasey: 0,
                polarAscendant: 0,
                ascmc: [ascendant, mc, LST, 0, 0, 0, 0, 0]
            };
        },

        swe_rise_trans: function (jd, ipl, starname, epheflag, rsmi, geopos, atpress, attemp) {
            // Simplified rise/set calculation
            const lat = geopos[1];
            const lng = geopos[0];

            // Basic sunrise/sunset approximation
            // This is very simplified - real calculation is complex
            const isRise = rsmi === 1; // 1 = rise, 2 = set

            // Use a simple formula: assume 6 AM local for sunrise, 6 PM for sunset
            const dayFraction = isRise ? 0.25 : 0.75; // 6 AM or 6 PM
            const localJD = Math.floor(jd - lng / 360.0) + dayFraction;

            return {
                transitTime: localJD,
                error: null
            };
        }
    };
}

// Set ephemeris path (only if native is available)
const EPHE_PATH = '/usr/share/libswe/ephe';
if (useNative && swisseph.swe_set_ephe_path) {
    try {
        swisseph.swe_set_ephe_path(EPHE_PATH);
    } catch (e) {
        console.log('⚠️  Could not set ephemeris path');
    }
}

// Set default ayanamsa (Lahiri)
const AYANAMSA_LAHIRI = swisseph.SE_SIDM_LAHIRI;
if (useNative && swisseph.swe_set_sid_mode) {
    try {
        swisseph.swe_set_sid_mode(AYANAMSA_LAHIRI, 0, 0);
    } catch (e) {
        console.log('⚠️  Could not set ayanamsa mode');
    }
}

// Available ayanamsa systems
const AYANAMSA_SYSTEMS = {
    LAHIRI: swisseph.SE_SIDM_LAHIRI,
    RAMAN: swisseph.SE_SIDM_RAMAN,
    KP: swisseph.SE_SIDM_KRISHNAMURTI,
    FAGAN_BRADLEY: swisseph.SE_SIDM_FAGAN_BRADLEY,
    TRUE_CHITRAPAKSHA: swisseph.SE_SIDM_TRUE_CHITRAPAKSHA,
    YUKTESHWAR: swisseph.SE_SIDM_YUKTESHWAR
};

// Planet constants
const PLANETS = {
    SUN: swisseph.SE_SUN,
    MOON: swisseph.SE_MOON,
    MERCURY: swisseph.SE_MERCURY,
    VENUS: swisseph.SE_VENUS,
    MARS: swisseph.SE_MARS,
    JUPITER: swisseph.SE_JUPITER,
    SATURN: swisseph.SE_SATURN,
    RAHU: swisseph.SE_MEAN_NODE,
    KETU: swisseph.SE_MEAN_NODE,
    URANUS: swisseph.SE_URANUS,
    NEPTUNE: swisseph.SE_NEPTUNE,
    PLUTO: swisseph.SE_PLUTO,
    TRUE_RAHU: swisseph.SE_TRUE_NODE,
    TRUE_KETU: swisseph.SE_TRUE_NODE
};

// Nakshatra names
const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Rashi (Zodiac) names in Sanskrit
const RASHIS = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

// Rashi symbols
const RASHI_SYMBOLS = {
    'Mesha': '♈', 'Vrishabha': '♉', 'Mithuna': '♊',
    'Karka': '♋', 'Simha': '♌', 'Kanya': '♍',
    'Tula': '♎', 'Vrishchika': '♏', 'Dhanu': '♐',
    'Makara': '♑', 'Kumbha': '♒', 'Meena': '♓'
};

// Tithi names
const TITHIS = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

// Yoga names
const YOGAS = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma',
    'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana',
    'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha',
    'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

// Karana names
const KARANAS = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

// Weekday names
const VARAS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// Sanskrit weekday names
const VARAS_SANSKRIT = [
    'Ravivara', 'Somavara', 'Mangalavara', 'Budhavara',
    'Guruvara', 'Shukravara', 'Shanivara'
];

module.exports = {
    swisseph,
    useNative,
    EPHE_PATH,
    AYANAMSA_LAHIRI,
    AYANAMSA_SYSTEMS,
    PLANETS,
    NAKSHATRAS,
    RASHIS,
    RASHI_SYMBOLS,
    TITHIS,
    YOGAS,
    KARANAS,
    VARAS,
    VARAS_SANSKRIT
};
