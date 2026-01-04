const express = require('express');
const router = express.Router();
const { dasha, swisseph, julianDay, planetary } = require('../swisseph');

/**
 * POST /api/dasha/vimshottari
 */
router.post('/vimshottari', async (req, res) => {
    try {
        const { date, lat, lng } = req.body;
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);

        // 1. Get Moon longitude accurately for dasha calculation
        const swis = require('swisseph');
        const jd = julianDay.dateToJulianDay(dateObj);
        const ayanamsa = swis.swe_get_ayanamsa_ut(jd);
        const moonResult = swis.swe_calc_ut(jd, swis.SE_MOON, swis.SEFLG_SWIEPH);
        const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;

        const sequence = dasha.calculateVimshottari(moonSidereal, dateObj);

        res.json({
            date,
            moonLongitude: moonSidereal,
            dasha: sequence
        });
    } catch (error) {
        console.error('Dasha API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
