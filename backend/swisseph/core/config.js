const astroMath = require('./astroMath');
const path = require('path');

// 1. Constants
const PLANETS = {
    SUN: 0, MOON: 1, MERCURY: 2, VENUS: 3, MARS: 4, JUPITER: 5, SATURN: 6, RAHU: 10, KETU: 11
};

const RASHIS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const RASHI_SYMBOLS = {
    'Mesha': '♈', 'Vrishabha': '♉', 'Mithuna': '♊', 'Karka': '♋',
    'Simha': '♌', 'Kanya': '♍', 'Tula': '♎', 'Vrishchika': '♏',
    'Dhanu': '♐', 'Makara': '♑', 'Kumbha': '♒', 'Meena': '♓'
};

// 2. Load Swiss Ephemeris or Fallback
let swisseph;
let engine = 'unknown';

try {
    swisseph = require('swisseph');
    engine = 'native';
    // Configure paths for native engine
    const ephePath = path.join(__dirname, '..', '..', 'data', 'ephe');
    swisseph.swe_set_ephe_path(ephePath);
    console.log('🚀 Using Native Swiss Ephemeris Engine (High Accuracy)');
} catch (e) {
    console.warn('⚠️  Native Swiss Ephemeris failed, falling back to JS Mathematics Engine');
    engine = 'js';
    swisseph = {
        SEFLG_SWIEPH: 2,
        SEFLG_SIDEREAL: 65536,
        SIDM_LAHIRI: 1,
        SE_SUN: 0,
        SE_MOON: 1,
        SE_MARS: 4,
        SE_MERCURY: 2,
        SE_JUPITER: 5,
        SE_VENUS: 3,
        SE_SATURN: 6,
        SE_RAHU: 10,
        SE_CALC_RISE: 1,
        SE_CALC_SET: 2,
        SE_GREG_CAL: 1,

        swe_set_sid_mode: (mode) => {},
        swe_get_ayanamsa_ut: (jd) => astroMath.getAyanamsa(jd),
        
        swe_calc_ut: (jd, planet) => {
            let pos;
            if (planet === 0) pos = astroMath.getSunPosition(jd);
            else if (planet === 1) pos = astroMath.getMoonPosition(jd);
            else pos = astroMath.getPlanetPosition(jd, planet);
            
            return {
                longitude: pos.longitude,
                latitude: pos.latitude || 0,
                distance: pos.distance || 1,
                longitudeSpeed: pos.speed || 0
            };
        },

        swe_julday: (year, month, day, hour) => {
            const date = new Date(Date.UTC(year, month - 1, day, Math.floor(hour), Math.floor((hour % 1) * 60)));
            return (date.getTime() / 86400000) + 2440587.5;
        },

        swe_revjul: (jd) => {
            const date = new Date(Math.round((jd - 2440587.5) * 86400000));
            return { 
                year: date.getUTCFullYear(), 
                month: date.getUTCMonth() + 1, 
                day: date.getUTCDate(), 
                hour: date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
            };
        },

        swe_houses: (jd, lat, lng) => {
            // Proper Ascendant calculation following astronomical standards
            const lst = astroMath.getLST(jd, lng); // Local Sidereal Time in degrees
            const eps = astroMath.getObliquity(jd); // Obliquity of ecliptic in degrees
            const phi = lat; // Geographic latitude in degrees
            
            // Convert to radians
            const lstRad = astroMath.rad(lst);
            const epsRad = astroMath.rad(eps);
            const phiRad = astroMath.rad(phi);
            
            // MC (Midheaven) = LST (for simple equal house or starting point)
            const mc = lst;
            
            // Ascendant calculation (ecliptic point rising on eastern horizon)
            // Corrected formula after testing: both x and y need negation
            const x = -(Math.cos(epsRad) * Math.sin(lstRad) + Math.sin(epsRad) * Math.tan(phiRad));
            const y = Math.cos(lstRad);
            let asc = astroMath.deg(Math.atan2(y, x));
            
            // Normalize to 0-360
            if (asc < 0) asc += 360;
            
            const houses = new Array(13).fill(0).map((_, i) => (asc + (i - 1) * 30) % 360);
            return { ascendant: asc, houses, ascmc: [asc, 0, 0, 0] };
        },

        swe_rise_trans: (jd, body, star, flags, rsmi, pos) => {
            const lat = pos[1];
            const lng = pos[0];
            const rs = astroMath.calculateRiseSet(jd, lat, lng, body);
            if (!rs) return { transitTime: jd, error: 'Circumpolar' };
            
            let hourOffset;
            if (rsmi === 1) { // SE_CALC_RISE
                hourOffset = rs.rise;
            } else if (rsmi === 2) { // SE_CALC_SET
                hourOffset = rs.set;
            } else {
                hourOffset = rs.transit;
            }
            
            const dayStart = Math.floor(jd + 0.5) - 0.5;
            return { transitTime: dayStart + (hourOffset / 24) };
        }
    };
}

const configExports = {
    PLANETS,
    RASHIS,
    NAKSHATRAS,
    RASHI_SYMBOLS,
    swisseph,
    engine
};

module.exports = configExports;
