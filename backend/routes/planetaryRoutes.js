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
        let { date, time = '12:00', lat, lng, tzone } = req.body;
        logger.info({ message: 'Planetary positions requested', date, time, tzone });

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Handle AM/PM time if provided
        if (time.toLowerCase().includes('pm') || time.toLowerCase().includes('am')) {
            let [h, m] = time.replace(/[ap]m/i, '').trim().split(':').map(Number);
            if (time.toLowerCase().includes('pm') && h < 12) h += 12;
            if (time.toLowerCase().includes('am') && h === 12) h = 0;
            time = `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
        }

        const dateObj = getUTCFromLocal(date, time, tzone);
        const planets = planetary.getAllPlanetDetails(dateObj);

        // Calculate current ayanamsa for display
        const julianDay = require('../swisseph/core/julianDay');
        const config = require('../swisseph/core/config');
        const jd = julianDay.dateToJulianDay(dateObj);
        const ayanamsa = config.swisseph.swe_get_ayanamsa_ut(jd);

        const formatAyanamsa = (deg) => {
            const d = Math.floor(deg);
            const m = Math.floor((deg - d) * 60);
            const s = Math.floor(((deg - d) * 60 - m) * 60);
            return `${d}° ${m}' ${s}"`;
        };

        res.json({
            success: true,
            date,
            time,
            planets,
            ayanamsa: formatAyanamsa(ayanamsa),
            utcTimestamp: dateObj.toISOString()
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
        let { date, lat, lng, tzone } = req.body;
        logger.info({ message: 'Rise/Set times requested', date, lat, lng, tzone });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Date, latitude, and longitude are required' });
        }

        const dateObj = getUTCFromLocal(date, '06:00', tzone);

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
const { TithiCalculator, NakshatraCalculator, YogaCalculator, KaranaCalculator } = require('../swisseph/panchanga');
const tithiCalc = new TithiCalculator();
const nakCalc = new NakshatraCalculator();
const yogaCalc = new YogaCalculator();
const karanaCalc = new KaranaCalculator();

/**
 * POST /api/planetary/birth-details
 */
router.post('/birth-details', async (req, res) => {
    try {
        let { date, time = '12:00', lat, lng, tzone } = req.body;

        // Handle AM/PM
        if (time.toLowerCase().includes('pm') || time.toLowerCase().includes('am')) {
            let [h, m] = time.replace(/[ap]m/i, '').trim().split(':').map(Number);
            if (time.toLowerCase().includes('pm') && h < 12) h += 12;
            if (time.toLowerCase().includes('am') && h === 12) h = 0;
            time = `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
        }

        const dateObj = getUTCFromLocal(date, time, tzone);

        const tithi = tithiCalc.getTithiAtTime(dateObj);
        const nakshatra = nakCalc.getNakshatraAtTime(dateObj);
        const yoga = yogaCalc.getYogaAtTime(dateObj);
        const karana = karanaCalc.getKaranaAtTime(dateObj);

        // Add Hora calculation
        const { lagna } = require('../swisseph');
        const sunriseData = planetary.getSunrise(dateObj, lat, lng);
        const sunsetData = planetary.getSunset(dateObj, lat, lng);
        const nextDay = new Date(dateObj.getTime() + 24 * 3600 * 1000);
        const nextSunrise = planetary.getSunrise(nextDay, lat, lng);

        let hora = null;
        if (sunriseData && sunsetData && nextSunrise) {
            const [y, m, d] = date.split('-').map(Number);
            const weekday = new Date(y, m - 1, d).getDay();
            const allHoras = lagna.Hora.calculate(weekday, sunriseData.date, sunsetData.date, nextSunrise.date);

            // Find current hora
            hora = allHoras.find(h => {
                const s = new Date(h.start);
                const e = h.end ? new Date(h.end) : new Date(s.getTime() + 3600000);
                return dateObj >= s && dateObj < e;
            });
        }

        res.json({
            success: true,
            tithi,
            nakshatra,
            yoga,
            karana,
            hora
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/sade-sati', async (req, res) => {
    try {
        let { date, time = '12:00', lat, lng, tzone } = req.body;
        logger.info({ message: 'Sade Sati requested', date, time, tzone });

        if (!date) {
            return res.status(400).json({ error: 'Birth date is required' });
        }

        // Handle AM/PM time if provided
        if (time.toLowerCase().includes('pm') || time.toLowerCase().includes('am')) {
            let [h, m] = time.replace(/[ap]m/i, '').trim().split(':').map(Number);
            if (time.toLowerCase().includes('pm') && h < 12) h += 12;
            if (time.toLowerCase().includes('am') && h === 12) h = 0;
            time = `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
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
            let description = '';
            let impact = '';

            if (diff === 11) {
                status = 'sadeSati';
                phaseLabel = 'First Phase (Rising)';
                description = 'Saturn transits the 12th house from Moon. Financial pressure and mental stress may increase.';
                impact = 'Challenging';
            }
            else if (diff === 0) {
                status = 'sadeSati';
                phaseLabel = 'Middle Phase (Peak)';
                description = 'Saturn transits the natal Moon. Period of intense transformation, hard work, and health awareness.';
                impact = 'Intense';
            }
            else if (diff === 1) {
                status = 'sadeSati';
                phaseLabel = 'Final Phase (Setting)';
                description = 'Saturn transits the 2nd house from Moon. Focus on family, speech, and stabilizing wealth.';
                impact = 'Average';
            }
            else if (diff === 3) {
                status = 'dhaiya';
                phaseLabel = 'Fourth House Dhaiya';
                description = 'Saturn in the 4th house from Moon (Kantaka Shani). Affects domestic peace and career stability.';
                impact = 'Challenging';
            }
            else if (diff === 7) {
                status = 'dhaiya';
                phaseLabel = 'Eighth House Dhaiya';
                description = 'Saturn in the 8th house from Moon (Ashtama Shani). Significant life changes and spiritual growth.';
                impact = 'Intense';
            }

            if (status !== currentStatus || (status !== 'none' && phaseLabel !== activePeriod?.phase)) {
                // If we were in a period, close it
                if (activePeriod) {
                    activePeriod.end = scanDate.toISOString().split('T')[0];
                    sadeSatiPeriods.push(activePeriod);
                    activePeriod = null;
                }

                // If new status is not none, start new period
                if (status !== 'none') {
                    const nakNames = [
                        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
                        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
                        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
                        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
                        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
                    ];
                    const nakIdx = Math.floor(saturnPos.siderealLongitude / (360 / 27));

                    activePeriod = {
                        type: status,
                        phase: phaseLabel,
                        description: description,
                        impact: impact,
                        start: scanDate.toISOString().split('T')[0],
                        rashi: saturnPos.rashi,
                        nakshatra: nakNames[nakIdx % 27],
                        isRetrograde: saturnPos.isRetrograde
                    };
                }
                currentStatus = status;
            }
        }

        // 3. Push the last active period if it exists
        if (activePeriod) {
            const endDate = new Date(birthDate.getTime() + (maxYears * 365.25) * 24 * 60 * 60 * 1000);
            activePeriod.end = endDate.toISOString().split('T')[0];
            sadeSatiPeriods.push(activePeriod);
        }

        res.json({
            success: true,
            natalMoonRashi: natalMoonRashi,
            natalMoonSign: moonPos.rashi,
            chartDegree: moonPos.siderealLongitude,
            periods: sadeSatiPeriods
        });

    } catch (error) {
        logger.error({ message: 'Sade Sati API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
