/**
 * Swiss Ephemeris Configuration
 * Global settings for all calculations
 */

const swisseph = require('swisseph');

// Set ephemeris path
const EPHE_PATH = '/usr/share/libswe/ephe';
swisseph.swe_set_ephe_path(EPHE_PATH);

// Set default ayanamsa (Lahiri)
const AYANAMSA_LAHIRI = swisseph.SE_SIDM_LAHIRI;
swisseph.swe_set_sid_mode(AYANAMSA_LAHIRI, 0, 0);

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
    RAHU: swisseph.SE_MEAN_NODE,  // Mean Rahu
    KETU: swisseph.SE_MEAN_NODE,  // Mean Ketu (180° from Rahu)
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
