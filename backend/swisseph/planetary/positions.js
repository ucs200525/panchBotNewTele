/**
 * Planetary Positions Calculator
 * Calculates longitude, latitude, speed, and retrograde status
 */

const BaseCalculator = require('../core/baseCalculator');
const { PLANETS, RASHIS } = require('../core/config');

class PlanetaryPositions extends BaseCalculator {
    /**
     * Get details for all major planets
     */
    getAllPlanetDetails(date) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);

        const bodies = [
            { id: PLANETS.SUN, name: 'Sun' },
            { id: PLANETS.MOON, name: 'Moon' },
            { id: PLANETS.MARS, name: 'Mars' },
            { id: PLANETS.MERCURY, name: 'Mercury' },
            { id: PLANETS.JUPITER, name: 'Jupiter' },
            { id: PLANETS.VENUS, name: 'Venus' },
            { id: PLANETS.SATURN, name: 'Saturn' },
            { id: PLANETS.RAHU, name: 'Rahu' },
            { id: PLANETS.KETU, name: 'Ketu' }
        ];

        return bodies.map(body => {
            const result = this.swisseph.swe_calc_ut(jd, body.id, this.swisseph.SEFLG_SWIEPH);

            // Handle Rahu/Ketu special sidereal logic if needed, but for now standard ayanamsa
            let siderealLong = (result.longitude - ayanamsa + 360) % 360;

            // Ketu is always 180 degrees from Rahu
            if (body.id === PLANETS.KETU) {
                // Swiss Ephemeris technically doesn't have Ketu ID, it's Rahu + 180
                // but some implementations might. If using Rahu + 180:
                // let rahuResult = this.swisseph.swe_calc_ut(jd, PLANETS.RAHU, this.swisseph.SEFLG_SWIEPH);
                // siderealLong = (rahuResult.longitude - ayanamsa + 180 + 360) % 360;
            }

            const rashiIndex = Math.floor(siderealLong / 30);
            const degrees = siderealLong % 30;

            return {
                name: body.name,
                longitude: result.longitude,
                siderealLongitude: siderealLong,
                latitude: result.latitude,
                distance: result.distance,
                speed: result.longitudeSpeed,
                isRetrograde: result.longitudeSpeed < 0,
                rashi: RASHIS[rashiIndex],
                rashiIndex: rashiIndex,
                degrees: degrees,
                formatted: this.formatDegrees(degrees)
            };
        });
    }

    /**
     * Get single planet position
     */
    getPlanetPosition(date, planetId) {
        const jd = this.getJD(date);
        const ayanamsa = this.getAyanamsa(jd);
        const result = this.swisseph.swe_calc_ut(jd, planetId, this.swisseph.SEFLG_SWIEPH);
        let siderealLong = (result.longitude - ayanamsa + 360) % 360;
        const rashiIndex = Math.floor(siderealLong / 30);
        const degrees = siderealLong % 30;

        return {
            longitude: result.longitude,
            siderealLongitude: siderealLong,
            rashiIndex: rashiIndex,
            rashi: RASHIS[rashiIndex],
            degrees: degrees,
            isRetrograde: result.longitudeSpeed < 0
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
