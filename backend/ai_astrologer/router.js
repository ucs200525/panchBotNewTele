/**
 * Vedic AI Astrologer Router
 * Orchestrates Objective 1 (Muhurat scoring) and Objective 2 (Astrological calculation charts)
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Objective 1: Muhurat Core
const { compileDailyMuhuratTimeline } = require('./muhurat/evaluator');

// Objective 2: Astrological Core
const { calculatePlanetaryState } = require('./astrology/planets');
const { calculateLagnaAndHouses, mapPlanetsToHouses } = require('./astrology/lagna');

/**
 * Helper to convert YYYY-MM-DD date to DD/MM/YYYY for compatibility
 */
function convertToDDMMYYYY(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * @route   POST /api/ai/muhurat-timeline
 * @desc    Get complete Good and Bad Muhurat time schedule for a date/city
 */
router.post('/muhurat-timeline', async (req, res) => {
  try {
    const { city, date, name, birthNakshatra, birthRashi, lat, lng } = req.body;
    logger.info({ message: 'POST /api/ai/muhurat-timeline called', city, date });

    if (!city || !date) {
      return res.status(400).json({ error: 'City and date are required' });
    }

    // Default coordinates if not provided (Hyderabad defaults)
    const latitude = lat ? parseFloat(lat) : 17.3850;
    const longitude = lng ? parseFloat(lng) : 78.4867;
    const timeZone = 'Asia/Kolkata';

    // 1. Fetch Sun times using standard routing functions
    const { fetchSunTimes, createDrikTable, createBharagvTable } = require('../routes/panchangRoutes');
    const sunTimesData = await fetchSunTimes(latitude, longitude, date, timeZone);
    
    if (!sunTimesData) {
      return res.status(500).json({ error: 'Could not calculate solar transits' });
    }

    // 2. Fetch Core Panchang details
    const { calculatePanchangData } = require('../utils/panchangHelper');
    const panchangData = await calculatePanchangData(
      city,
      date,
      latitude,
      longitude,
      sunTimesData.sunriseToday,
      sunTimesData.sunsetToday,
      sunTimesData.moonriseToday,
      sunTimesData.moonsetToday,
      sunTimesData.sunriseTmrw,
      true // includeTransitions
    );

    // 3. Fetch Swiss Muhurats
    let swissMuhurats = [];
    try {
      const dateDDMMYYYY = convertToDDMMYYYY(date);
      swissMuhurats = await createDrikTable(city, dateDDMMYYYY);
    } catch (err) {
      swissMuhurats = [];
    }

    // 4. Fetch Bhargava fallback table
    let bhargavaTable = [];
    try {
      bhargavaTable = await createBharagvTable(city, date, true, true, latitude, longitude, timeZone);
    } catch (err) {
      bhargavaTable = [];
    }

    // 5. Run the core Objective 1 compilation timeline
    const timelineResult = compileDailyMuhuratTimeline(
      panchangData,
      swissMuhurats,
      bhargavaTable,
      { name, taraBalaRating: 'Good', chandraBalaRating: 'Good' } // Mock ratings for context compilation
    );

    res.json({
      success: true,
      city,
      date,
      panchang: {
        sunrise: panchangData.sunrise,
        sunset: panchangData.sunset,
        rahuKaal: panchangData.rahuKaal,
        abhijit: panchangData.abhijitMuhurat
      },
      ...timelineResult
    });

  } catch (error) {
    logger.error({ message: 'POST /api/ai/muhurat-timeline error', error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to compile daily Muhurat timeline', details: error.message });
  }
});

/**
 * @route   POST /api/ai/birth-chart
 * @desc    Get birth Lagna, Planet coordinates, and House allocations
 */
router.post('/birth-chart', async (req, res) => {
  try {
    const { birthDate, birthTime, lat, lng } = req.body;
    logger.info({ message: 'POST /api/ai/birth-chart called', birthDate, birthTime });

    if (!birthDate || !birthTime) {
      return res.status(400).json({ error: 'birthDate and birthTime are required' });
    }

    // Parse coordinates (Hyderabad as default)
    const latitude = lat ? parseFloat(lat) : 17.3850;
    const longitude = lng ? parseFloat(lng) : 78.4867;

    // Combine date and time string to JS Date object
    const birthDateTimeStr = `${birthDate}T${birthTime}:00`;
    const birthDateObj = new Date(birthDateTimeStr);

    if (isNaN(birthDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time parameters provided' });
    }

    // 1. Calculate Birth Planets
    const planetaryState = calculatePlanetaryState(birthDateObj);

    // 2. Calculate Birth Lagna and House Cusps
    const lagnaState = calculateLagnaAndHouses(birthDateObj, latitude, longitude);

    // 3. Map Planets to Vedic Houses
    const houseMaps = mapPlanetsToHouses(lagnaState.lagna.rashiIndex, planetaryState.planets);

    // Merge house allocations into planetary response
    const finalPlanets = planetaryState.planets.map(planet => {
      const mapping = houseMaps.find(m => m.planetId === planet.id);
      return {
        ...planet,
        house: mapping ? mapping.house : 1
      };
    });

    res.json({
      success: true,
      birthDate,
      birthTime,
      latitude,
      longitude,
      lagna: lagnaState.lagna,
      cusps: lagnaState.placidusCusps,
      planets: finalPlanets
    });

  } catch (error) {
    logger.error({ message: 'POST /api/ai/birth-chart error', error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to calculate birth chart', details: error.message });
  }
});

module.exports = router;
