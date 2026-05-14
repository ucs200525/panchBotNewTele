/**
 * Objective 2: Sidereal Astrological Calculations
 * planets.js - Computes high-precision Sidereal longitudes, signs, retrogrades, and Nakshatras for the 9 Vedic planets.
 */

const { swisseph, PLANETS, RASHIS, RASHI_SYMBOLS } = require('../../swisseph/core/config');
const { dateToJulianDay } = require('../../swisseph/core/julianDay');
const { getNakshatraDetails } = require('./nakshatra');

const VEDIC_PLANET_NAMES = {
  [PLANETS.SUN]: "Sun (Surya)",
  [PLANETS.MOON]: "Moon (Chandra)",
  [PLANETS.MERCURY]: "Mercury (Budha)",
  [PLANETS.VENUS]: "Venus (Shukra)",
  [PLANETS.MARS]: "Mars (Mangala)",
  [PLANETS.JUPITER]: "Jupiter (Guru)",
  [PLANETS.SATURN]: "Saturn (Shani)",
  [PLANETS.RAHU]: "Rahu (North Node)",
  11: "Ketu (South Node)" // Computed manually (opposite of Rahu)
};

/**
 * Calculates Sidereal position of a specific planet ID
 */
function getPlanetPosition(jd, planetId) {
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
  
  if (planetId === 11) {
    // Ketu is exactly 180 degrees opposite of Rahu (PLANETS.RAHU = 10)
    const rahuRes = swisseph.swe_calc_ut(jd, PLANETS.RAHU, swisseph.SEFLG_SWIEPH);
    const tropicalKetu = (rahuRes.longitude + 180) % 360;
    const siderealKetu = (tropicalKetu - ayanamsa + 360) % 360;
    return {
      longitude: siderealKetu,
      speed: rahuRes.longitudeSpeed, // Same node speed
      isRetrograde: false // Node states are uniform
    };
  }

  const result = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SWIEPH);
  const siderealLong = (result.longitude - ayanamsa + 360) % 360;

  return {
    longitude: siderealLong,
    speed: result.longitudeSpeed,
    isRetrograde: result.longitudeSpeed < 0
  };
}

/**
 * Computes complete planetary state for any JS Date
 * @param {Date} dateObj - Birth or transit date
 */
function calculatePlanetaryState(dateObj) {
  const jd = dateToJulianDay(dateObj);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);

  const planetsList = [
    PLANETS.SUN,
    PLANETS.MOON,
    PLANETS.MERCURY,
    PLANETS.VENUS,
    PLANETS.MARS,
    PLANETS.JUPITER,
    PLANETS.SATURN,
    PLANETS.RAHU,
    11 // Manual Ketu ID
  ];

  const results = planetsList.map(pId => {
    const pos = getPlanetPosition(jd, pId);
    
    // Resolve Rashi index (0-11) and exact degrees inside sign (0-30)
    const rashiIndex = Math.floor(pos.longitude / 30);
    const signName = RASHIS[rashiIndex];
    const signSymbol = RASHI_SYMBOLS[signName] || '';
    const signDegree = pos.longitude % 30;

    // Resolve Nakshatra quarters
    const nakDetails = getNakshatraDetails(pos.longitude);

    return {
      id: pId,
      name: VEDIC_PLANET_NAMES[pId],
      longitude: pos.longitude,
      isRetrograde: pos.isRetrograde,
      speed: pos.speed,
      rashi: {
        index: rashiIndex,
        name: signName,
        symbol: signSymbol,
        degree: signDegree
      },
      nakshatra: nakDetails
    };
  });

  return {
    success: true,
    julianDay: jd,
    ayanamsa,
    planets: results
  };
}

module.exports = {
  calculatePlanetaryState,
  getPlanetPosition
};
