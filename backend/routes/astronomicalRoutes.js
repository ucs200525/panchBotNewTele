const express = require('express');
const router = express.Router();
const { events } = require('../swisseph');
const logger = require('../utils/logger');

/**
 * POST /api/astronomical/eclipses
 * Get upcoming solar and lunar eclipses
 */
router.post('/eclipses', async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);

        const eclipseData = events.getEclipses(dateObj);

        res.json({
            success: true,
            date,
            ...eclipseData
        });
    } catch (error) {
        logger.error({ message: 'Eclipse API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// JavaScript-based Julian Day calculation
function dateToJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (hour - 12) / 24;
}

// Calculate Moon longitude (VSOP87 simplified)
function getMoonLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    return (L0 % 360 + 360) % 360;
}

// Calculate Sun longitude (VSOP87 simplified)
function getSunLongitude(jd) {
    const n = jd - 2451545.0;
    const L = 280.460 + 0.9856474 * n;
    const g = 357.528 + 0.9856003 * n;
    const lambda = L + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
    return (lambda % 360 + 360) % 360;
}

// Lahiri Ayanamsa calculation
function getAyanamsa(jd) {
    const T = (jd - 2451545.0) / 36525;
    const ayanamsa = 23.85 + 0.013888889 * (jd - 2451545.0) / 365.25;
    return ayanamsa;
}

/**
 * POST /api/astronomical/details
 * Get comprehensive astronomical data for a given date
 */
router.post('/details', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng } = req.body;
        logger.info({ message: 'Astronomical details requested', date, time });

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = (time || '12:00').split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute, 0);

        const jd = dateToJulianDay(dateObj);
        const ayanamsa = getAyanamsa(jd);
        
        const sunTropical = getSunLongitude(jd);
        const moonTropical = getMoonLongitude(jd);
        
        const sunSidereal = (sunTropical - ayanamsa + 360) % 360;
        const moonSidereal = (moonTropical - ayanamsa + 360) % 360;
        
        const tithiAngle = (moonSidereal - sunSidereal + 360) % 360;
        const tithiNumber = Math.floor(tithiAngle / 12) + 1;
        const tithiProgress = (tithiAngle % 12) / 12 * 100;
        
        const nakshatraNum = Math.floor(moonSidereal / (360/27));
        const nakshatraProgress = (moonSidereal % (360/27)) / (360/27) * 100;
        
        const isPurnima = tithiNumber === 15 && tithiAngle >= 168 && tithiAngle < 180;
        const isAmavasya = tithiAngle >= 348 || tithiAngle < 12;
        const paksha = (tithiAngle < 180) ? 'Shukla' : 'Krishna';
        
        const NAKSHATRAS = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        
        const RASHIS = [
            'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
            'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
        ];
        
        res.json({
            success: true,
            date,
            time,
            julianDay: parseFloat(jd.toFixed(6)),
            ayanamsa: parseFloat(ayanamsa.toFixed(4)),
            sun: {
                tropical: parseFloat(sunTropical.toFixed(4)),
                sidereal: parseFloat(sunSidereal.toFixed(4)),
                rashi: Math.floor(sunSidereal / 30),
                rashiName: RASHIS[Math.floor(sunSidereal / 30)],
                degree: parseFloat((sunSidereal % 30).toFixed(4))
            },
            moon: {
                tropical: parseFloat(moonTropical.toFixed(4)),
                sidereal: parseFloat(moonSidereal.toFixed(4)),
                rashi: Math.floor(moonSidereal / 30),
                rashiName: RASHIS[Math.floor(moonSidereal / 30)],
                degree: parseFloat((moonSidereal % 30).toFixed(4)),
                nakshatra: nakshatraNum,
                nakshatraName: NAKSHATRAS[nakshatraNum],
                nakshatraProgress: parseFloat(nakshatraProgress.toFixed(2))
            },
            tithi: {
                number: tithiNumber,
                angle: parseFloat(tithiAngle.toFixed(4)),
                progress: parseFloat(tithiProgress.toFixed(2)),
                isPurnima,
                isAmavasya
            },
            paksha: paksha
        });
    } catch (error) {
        logger.error({ message: 'Astronomical API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
