/**
 * Planetary Positions Calculator
 * Calculates longitude, latitude, speed, retrograde status, dignity, and combustion
 */

const BaseCalculator = require('../core/baseCalculator');
const config = require('../core/config');

class PlanetaryPositions extends BaseCalculator {
    /**
     * Get details for all major planets with professional features
     */
    getAllPlanetDetails(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);

        const bodies = [
            { id: config.PLANETS.SUN, name: 'Sun' },
            { id: config.PLANETS.MOON, name: 'Moon' },
            { id: config.PLANETS.MARS, name: 'Mars' },
            { id: config.PLANETS.MERCURY, name: 'Mercury' },
            { id: config.PLANETS.JUPITER, name: 'Jupiter' },
            { id: config.PLANETS.VENUS, name: 'Venus' },
            { id: config.PLANETS.SATURN, name: 'Saturn' },
            { id: config.PLANETS.RAHU, name: 'Rahu' },
            { id: config.PLANETS.KETU, name: 'Ketu' }
        ];

        // First find Sun position for combustion checks
        const sunCalc = this.swisseph.swe_calc_ut(jd, config.PLANETS.SUN, this.swisseph.SEFLG_SWIEPH);
        const sunSidereal = (sunCalc.longitude - ayanamsa + 360) % 360;

        return bodies.map(body => {
            let result;
            let siderealLong;

            if (body.id === config.PLANETS.KETU) {
                // Ketu is 180 degrees from Rahu (both tropical and sidereal)
                const rahuResult = this.swisseph.swe_calc_ut(jd, config.PLANETS.RAHU, this.swisseph.SEFLG_SWIEPH);
                result = {
                    longitude: (rahuResult.longitude + 180) % 360,
                    latitude: rahuResult.latitude,
                    distance: rahuResult.distance,
                    longitudeSpeed: rahuResult.longitudeSpeed
                };
                siderealLong = (result.longitude - ayanamsa + 360) % 360;
            } else {
                result = this.swisseph.swe_calc_ut(jd, body.id, this.swisseph.SEFLG_SWIEPH);
                siderealLong = (result.longitude - ayanamsa + 360) % 360;
            }

            const rashiIndex = Math.floor(siderealLong / 30);
            const degrees = siderealLong % 30;

            const dignity = this.calculateDignity(body.name, rashiIndex);
            const isCombust = body.name !== 'Sun' && body.name !== 'Moon' && body.name !== 'Rahu' && body.name !== 'Ketu' 
                            ? this.checkCombustion(body.name, siderealLong, sunSidereal, result.longitudeSpeed < 0)
                            : false;

            return {
                name: body.name,
                longitude: result.longitude,
                siderealLongitude: siderealLong,
                latitude: result.latitude,
                distance: result.distance,
                speed: result.longitudeSpeed || 0,
                isRetrograde: (result.longitudeSpeed || 0) < 0 && body.name !== 'Rahu' && body.name !== 'Ketu' && body.name !== 'Sun' && body.name !== 'Moon',
                rashi: config.RASHIS[rashiIndex],
                rashiIndex: rashiIndex,
                degrees: degrees,
                formatted: this.formatDegrees(degrees),
                dignity: dignity,
                isCombust: isCombust
            };
        });
    }

    /**
     * Calculate Dignity (Exaltation, Own Sign, Debilitation)
     */
    calculateDignity(planet, rashiIdx) {
        const rules = {
            'Sun': { exalt: 0, debilit: 6, own: [4] }, // Mesha, Tula, Simha
            'Moon': { exalt: 1, debilit: 7, own: [3] }, // Vrishabha, Vrishchika, Karka
            'Mars': { exalt: 9, debilit: 3, own: [0, 7] }, // Makara, Karka, Mesha, Vrishchika
            'Mercury': { exalt: 5, debilit: 11, own: [2, 5] }, // Kanya, Meena, Mithuna, Kanya
            'Jupiter': { exalt: 3, debilit: 9, own: [8, 11] }, // Karka, Makara, Dhanu, Meena
            'Venus': { exalt: 11, debilit: 5, own: [1, 6] }, // Meena, Kanya, Vrishabha, Tula
            'Saturn': { exalt: 6, debilit: 0, own: [9, 10] }, // Tula, Mesha, Makara, Kumbha
            'Rahu': { exalt: 2, debilit: 8, own: [] }, // Mithuna, Dhanu
            'Ketu': { exalt: 8, debilit: 2, own: [] } // Dhanu, Mithuna
        };

        const rule = rules[planet];
        if (!rule) return 'Neutral';

        if (rashiIdx === rule.exalt) return 'Exalted';
        if (rashiIdx === rule.debilit) return 'Debilitated';
        if (rule.own.includes(rashiIdx)) return 'Own Sign';

        return 'Neutral';
    }

    /**
     * Check if planet is combust (too close to Sun)
     */
    checkCombustion(planet, planetLong, sunLong, isRetro) {
        let diff = Math.abs(planetLong - sunLong);
        if (diff > 180) diff = 360 - diff;

        const limits = {
            'Mars': 17,
            'Mercury': isRetro ? 12 : 14,
            'Jupiter': 11,
            'Venus': isRetro ? 8 : 10,
            'Saturn': 15
        };

        return diff <= (limits[planet] || 0);
    }

    /**
     * Get single planet position
     */
    getPlanetPosition(date, planetId) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        let result;
        let siderealLong;

        if (planetId === 11) { // KETU internal ID
            result = this.swisseph.swe_calc_ut(jd, config.PLANETS.RAHU, this.swisseph.SEFLG_SWIEPH);
            siderealLong = (result.longitude - ayanamsa + 180 + 360) % 360;
        } else {
            result = this.swisseph.swe_calc_ut(jd, planetId, this.swisseph.SEFLG_SWIEPH);
            siderealLong = (result.longitude - ayanamsa + 360) % 360;
        }

        const rashiIndex = Math.floor(siderealLong / 30);
        const degrees = siderealLong % 30;

        return {
            longitude: result.longitude,
            siderealLongitude: siderealLong,
            rashiIndex: rashiIndex,
            rashi: config.RASHIS[rashiIndex],
            degrees: degrees,
            isRetrograde: (result.longitudeSpeed || 0) < 0
        };
    }

    /**
     * Format degrees into Deg° Min' Sec"
     */
    formatDegrees(deg) {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        const s = Math.floor(((deg - d) * 60 - m) * 60);
        return `${d}° ${m}' ${s}"`;
    }
}

module.exports = PlanetaryPositions;
