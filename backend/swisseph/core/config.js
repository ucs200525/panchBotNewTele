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
    const rawSwisseph = require('swisseph');
    swisseph = rawSwisseph;

    // Normalize wrapper for different versions
    if (!swisseph.swe_set_ephe_path) {
        if (swisseph.constants) {
            Object.assign(swisseph, swisseph.constants);
        }

        const wrapNative = (fnName, originalFn) => {
            return (...args) => {
                const result = originalFn(...args);
                if (result && result.data !== undefined) {
                    if (fnName.includes('calc')) {
                        return {
                            longitude: result.data[0],
                            latitude: result.data[1],
                            distance: result.data[2],
                            longitudeSpeed: result.data[3],
                            latitudeSpeed: result.data[4],
                            distanceSpeed: result.data[5],
                            error: result.error
                        };
                    } else if (fnName.includes('houses')) {
                        return {
                            houses: result.data.houses,
                            ascmc: result.data.points,
                            ascendant: result.data.points[0],
                            error: result.error
                        };
                    } else if (fnName.includes('fixstar')) {
                        return {
                            name: result.name,
                            longitude: result.data[0],
                            latitude: result.data[1],
                            distance: result.data[2],
                            longitudeSpeed: result.data[3]
                        };
                    } else if (fnName.includes('rise_trans')) {
                        return {
                            transitTime: result.data,
                            error: result.error,
                            flag: result.flag
                        };
                    }
                }
                return result;
            };
        };

        Object.keys(swisseph).forEach(key => {
            if (typeof swisseph[key] === 'function' && !key.startsWith('swe_')) {
                const wrapped = wrapNative(key, swisseph[key]);
                swisseph['swe_' + key] = wrapped;
                swisseph[key] = wrapped;
            }
        });

        const ensureWrapped = (legacyName, nativeName) => {
            if (swisseph[nativeName] && !swisseph[legacyName]) {
                swisseph[legacyName] = swisseph['swe_' + nativeName] || wrapNative(nativeName, swisseph[nativeName]);
            }
        };

        ensureWrapped('swe_set_ephe_path', 'set_ephe_path');
        ensureWrapped('swe_calc_ut', 'calc_ut');
        ensureWrapped('swe_julday', 'julday');
        ensureWrapped('swe_revjul', 'revjul');
        ensureWrapped('swe_houses', 'houses');
        ensureWrapped('swe_get_ayanamsa_ut', 'get_ayanamsa_ut');
        ensureWrapped('swe_set_sid_mode', 'set_sid_mode');
    }

    engine = 'native';

    // Configure Swiss Ephemeris
    const ephePath = path.join(__dirname, '..', '..', 'data', 'ephe');
    swisseph.swe_set_ephe_path(ephePath);

    // ✅ Force Lahiri Ayanamsa (Drik Panchang compatible)
    if (swisseph.swe_set_sid_mode && swisseph.SE_SIDM_LAHIRI !== undefined) {
        swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    }

    console.log('🚀 Using Native Swiss Ephemeris Engine with Lahiri Ayanamsa (High Accuracy)');
} catch (e) {
    console.warn('⚠️  Native Swiss Ephemeris failed, falling back to JS Mathematics Engine');
    console.error('Error details:', e.message);
    engine = 'js';

    swisseph = {
        SEFLG_SWIEPH: 2,
        SEFLG_SIDEREAL: 65536,
        SE_SIDM_LAHIRI: 1,
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

        swe_set_sid_mode: () => {},
        // ⚠️ Fallback still uses approximate ayanamsa
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
            const lst = astroMath.getLST(jd, lng);
            const eps = astroMath.getObliquity(jd);
            const phi = lat;

            const lstRad = astroMath.rad(lst);
            const epsRad = astroMath.rad(eps);
            const phiRad = astroMath.rad(phi);

            const x = -(Math.cos(epsRad) * Math.sin(lstRad) + Math.sin(epsRad) * Math.tan(phiRad));
            const y = Math.cos(lstRad);
            let asc = astroMath.deg(Math.atan2(y, x));
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
            if (rsmi === 1) hourOffset = rs.rise;
            else if (rsmi === 2) hourOffset = rs.set;
            else hourOffset = rs.transit;

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
