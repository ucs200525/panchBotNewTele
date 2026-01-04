const express = require('express');
const router = express.Router();
const { planetary, julianDay } = require('../swisseph');
const axios = require('axios');

// Get coordinates for a city
async function getCoordinates(city) {
    try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${process.env.OPENCAGE_API_KEY}`);
        if (response.data.results.length > 0) {
            return response.data.results[0].geometry;
        }
        throw new Error('City not found');
    } catch (error) {
        return { lat: 16.8135, lng: 81.5217 }; // Default to Tadepallegudem
    }
}

/**
 * POST /api/planetary/positions
 */
router.post('/positions', async (req, res) => {
    try {
        const { city, date } = req.body;
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);
        
        const planets = planetary.getAllPlanetDetails(dateObj);
        
        res.json({
            city,
            date,
            planets
        });
    } catch (error) {
        console.error('Planetary API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
