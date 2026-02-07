const express = require('express');
const router = express.Router();
const { planetary } = require('../swisseph');
const { getUTCFromLocal } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * POST /api/planetary/positions
 * Get all planetary positions for a given date/time
 */
router.post('/positions', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng, tzone } = req.body;
        logger.info({ message: 'Planetary positions requested', date, time, tzone });

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const dateObj = getUTCFromLocal(date, time, tzone);
        const planets = planetary.getAllPlanetDetails(dateObj);

        res.json({
            success: true,
            date,
            time,
            planets
        });
    } catch (error) {
        logger.error({ message: 'Planetary API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/planetary/rise-set
 * Get rise and set times for sun and moon
 */
router.post('/rise-set', async (req, res) => {
    try {
        const { date, lat, lng, tzone } = req.body;
        logger.info({ message: 'Rise/Set times requested', date, lat, lng, tzone });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        const dateObj = getUTCFromLocal(date, '06:00', tzone); // Midday or early morning for rise/set scan

        const sunrise = planetary.getSunrise(dateObj, lat, lng);
        const sunset = planetary.getSunset(dateObj, lat, lng);
        const moonrise = planetary.getMoonrise(dateObj, lat, lng);
        const moonset = planetary.getMoonset(dateObj, lat, lng);

        res.json({
            success: true,
            date,
            sunrise: sunrise ? sunrise.time : null,
            sunset: sunset ? sunset.time : null,
            moonrise: moonrise ? moonrise.time : null,
            moonset: moonset ? moonset.time : null
        });
    } catch (error) {
        logger.error({ message: 'Rise/Set API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/planetary/sade-sati
 * Calculate Sade Sati periods for a lifetime
 */
router.post('/sade-sati', async (req, res) => {
    try {
        const { date, time = '12:00', lat, lng, tzone } = req.body;
        logger.info({ message: 'Sade Sati requested', date, time, tzone });

        if (!date) {
            return res.status(400).json({ error: 'Birth date is required' });
        }

        const birthDate = getUTCFromLocal(date, time, tzone);

        // 1. Get Natal Moon position
        const moonPos = planetary.getPlanetPosition(birthDate, 1); // 1 = Moon
        const natalMoonRashi = moonPos.rashiIndex;

        // 2. Scan Saturn positions for 100 years
        const sadeSatiPeriods = [];
        let currentStatus = 'none'; // none, entering, peak, leaving, dhaiya4, dhaiya8
        let activePeriod = null;

        const maxYears = 100;
        const scanStepDays = 15; // Scan every 15 days for accuracy

        for (let d = 0; d < maxYears * 365.25; d += scanStepDays) {
            const scanDate = new Date(birthDate.getTime() + d * 24 * 60 * 60 * 1000);
            const saturnPos = planetary.getPlanetPosition(scanDate, 6); // 6 = Saturn
            const saturnRashi = saturnPos.rashiIndex;

            // Difference in signs from Natal Moon (0 = Same sign, -1 = 12th house, 1 = 2nd house)
            const diff = (saturnRashi - natalMoonRashi + 12) % 12;

            let status = 'none';
            let phaseLabel = '';

            if (diff === 11) { status = 'sadeSati'; phaseLabel = 'First Phase (Entering)'; }
            else if (diff === 0) { status = 'sadeSati'; phaseLabel = 'Peak Phase (Core)'; }
            else if (diff === 1) { status = 'sadeSati'; phaseLabel = 'Final Phase (Leaving)'; }
            else if (diff === 3) { status = 'dhaiya'; phaseLabel = 'Fourth House Dhaiya'; }
            else if (diff === 7) { status = 'dhaiya'; phaseLabel = 'Eighth House Dhaiya'; }

            if (status !== currentStatus || (status !== 'none' && phaseLabel !== activePeriod?.phase)) {
                // If we were in a period, close it
                if (activePeriod) {
                    activePeriod.end = scanDate.toISOString().split('T')[0];
                    sadeSatiPeriods.push(activePeriod);
                    activePeriod = null;
                }

                // If new status is not none, start new period
                if (status !== 'none') {
                    activePeriod = {
                        type: status,
                        phase: phaseLabel,
                        start: scanDate.toISOString().split('T')[0],
                        rashi: saturnPos.rashi
                    };
                }
                currentStatus = status;
            }
        }

        res.json({
            success: true,
            natalMoonRashi: natalMoonRashi,
            natalMoonSign: moonPos.rashi,
            periods: sadeSatiPeriods
        });

    } catch (error) {
        logger.error({ message: 'Sade Sati API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
