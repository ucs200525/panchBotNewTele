const express = require('express');
const router = express.Router();
const { lagna } = require('../swisseph');

/**
 * POST /api/lagna/timings
 * Get all Lagna timings for the day
 */
router.post('/timings', async (req, res) => {
    try {
        const { date, lat, lng, timezone = 'Asia/Kolkata', sunrise } = req.body;
        
        // Calculate daily lagna timings
        // Note: calculateDayLagnas requires sunrise string "HH:MM:SS"
        const lagnas = lagna.calculateDayLagnas(date, lat, lng, timezone, sunrise);
        
        res.json({
            date,
            lagnas
        });
    } catch (error) {
        console.error('Lagna Timings API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/lagna/current
 * Get current Lagna based on specific time
 */
router.post('/current', async (req, res) => {
    try {
        const { date, lat, lng } = req.body; // date includes time
        const dateObj = new Date(date);
        
        const currentLagna = lagna.getLagnaAtTime(dateObj, lat, lng);
        
        res.json({
            date,
            lagna: currentLagna
        });
    } catch (error) {
        console.error('Current Lagna API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/lagna/hora
 * Get Hora timings for the day
 */
router.post('/hora', async (req, res) => {
    try {
        const { date, lat, lng, sunrise, sunset } = req.body;
        
        // We need sunrise/sunset/nextSunrise for Hora
        // If not provided, we should calculate them. For now assume passed from frontend 
        // or calculated via helper.
        // Let's use Swiss Ephemeris planetary calculator for accurate rise/set if needed
        // But for simplicity, we'll try to use provided times or fallback.
        
        // Requirement: Frontend must pass sunrise/sunset strings for now
        // Or we use swisseph.planetary.PlanetaryCalculator here.
        
        const { planetary } = require('../swisseph');
        const planner = new planetary.PlanetaryCalculator();
        const dateObj = new Date(date);
        
        // Calculate accurate sunrise/sunset if not provided
        // Use noon to avoid edge cases
        const noon = new Date(dateObj);
        noon.setHours(12, 0, 0, 0);
        
        // Use individual methods instead of getRiseSet
        const sunRise = planner.getSunrise(noon, lat, lng);
        const sunSet = planner.getSunset(noon, lat, lng);
        
        // Need next day sunrise for night horas
        const nextDay = new Date(noon);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextSunRise = planner.getSunrise(nextDay, lat, lng);

        if (!sunRise || !sunSet || !nextSunRise) {
            throw new Error('Could not calculate sunrise/sunset for the given location and date');
        }
        
        const lIndex = require('../swisseph/lagna/index');
        const horas = lIndex.Hora.calculate(dateObj, sunRise, sunSet, nextSunRise);
        
        res.json({
            date,
            horas
        });
    } catch (error) {
        console.error('Hora API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
