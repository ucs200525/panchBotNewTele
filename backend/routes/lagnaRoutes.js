const express = require('express');
const router = express.Router();
const { lagna, planetary } = require('../swisseph');
const logger = require('../utils/logger');

/**
 * POST /api/lagna/timings
 * Get all Lagna timings for the day
 */
router.post('/timings', async (req, res) => {
    try {
        const { date, lat, lng, timezone = 'Asia/Kolkata', sunrise } = req.body;
        logger.info({ message: 'Lagna timings requested', date, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }
        
        // Calculate daily lagna timings
        const lagnas = lagna.calculateDayLagnas(date, lat, lng, timezone, sunrise);
        
        res.json({
            success: true,
            date,
            lagnas
        });
    } catch (error) {
        logger.error({ message: 'Lagna Timings API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/lagna/current
 * Get current Lagna based on specific time
 */
router.post('/current', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng } = req.body;
        logger.info({ message: 'Current Lagna requested', date, time, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = (time || '12:00').split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute, 0);
        
        const currentLagna = lagna.getLagnaAtTime(dateObj, lat, lng);
        
        res.json({
            success: true,
            date,
            time,
            lagna: currentLagna
        });
    } catch (error) {
        logger.error({ message: 'Current Lagna API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/lagna/hora
 * Get Hora timings for the day
 */
router.post('/hora', async (req, res) => {
    try {
        const { date, lat, lng } = req.body;
        logger.info({ message: 'Hora requested', date, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }
        
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 6, 0, 0);
        
        // Get sunrise and sunset times
        const sunriseData = planetary.getSunrise(dateObj, lat, lng);
        const sunsetData = planetary.getSunset(dateObj, lat, lng);
        
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextSunriseData = planetary.getSunrise(nextDay, lat, lng);
        
        if (!sunriseData || !sunsetData || !nextSunriseData) {
            throw new Error('Could not calculate sunrise/sunset times');
        }
        
        // Calculate hora timings
        const horas = lagna.Hora.calculate(dateObj.getDay(), sunriseData.date, sunsetData.date, nextSunriseData.date);
        
        res.json({
            success: true,
            date,
            horas,
            sunrise: sunriseData.time,
            sunset: sunsetData.time
        });
    } catch (error) {
        logger.error({ message: 'Hora API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
