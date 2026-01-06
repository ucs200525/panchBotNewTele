// const express = require('express');
// const router = express.Router();
// const { planetary, lagna, charts } = require('../swisseph');

// /**
//  * POST /api/charts/details
//  */
// router.post('/details', async (req, res) => {
//     try {
//         const { date, lat, lng } = req.body;
//         const [year, month, day] = date.split('-').map(Number);
//         // Use noon for general planetary positions or birth time if provided
//         const dateObj = new Date(year, month - 1, day, 12, 0, 0);

//         // 1. Get all planets positions
//         const planets = planetary.getAllPlanetDetails(dateObj);

//         // 2. Get Lagna at birth time (noon here, could be dynamic)
//         const lagnaInfo = lagna.getLagnaAtTime(dateObj, lat, lng);
//         const lagnaIdx = lagnaInfo.index; // Correct property is "index"

//         // 3. Calculate D1 and D9
//         const d1Planets = charts.calculateD1(planets);
//         const d9Planets = charts.calculateD9(planets);

//         // 4. Get House layout for D1
//         const d1Houses = charts.getHouses(lagnaIdx, d1Planets);
//         const d9Houses = charts.getHouses(d9Planets.find(p => p.name === 'Lagna')?.rashiIndex || lagnaIdx, d9Planets); // Simplified D9 Lagna

//         res.json({
//             date,
//             lagna: lagnaInfo,
//             rasiChart: { houses: d1Houses, planets: d1Planets },
//             navamsaChart: { houses: d9Houses, planets: d9Planets }
//         });
//     } catch (error) {
//         console.error('Charts API Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;
