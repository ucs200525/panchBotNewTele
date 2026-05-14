/**
 * Objective 2: Sidereal Astrological Calculations
 * lagna.js - Computes Sidereal Ascendant (Lagna), astronomical house cusps, and maps planet placements to houses.
 */

const { swisseph, RASHIS, RASHI_SYMBOLS } = require('../../swisseph/core/config');
const { dateToJulianDay } = require('../../swisseph/core/julianDay');
const { getNakshatraDetails } = require('./nakshatra');

/**
 * Calculates Sidereal Lagna and 12 Placidus house cusps
 * @param {Date} dateObj - Birth date
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function calculateLagnaAndHouses(dateObj, lat, lng) {
  const jd = dateToJulianDay(dateObj);
  const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);

  // Calculate Placidus houses
  const houseData = swisseph.swe_houses(jd, lat, lng, 'P');
  
  // Apply Sidereal offset to Ascendant and House cusps
  const siderealAscendant = (houseData.ascendant - ayanamsa + 360) % 360;
  
  // Swiss Ephemeris houses array has index 1 as House 1 Cusp, up to index 12 as House 12 Cusp
  const rawCusps = houseData.houses;
  const siderealCusps = [];
  
  for (let i = 1; i <= 12; i++) {
    const cusp = rawCusps[i] !== undefined ? rawCusps[i] : (houseData.ascendant + (i - 1) * 30) % 360;
    siderealCusps.push((cusp - ayanamsa + 360) % 360);
  }

  // Calculate Lagna Sign index (0-11)
  const lagnaRashiIndex = Math.floor(siderealAscendant / 30);
  const lagnaSignName = RASHIS[lagnaRashiIndex];
  const lagnaSignSymbol = RASHI_SYMBOLS[lagnaSignName] || '';
  const lagnaDegree = siderealAscendant % 30;

  // Resolve Lagna Nakshatra Details
  const lagnaNak = getNakshatraDetails(siderealAscendant);

  return {
    success: true,
    siderealAscendant,
    ayanamsa,
    lagna: {
      rashiIndex: lagnaRashiIndex,
      name: lagnaSignName,
      symbol: lagnaSignSymbol,
      degree: lagnaDegree,
      nakshatra: lagnaNak
    },
    placidusCusps: siderealCusps
  };
}

/**
 * Maps planetary placements to classical Vedic Equal Sign Houses relative to Lagna Sign
 * @param {number} lagnaRashiIndex - Zodiac index of the Lagna (0-11)
 * @param {Array} planetStates - Array of planet position objects with rashi.index fields
 */
function mapPlanetsToHouses(lagnaRashiIndex, planetStates) {
  return planetStates.map(planet => {
    // In equal sign house system, House 1 is the sign of the Lagna, House 2 is Sign+1, etc.
    const planetRashi = planet.rashi.index;
    const houseNumber = (planetRashi - lagnaRashiIndex + 12) % 12 + 1;

    return {
      planetId: planet.id,
      planetName: planet.name,
      rashi: planet.rashi,
      house: houseNumber
    };
  });
}

module.exports = {
  calculateLagnaAndHouses,
  mapPlanetsToHouses
};
