const express = require('express');
const router = express.Router();
const { planetary, lagna, charts } = require('../swisseph');
const logger = require('../utils/logger');

/**
 * POST /api/charts/details
 * Calculate D1, D9, and D10 charts
 */
router.post('/details', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng } = req.body;
        logger.info({ message: 'Charts requested', date, time, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = (time || '12:00').split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute, 0);

        // 1. Get all planets positions
        const planets = planetary.getAllPlanetDetails(dateObj);

        // 2. Get Lagna at birth time
        const lagnaInfo = lagna.getLagnaAtTime(dateObj, lat, lng);
        const lagnaIdx = lagnaInfo.index;

        // 3. Calculate D1, D9, and D10
        const d1Planets = charts.calculateD1(planets);
        const d9Planets = charts.calculateD9(planets);
        const d10Planets = charts.calculateD10(planets);

        // 4. Get House layout for charts
        const d1Houses = charts.getHouses(lagnaIdx, d1Planets);

        // For D9, calculate navamsa lagna
        const d9LagnaIdx = Math.floor(((lagnaInfo.longitude % 30) * 9) / 30) + ((lagnaIdx % 3) * 3);
        const d9Houses = charts.getHouses(d9LagnaIdx % 12, d9Planets);

        // For D10, calculate dasamsa lagna
        const d10LagnaIdx = Math.floor(((lagnaInfo.longitude % 30) * 10) / 30);
        const d10Houses = charts.getHouses(d10LagnaIdx % 12, d10Planets);

        res.json({
            success: true,
            date,
            time,
            lagna: lagnaInfo,
            rasiChart: {
                houses: d1Houses,
                planets: d1Planets,
                lagnaRashi: lagnaInfo.rashi
            },
            navamsaChart: {
                houses: d9Houses,
                planets: d9Planets,
                lagnaRashi: d9LagnaIdx
            },
            dasamsaChart: {
                houses: d10Houses,
                planets: d10Planets,
                lagnaRashi: d10LagnaIdx
            }
        });
    } catch (error) {
        logger.error({ message: 'Charts API Error', error: error.message, stack: error.stack });
        console.error('Charts API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
