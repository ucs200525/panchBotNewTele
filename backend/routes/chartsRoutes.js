const express = require('express');
const router = express.Router();
const { planetary, lagna, charts } = require('../swisseph');
const logger = require('../utils/logger');
const { getUTCFromLocal } = require('../utils/dateUtils');
const config = require('../swisseph/core/config');
const { analyzeVargaChart, getPlanetaryDignity } = require('../utils/vargaAnalyzer');
const { VARGA_HOUSE_SIGNIFICANCE } = require('../utils/vargaHouseData');

// List of all 16 Shodashvarga divisions
const VARGAS = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];

const VARGA_NAMES = {
    1: 'Rasi (D1)',
    2: 'Hora (D2)',
    3: 'Drekkana (D3)',
    4: 'Chaturthamsa (D4)',
    7: 'Saptamsa (D7)',
    9: 'Navamsa (D9)',
    10: 'Dasamsa (D10)',
    12: 'Dwadasamsa (D12)',
    16: 'Shodasamsa (D16)',
    20: 'Vimsamsa (D20)',
    24: 'Chaturvimsamsa (D24)',
    27: 'Saptavimsamsa (D27)',
    30: 'Trimsamsa (D30)',
    40: 'Khavedamsa (D40)',
    45: 'Akshavedamsa (D45)',
    60: 'Shashtiamsa (D60)'
};

const VARGA_DESC = {
    1: 'Physical body, existence, and overall destiny.',
    2: 'Wealth, prosperity, and family resources.',
    3: 'Siblings, courage, prowess, and energy.',
    4: 'Fixed assets, property, home, and happiness.',
    7: 'Progeny (children), grandchildren, and legacy.',
    9: 'Spouse, partnerships, and inner strength/fruit of life.',
    10: 'Profession, career, fame, and public status.',
    12: 'Parents, ancestors, and lineage.',
    16: 'Vehicles, secondary comforts, and luxuries.',
    20: 'Spirituality, religious path, and meditation.',
    24: 'Education, knowledge, learning, and wisdom.',
    27: 'General strengths and weaknesses (Nakshatramsa).',
    30: 'Misfortunes, obstacles, and nature of character.',
    40: 'Auspicious and inauspicious events.',
    45: 'All general attributes and subtle qualities.',
    60: 'Past life karma and detailed destiny (Most important).'
};

/**
 * POST /api/charts/details
 * Calculate all 16 Divisional Charts + Analysis
 */
router.post('/details', async (req, res) => {
    try {
        let { date, time = '12:00', lat, lng, tzone = 'Asia/Kolkata' } = req.body;
        logger.info({ message: 'Full Shodashvarga requested', date, time, lat, lng });

        if (!date || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const utcDate = getUTCFromLocal(date, time, tzone);
        const planets = planetary.getAllPlanetDetails(utcDate);
        const lagnaInfo = lagna.getLagnaAtTime(utcDate, lat, lng);

        const vargaCharts = {};
        const planetStrengthReport = planets.map(p => ({
            name: p.name,
            vargottamaCount: 0,
            digBala: 0,
            vargas: []
        }));

        // Calculate all 16 charts
        VARGAS.forEach(v => {
            const vPlanets = charts.calculateVarga(planets, v);
            const vLagnaIdx = charts.getVargaRashi(lagnaInfo.longitude, v);
            const vHouses = charts.getHouses(vLagnaIdx, vPlanets);

            vPlanets.forEach(vp => {
                const report = planetStrengthReport.find(r => r.name === vp.name);
                if (report) {
                    report.vargas.push({ v, rashi: vp.rashi, rashiIdx: vp.rashiIndex });
                    // Check Vargottama (same rashi in D1 and this varga)
                    const d1Rashi = report.vargas[0]?.rashiIdx;
                    if (v > 1 && d1Rashi !== undefined && vp.rashiIndex === d1Rashi) {
                        report.vargottamaCount++;
                    }
                }
            });

            // Generate comprehensive house-by-house analysis
            const detailedAnalysis = analyzeVargaChart(v, vHouses);

            vargaCharts[`D${v}`] = {
                v,
                name: VARGA_NAMES[v],
                description: VARGA_DESC[v],
                lagnaRashi: config.RASHIS[vLagnaIdx],
                houses: vHouses,
                planets: vPlanets,
                // Add comprehensive analysis
                detailedAnalysis: detailedAnalysis,
                houseSignificance: VARGA_HOUSE_SIGNIFICANCE[v]?.houses || {}
            };
        });

        res.json({
            success: true,
            date,
            time,
            lagna: lagnaInfo,
            charts: vargaCharts,
            strengthReport: planetStrengthReport,
            vargaNames: VARGA_NAMES,
            vargaDescriptions: VARGA_DESC,
            planetDetails: planets
        });
    } catch (error) {
        logger.error({ message: 'Shodashvarga API Error', error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
