// const express = require('express');
// const router = express.Router();
// const { lagna } = require('../swisseph');

// /**
//  * POST /api/lagna/timings
//  * Get all Lagna timings for the day
//  */
// router.post('/timings', async (req, res) => {
//     try {
//         const { date, lat, lng, timezone = 'Asia/Kolkata', sunrise } = req.body;
        
//         // Calculate daily lagna timings
//         // Note: calculateDayLagnas requires sunrise string "HH:MM:SS"
//         const lagnas = lagna.calculateDayLagnas(date, lat, lng, timezone, sunrise);
        
//         res.json({
//             date,
//             lagnas
//         });
//     } catch (error) {
//         console.error('Lagna Timings API Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// /**
//  * POST /api/lagna/current
//  * Get current Lagna based on specific time
//  */
// router.post('/current', async (req, res) => {
//     try {
//         const { date, lat, lng } = req.body; // date includes time
//         const dateObj = new Date(date);
        
//         const currentLagna = lagna.getLagnaAtTime(dateObj, lat, lng);
        
//         res.json({
//             date,
//             lagna: currentLagna
//         });
//     } catch (error) {
//         console.error('Current Lagna API Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// /**
//  * POST /api/lagna/hora
//  * Get Hora timings for the day
//  */
// router.post('/hora', async (req, res) => {
//     try {
//         const { date, lat, lng } = req.body;
        
//         const { planetary } = require('../swisseph');
//         const planner = new planetary.PlanetaryCalculator();
//         const dateObj = new Date(date);
        
//         // Try Swiss Ephemeris first
//         const noon = new Date(dateObj);
//         noon.setHours(12, 0, 0, 0);
        
//         let sunRise = planner.getSunrise(noon, lat, lng);
//         let sunSet = planner.getSunset(noon, lat, lng);
        
//         const nextDay = new Date(noon);
//         nextDay.setDate(nextDay.getDate() + 1);
//         let nextSunRise = planner.getSunrise(nextDay, lat, lng);

//         // Fallback to sunrise-sunset.org API if Swiss Ephemeris fails
//         if (!sunRise || !sunSet || !nextSunRise) {
//             console.log('Swiss Ephemeris failed, using sunrise-sunset.org API as fallback');
//             const axios = require('axios');
            
//             try {
//                 const formattedDate = date.split('T')[0]; // Get YYYY-MM-DD
//                 const response = await axios.get(
//                     `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${formattedDate}`
//                 );
                
//                 const tomorrowDate = new Date(dateObj);
//                 tomorrowDate.setDate(tomorrowDate.getDate() + 1);
//                 const tomorrowFormatted = tomorrowDate.toISOString().split('T')[0];
                
//                 const tomorrowResponse = await axios.get(
//                     `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${tomorrowFormatted}`
//                 );
                
//                 if (response.data.status === 'OK' && tomorrowResponse.data.status === 'OK') {
//                     sunRise = new Date(response.data.results.sunrise);
//                     sunSet = new Date(response.data.results.sunset);
//                     nextSunRise = new Date(tomorrowResponse.data.results.sunrise);
//                 } else {
//                     throw new Error('Could not calculate sunrise/sunset for the given location and date');
//                 }
//             } catch (apiError) {
//                 console.error('Fallback API also failed:', apiError);
//                 throw new Error('Could not calculate sunrise/sunset for the given location and date');
//             }
//         }
        
//         const lIndex = require('../swisseph/lagna/index');
//         const horas = lIndex.Hora.calculate(dateObj, sunRise, sunSet, nextSunRise);
        
//         res.json({
//             date,
//             horas
//         });
//     } catch (error) {
//         console.error('Hora API Error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;
