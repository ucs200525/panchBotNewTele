const express = require('express');
const router = express.Router();
const { planetary, lagna, charts } = require('../swisseph');
const logger = require('../utils/logger');
const { getUTCFromLocal } = require('../utils/dateUtils');
const config = require('../swisseph/core/config');

/**
 * Helper to calculate Navamsa Rashi Index
 */
function getNavamsaRashi(siderealLong) {
    const rashiIdx = Math.floor(siderealLong / 30);
    const degInRashi = siderealLong % 30;
    const navPoint = Math.floor(degInRashi / (30 / 9));

    let navRashiIdx;
    if ([0, 4, 8].includes(rashiIdx)) navRashiIdx = (0 + navPoint) % 12; // Fire: Mesha
    else if ([1, 5, 9].includes(rashiIdx)) navRashiIdx = (9 + navPoint) % 12; // Earth: Makara
    else if ([2, 6, 10].includes(rashiIdx)) navRashiIdx = (6 + navPoint) % 12; // Air: Tula
    else navRashiIdx = (3 + navPoint) % 12; // Water: Karka

    return navRashiIdx;
}

/**
 * Helper to calculate Dasamsa Rashi Index
 */
function getDasamsaRashi(siderealLong) {
    const rashiIdx = Math.floor(siderealLong / 30);
    const degInRashi = siderealLong % 30;
    const dasaPoint = Math.floor(degInRashi / 3); // 30/10 = 3 deg each

    let dasaRashiIdx;
    if (rashiIdx % 2 === 0) { // Odd Sign (1, 3, 5...) - indexed 0, 2, 4...
        dasaRashiIdx = (rashiIdx + dasaPoint) % 12;
    } else { // Even Sign (2, 4, 6...) - indexed 1, 3, 5...
        dasaRashiIdx = (rashiIdx + 8 + dasaPoint) % 12; // Start from 9th from it
    }
    return dasaRashiIdx;
}

/**
 * POST /api/charts/details
 * Calculate D1, D9, and D10 charts
 */
router.post('/details', async (req, res) => {
    try {
        let { date, time = '12:00', lat, lng, tzone = 'Asia/Kolkata' } = req.body;
        logger.info({ message: 'Charts requested', date, time, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        const utcDate = getUTCFromLocal(date, time, tzone);

        // 1. Get all planets positions
        const planets = planetary.getAllPlanetDetails(utcDate);

        // 2. Get Lagna at birth time
        const lagnaInfo = lagna.getLagnaAtTime(utcDate, lat, lng);
        const lagnaIdx = lagnaInfo.index;

        // 3. Calculate D1, D9, and D10
        const d1Planets = charts.calculateD1(planets);
        const d9Planets = charts.calculateD9(planets);
        const d10Planets = charts.calculateD10(planets);

        // 4. Get House layout for charts
        const d1Houses = charts.getHouses(lagnaIdx, d1Planets);

        // For D9, calculate navamsa lagna correctly
        const d9LagnaIdx = getNavamsaRashi(lagnaInfo.longitude);
        const d9Houses = charts.getHouses(d9LagnaIdx, d9Planets);

        // For D10, calculate dasamsa lagna correctly
        const d10LagnaIdx = getDasamsaRashi(lagnaInfo.longitude);
        const d10Houses = charts.getHouses(d10LagnaIdx, d10Planets);

        res.json({
            success: true,
            date,
            time,
            lagna: lagnaInfo,
            rasiChart: {
                houses: d1Houses,
                planets: d1Planets,
                lagnaRashi: lagnaInfo.name
            },
            navamsaChart: {
                houses: d9Houses,
                planets: d9Planets,
                lagnaRashi: config.RASHIS[d9LagnaIdx]
            },
            dasamsa: { // Matching frontend expects 'dasamsa' key usually
                houses: d10Houses,
                planets: d10Planets,
                lagnaRashi: config.RASHIS[d10LagnaIdx]
            },
            planetDetails: planets // Extra feature: provide detailed positions for tables
        });
    } catch (error) {
        logger.error({ message: 'Charts API Error', error: error.message, stack: error.stack });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
