const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { planetary } = require('../swisseph');
const { getUTCFromLocal } = require('../utils/dateUtils');

/**
 * Vimshottari Dasha calculation (Professional Grade)
 * Uses standard rules: 
 * - 120 year cycle
 * - Each Nakshatra spans 13° 20' (800 minutes)
 * - Dasha Balance based on Moon's position in starting Nakshatra
 */
function calculateVimshottari(moonLongitude, birthDate) {
    const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    
    // Each nakshatra is 13.33333333 degrees (360/27)
    const NACH_SPAN = 360 / 27;
    const nakshatraIndex = Math.floor(moonLongitude / NACH_SPAN);
    const startDashaIdx = nakshatraIndex % 9;
    
    // Position within the nakshatra (0.0 to 1.0)
    const positionInNakshatra = (moonLongitude % NACH_SPAN) / NACH_SPAN;
    
    // Total years for the first dasha lord
    const totalYears = DASHA_YEARS[startDashaIdx];
    
    // Years elapsed and remaining
    const elapsedYears = totalYears * positionInNakshatra;
    const remainingYears = totalYears - elapsedYears;
    
    const mahadashas = [];
    let currentDate = new Date(birthDate);
    
    // Helper to calculate sub-dashas (Antardashas) using standard MD * AD / 120 rule
    const calculateAntardashas = (majorLordIdx, majorStart, majorDurationYears) => {
        const subs = [];
        let subStart = new Date(majorStart);
        const majorYears = DASHA_YEARS[majorLordIdx];
        
        for (let i = 0; i < 9; i++) {
            const subLordIdx = (majorLordIdx + i) % 9;
            const subYears = (majorYears * DASHA_YEARS[subLordIdx]) / 120;
            const subEndDate = new Date(subStart.getTime() + subYears * 365.24219 * 24 * 60 * 60 * 1000);
            
            subs.push({
                lord: DASHA_LORDS[subLordIdx],
                start: subStart.toISOString().split('T')[0],
                end: subEndDate.toISOString().split('T')[0],
                years: parseFloat(subYears.toFixed(3))
            });
            subStart = subEndDate;
        }
        return subs;
    };

    // --- First Mahadasha (Partial) ---
    const firstEndDate = new Date(currentDate.getTime() + remainingYears * 365.24219 * 24 * 60 * 60 * 1000);
    
    // Calculate all antardashas for the full cycle and filter for the remaining ones
    const fullCycleStart = new Date(currentDate.getTime() - elapsedYears * 365.24219 * 24 * 60 * 60 * 1000);
    const allFirstSubs = calculateAntardashas(startDashaIdx, fullCycleStart, totalYears);
    
    // Only include sub-periods that end AFTER birthDate
    const validFirstSubs = allFirstSubs.filter(sub => new Date(sub.end) > birthDate);
    if (validFirstSubs.length > 0 && new Date(validFirstSubs[0].start) < birthDate) {
        validFirstSubs[0].start = birthDate.toISOString().split('T')[0];
    }

    mahadashas.push({
        lord: DASHA_LORDS[startDashaIdx],
        start: birthDate.toISOString().split('T')[0],
        end: firstEndDate.toISOString().split('T')[0],
        years: parseFloat(remainingYears.toFixed(3)),
        elapsed: parseFloat(elapsedYears.toFixed(3)),
        antardashas: validFirstSubs
    });

    currentDate = firstEndDate;
    
    // --- Remaining 8 Mahadashas ---
    for (let i = 1; i < 9; i++) {
        const idx = (startDashaIdx + i) % 9;
        const years = DASHA_YEARS[idx];
        const endDate = new Date(currentDate.getTime() + years * 365.24219 * 24 * 60 * 60 * 1000);
        
        mahadashas.push({
            lord: DASHA_LORDS[idx],
            start: currentDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            years: years,
            antardashas: calculateAntardashas(idx, currentDate, years)
        });
        currentDate = endDate;
    }
    
    return mahadashas;
}

/**
 * POST /api/dasha/vimshottari
 */
router.post('/vimshottari', async (req, res) => {
    try {
        let { date, time = '12:00', lat, lng, tzone } = req.body;
        logger.info({ message: 'Vimshottari Dasha requested (Professional)', date, time, lat, lng, tzone });

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

        // Professional Planet Position lookup
        const moonPos = planetary.getPlanetPosition(dateObj, 1); // 1 = Moon
        const moonSidereal = moonPos.siderealLongitude;

        const dashaData = calculateVimshottari(moonSidereal, dateObj);

        const nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        
        const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 
                           'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
        
        const nakshatraIndex = Math.floor(moonSidereal / (360/27));
        const nakshatraSpan = 360/27; // 13.333...°
        const positionInNakshatra = (moonSidereal % nakshatraSpan) / nakshatraSpan;
        const pada = Math.floor(positionInNakshatra * 4) + 1; // 1-4
        const moonRashi = Math.floor(moonSidereal / 30);

        // Calculate dasha balance at birth
        const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
        const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
        const startDashaIdx = nakshatraIndex % 9;
        const totalYears = dashaYears[startDashaIdx];
        const elapsedYears = totalYears * positionInNakshatra;
        const balanceAtBirth = totalYears - elapsedYears;

        res.json({
            success: true,
            mahadashas: dashaData || [],
            birthDetails: {
                moonLongitude: parseFloat(moonSidereal.toFixed(4)),
                moonRashi: rashiNames[moonRashi],
                birthStar: nakshatraNames[nakshatraIndex % 27],
                pada: pada,
                dashaLord: dashaLords[startDashaIdx],
                balanceOfDasha: {
                    years: Math.floor(balanceAtBirth),
                    months: Math.floor((balanceAtBirth % 1) * 12),
                    days: Math.floor(((balanceAtBirth % 1) * 12 % 1) * 30)
                }
            }
        });
    } catch (error) {
        logger.error({ message: 'Dasha API Error', error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Failed to calculate Dasha', 
            details: error.message 
        });
    }
});

module.exports = router;
