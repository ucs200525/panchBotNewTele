/**
 * AI Core — Swiss Adapter v1.0
 * Clean bridge between the AI Core execution layer and the Swiss Ephemeris engines.
 * All calls to calculateLagnaAndHouses and calculatePlanetaryState go through here.
 * Provides error handling, caching, and a consistent return format.
 */

const { calculateLagnaAndHouses, mapPlanetsToHouses } = require('../../ai_astrologer/astrology/lagna');
const { calculatePlanetaryState } = require('../../ai_astrologer/astrology/planets');
const { getNakshatraDetails } = require('../../ai_astrologer/astrology/nakshatra');

// Simple in-memory cache keyed by "lat:lng:isoDate"
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function cacheKey(type, lat, lng, dateStr) {
  return `${type}:${lat}:${lng}:${dateStr}`;
}

function fromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}

function toCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

/**
 * Parse birth details from userProfile into a Date object.
 * Returns null if profile is incomplete.
 */
function parseBirthDate(userProfile) {
  if (!userProfile?.dob || !userProfile?.time) return null;
  const dtStr = `${userProfile.dob}T${userProfile.time.length === 5 ? userProfile.time + ':00' : userProfile.time}`;
  const dt = new Date(dtStr);
  return isNaN(dt.getTime()) ? null : dt;
}

/**
 * Get default location from userProfile or fall back to Hyderabad
 */
function getLocation(userProfile) {
  return {
    lat: userProfile?.lat ? parseFloat(userProfile.lat) : 17.385,
    lng: userProfile?.lng ? parseFloat(userProfile.lng) : 78.4867,
  };
}

/**
 * Compute the user's natal Lagna (Ascendant) using Swiss Ephemeris.
 * @param {object} userProfile
 * @param {Date|null} overrideDate - For transit, pass the resolved date
 * @returns {object|null} { name, degree, symbol, nakshatra, rashiIndex, placidusCusps } or null
 */
function computeLagna(userProfile, overrideDate = null) {
  const dt = overrideDate || parseBirthDate(userProfile);
  if (!dt) return null;

  const { lat, lng } = getLocation(userProfile);
  const key = cacheKey('lagna', lat, lng, dt.toISOString());
  const cached = fromCache(key);
  if (cached) return cached;

  try {
    const result = calculateLagnaAndHouses(dt, lat, lng);
    if (!result.success) return null;

    const output = {
      name: result.lagna.name,
      degree: parseFloat(result.lagna.degree.toFixed(2)),
      symbol: result.lagna.symbol || '',
      rashiIndex: result.lagna.rashiIndex,
      nakshatra: result.lagna.nakshatra,
      siderealAscendant: parseFloat(result.siderealAscendant.toFixed(4)),
      ayanamsa: parseFloat(result.ayanamsa.toFixed(4)),
      placidusCusps: result.placidusCusps || [],
    };

    toCache(key, output);
    return output;
  } catch (err) {
    console.error('[SwissAdapter] computeLagna error:', err.message);
    return null;
  }
}

/**
 * Compute all 9 Vedic planetary positions for a given date.
 * @param {object} userProfile - For birth chart, use birth date
 * @param {Date|null} overrideDate - For transit, pass today's date
 * @returns {object|null} { planets: [...], julianDay, ayanamsa }
 */
function computePlanets(userProfile, overrideDate = null) {
  const dt = overrideDate || parseBirthDate(userProfile);
  if (!dt) return null;

  const { lat, lng } = getLocation(userProfile);
  const key = cacheKey('planets', lat, lng, dt.toISOString());
  const cached = fromCache(key);
  if (cached) return cached;

  try {
    const result = calculatePlanetaryState(dt);
    if (!result.success) return null;

    toCache(key, result);
    return result;
  } catch (err) {
    console.error('[SwissAdapter] computePlanets error:', err.message);
    return null;
  }
}

/**
 * Get planet house placements relative to natal Lagna.
 * @param {object} userProfile
 * @returns {Array|null}
 */
function computeHousePlacements(userProfile) {
  const lagna = computeLagna(userProfile);
  const planets = computePlanets(userProfile);
  if (!lagna || !planets) return null;

  try {
    return mapPlanetsToHouses(lagna.rashiIndex, planets.planets);
  } catch (err) {
    console.error('[SwissAdapter] computeHousePlacements error:', err.message);
    return null;
  }
}

/**
 * Compute today's transit Moon nakshatra and sign.
 * @param {Date|null} overrideDate
 * @returns {object|null} { nakshatra, rashi }
 */
function computeTodayMoon(overrideDate = null) {
  const now = overrideDate || new Date();
  const key = cacheKey('moon', 0, 0, now.toISOString().split('T')[0]);
  const cached = fromCache(key);
  if (cached) return cached;

  try {
    const result = calculatePlanetaryState(now);
    if (!result.success) return null;
    const moon = result.planets.find(p => p.id === 1); // Moon = ID 1
    if (!moon) return null;
    const output = { nakshatra: moon.nakshatra, rashi: moon.rashi, longitude: moon.longitude };
    toCache(key, output);
    return output;
  } catch (err) {
    console.error('[SwissAdapter] computeTodayMoon error:', err.message);
    return null;
  }
}

/**
 * Compute the user's birth Tithi and Weekday.
 * @param {object} userProfile 
 * @returns {object|null} { tithi, vara }
 */
function computeBirthPanchang(userProfile) {
  const dt = parseBirthDate(userProfile);
  if (!dt) return null;

  try {
    const TithiCalculator = require('../../swisseph/panchanga/tithiCalculator');
    const calc = new TithiCalculator();
    const tithi = calc.getTithiAtTime(dt);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const vara = weekdays[dt.getDay()];

    // Compute Nakshatra
    const { lat, lng } = getLocation(userProfile);
    const planets = calculatePlanetaryState(dt, lat, lng);
    const moon = planets.planets.find(p => p.id === 1); // 1 = Moon

    return { 
      tithi: tithi.name || tithi, 
      vara, 
      nakshatra: moon?.nakshatra,
      rashi: moon?.rashi?.name || moon?.rashi
    };
  } catch (err) {
    console.error('[SwissAdapter] computeBirthPanchang error:', err.message);
    return null;
  }
}

/**
 * Get nakshatra for a specific longitude (utility helper)
 */
function getNakshatra(longitude) {
  try {
    return getNakshatraDetails(longitude);
  } catch {
    return null;
  }
}

/**
 * Compute Transit Panchang for a specific date (Sunrise, Sunset, Rahu Kaal, etc.)
 * @param {object} userProfile
 * @param {Date} date
 * @returns {object|null}
 */
async function computeTransitPanchang(userProfile, date) {
  const { lat, lng } = getLocation(userProfile);
  const dateStr = date.toISOString().split('T')[0];
  const key = cacheKey('transit_panchang', lat, lng, dateStr);
  const cached = fromCache(key);
  if (cached) return cached;

  try {
    const planetary = require('../../swisseph/planetary');
    const { calculatePanchangData } = require('../../utils/panchangHelper');
    
    // 1. Get Sunrise/Sunset
    const sunrise = planetary.getSunrise(date, lat, lng);
    const sunset = planetary.getSunset(date, lat, lng);
    const moonrise = planetary.getMoonrise(date, lat, lng);
    const moonset = planetary.getMoonset(date, lat, lng);
    
    // 2. Format to HH:mm for panchangHelper
    const fmt = (d) => d ? d.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    // 3. Compute full Panchang
    const data = await calculatePanchangData(
      userProfile.city || 'Hyderabad',
      dateStr,
      lat,
      lng,
      fmt(sunrise),
      fmt(sunset),
      fmt(moonrise),
      fmt(moonset),
      fmt(sunrise) // use same sunrise for nextSunrise approximation
    );

    toCache(key, data);
    return data;
  } catch (err) {
    console.error('[SwissAdapter] computeTransitPanchang error:', err.message);
    return null;
  }
}

module.exports = {
  computeLagna,
  computePlanets,
  computeHousePlacements,
  computeTodayMoon,
  computeBirthPanchang,
  computeTransitPanchang,
  getNakshatra,
  parseBirthDate,
  getLocation,
};
