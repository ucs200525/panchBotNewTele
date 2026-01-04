const express = require('express');
const router = express.Router();
const { events } = require('../swisseph');

/**
 * POST /api/astronomical/eclipses
 */
router.post('/eclipses', async (req, res) => {
    try {
        const { date } = req.body;
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);
        
        const eclipseData = events.getEclipses(dateObj);
        
        res.json({
            date,
            ...eclipseData
        });
    } catch (error) {
        console.error('Astronomical API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
