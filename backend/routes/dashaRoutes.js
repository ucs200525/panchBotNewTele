const express = require('express');
const router = express.Router();
const { dasha, swisseph, julianDay, planetary } = require('../swisseph');
const logger = require('../utils/logger');

/**
 * POST /api/dasha/vimshottari
 */
router.post('/vimshottari', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng } = req.body;
        logger.info({ message: 'Vimshottari Dasha requested', date, time, lat, lng });

        if (!date || !lat || !lng) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        // Parse date and time
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute, 0);

        // Get Moon longitude for dasha calculation
        const swis = require('swisseph');
        const jd = julianDay.dateToJulianDay(dateObj);
        const ayanamsa = swis.swe_get_ayanamsa_ut(jd);
        const moonResult = swis.swe_calc_ut(jd, swis.SE_MOON, swis.SEFLG_SWIEPH);
        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;

        // Calculate Vimshottari Dasha
        const dashaData = dasha.calculateVimshottari(moonSidereal, dateObj);

        res.json({
            success: true,
            mahadashas: dashaData || [],
            moonLongitude: moonSidereal
        });
    } catch (error) {
        logger.error({ message: 'Dasha API Error', error: error.message, stack: error.stack });
        console.error('Dasha API Error:', error);
        res.status(500).json({ 
            error: 'Failed to calculate Dasha', 
            details: error.message 
        });
    }
});

module.exports = router;
