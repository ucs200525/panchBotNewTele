const axios = require('axios');
const logger = require('./logger');

const coordCache = new Map();
const username = 'ucs05';

/**
 * Fetch coordinates and time zone based on the city name
 * @param {string} city 
 * @returns {Promise<object|null>} { lat, lng, timeZone }
 */
async function fetchCoordinates(city) {
  if (!city) return null;
  const cityKey = city.toLowerCase().trim();
  if (coordCache.has(cityKey)) return coordCache.get(cityKey);

  try {
    // 1. Search for the city
    const searchUrl = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(city)}&maxRows=1&username=${username}`;
    const searchResponse = await axios.get(searchUrl);

    if (searchResponse.data.geonames && searchResponse.data.geonames.length > 0) {
      const { lat, lng } = searchResponse.data.geonames[0];

      // 2. Get timezone for the coordinates
      const tzUrl = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`;
      const tzResponse = await axios.get(tzUrl);

      const timeZone = tzResponse.data.timezoneId;
      if (!timeZone) throw new Error('Timezone not found');

      const result = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        timeZone,
        source: 'geonames'
      };

      coordCache.set(cityKey, result);
      return result;
    }
    return null;
  } catch (error) {
    logger.error({ message: 'Error fetching coordinates in geoUtils', error: error.message, city });
    return null;
  }
}

module.exports = { fetchCoordinates };
