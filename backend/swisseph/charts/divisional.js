/**
 * Advanced Divisional Chart Calculator (Shodashvarga)
 */

const BaseCalculator = require('../core/baseCalculator');
const config = require('../core/config');

class DivisionalCalculator extends BaseCalculator {
    /**
     * Calculate any divisional chart based on divisor (D) and specific rules
     */
    /**
     * Get Divisional Rashi index for a single longitude
     */
    getVargaRashi(long, vargaNumber) {
        const rashiIdx = Math.floor(long / 30);
        const degInRashi = long % 30;
        let vargaRashiIdx = 0;

        switch (vargaNumber) {
            case 1: // Rasi
                vargaRashiIdx = rashiIdx;
                break;
            case 2: // Hora (15 deg)
                const isOddHouse = rashiIdx % 2 === 0;
                if (isOddHouse) vargaRashiIdx = degInRashi < 15 ? 4 : 3; // Leo (Sun) : Cancer (Moon)
                else vargaRashiIdx = degInRashi < 15 ? 3 : 4; // Cancer (Moon) : Leo (Sun)
                break;
            case 3: // Drekkana (10 deg)
                const part3 = Math.floor(degInRashi / 10);
                vargaRashiIdx = (rashiIdx + (part3 * 4)) % 12; // 1st, 5th, 9th from it
                break;
            case 4: // Chaturthamsa (7.5 deg)
                const part4 = Math.floor(degInRashi / 7.5);
                vargaRashiIdx = (rashiIdx + (part4 * 3)) % 12; // 1,4,7,10 from it
                break;
            case 7: // Saptamsa (4.28 deg)
                const part7 = Math.floor(degInRashi / (30 / 7));
                if (rashiIdx % 2 === 0) vargaRashiIdx = (rashiIdx + part7) % 12; // Start from same
                else vargaRashiIdx = (rashiIdx + 6 + part7) % 12; // Start from 7th (facing)
                break;
            case 9: // Navamsa (3.33 deg)
                const part9 = Math.floor(degInRashi / (30 / 9));
                if ([0, 4, 8].includes(rashiIdx)) vargaRashiIdx = (0 + part9) % 12;
                else if ([1, 5, 9].includes(rashiIdx)) vargaRashiIdx = (9 + part9) % 12;
                else if ([2, 6, 10].includes(rashiIdx)) vargaRashiIdx = (6 + part9) % 12;
                else vargaRashiIdx = (3 + part9) % 12;
                break;
            case 10: // Dasamsa (3 deg)
                const part10 = Math.floor(degInRashi / 3);
                if (rashiIdx % 2 === 0) vargaRashiIdx = (rashiIdx + part10) % 12;
                else vargaRashiIdx = (rashiIdx + 8 + part10) % 12;
                break;
            case 12: // Dwadasamsa (2.5 deg)
                const part12 = Math.floor(degInRashi / 2.5);
                vargaRashiIdx = (rashiIdx + part12) % 12;
                break;
            case 16: // Shodasamsa (1.875 deg)
                const part16 = Math.floor(degInRashi / 1.875);
                if ([0, 4, 8].includes(rashiIdx % 4)) vargaRashiIdx = (0 + part16) % 12; // Aries
                else if ([1, 5, 9].includes(rashiIdx % 4)) vargaRashiIdx = (4 + part16) % 12; // Leo
                else if ([2, 6, 10].includes(rashiIdx % 4)) vargaRashiIdx = (8 + part16) % 12; // Sag
                else vargaRashiIdx = (0 + part16) % 12; // Catch all
                break;
            case 20: // Vimsamsa (1.5 deg)
                const part20 = Math.floor(degInRashi / 1.5);
                if ([0, 3, 6, 9].includes(rashiIdx % 12)) vargaRashiIdx = (0 + part20) % 12; // Aries
                else if ([1, 4, 7, 10].includes(rashiIdx % 12)) vargaRashiIdx = (4 + part20) % 12; // Leo
                else vargaRashiIdx = (8 + part20) % 12; // Sag
                break;
            case 24: // Chaturvimsamsa (1.25 deg)
                const part24 = Math.floor(degInRashi / 1.25);
                if (rashiIdx % 2 === 0) vargaRashiIdx = (4 + part24) % 12; // Leo cycle
                else vargaRashiIdx = (8 + part24) % 12; // Sag cycle
                break;
            case 27: // Saptavimsamsa (1.11 deg)
                const part27 = Math.floor(degInRashi / (30 / 27));
                if ([0, 4, 8].includes(rashiIdx % 4)) vargaRashiIdx = (0 + part27) % 12;
                else if ([1, 5, 9].includes(rashiIdx % 4)) vargaRashiIdx = (3 + part27) % 12;
                else if ([2, 6, 10].includes(rashiIdx % 4)) vargaRashiIdx = (6 + part27) % 12;
                else vargaRashiIdx = (9 + part27) % 12;
                break;
            case 30: // Trimsamsa (1 deg)
                const tPart = Math.floor(degInRashi);
                if (rashiIdx % 2 === 0) { // Odd Sign
                    if (tPart < 5) vargaRashiIdx = 0; // Aries (Mars)
                    else if (tPart < 10) vargaRashiIdx = 10; // Kumbha (Sat)
                    else if (tPart < 18) vargaRashiIdx = 8; // Sag (Jup)
                    else if (tPart < 25) vargaRashiIdx = 2; // Mithuna (Mer)
                    else vargaRashiIdx = 1; // Vrishabha (Ven)
                } else { // Even Sign
                    if (tPart < 5) vargaRashiIdx = 1; // Vrishabha (Ven)
                    else if (tPart < 12) vargaRashiIdx = 2; // Mithuna (Mer)
                    else if (tPart < 20) vargaRashiIdx = 8; // Sag (Jup)
                    else if (tPart < 25) vargaRashiIdx = 10; // Kumbha (Sat)
                    else vargaRashiIdx = 0; // Aries (Mars)
                }
                break;
            case 40: // Khavedamsa (0.75 deg)
                const part40 = Math.floor(degInRashi / 0.75);
                if (rashiIdx % 2 === 0) vargaRashiIdx = (0 + part40) % 12; // Mesha
                else vargaRashiIdx = (6 + part40) % 12; // Tula
                break;
            case 45: // Akshavedamsa (0.66 deg)
                const part45 = Math.floor(degInRashi / (30 / 45));
                if ([0, 3, 6, 9].includes(rashiIdx % 12)) vargaRashiIdx = (0 + part45) % 12; // Mesha
                else if ([1, 4, 7, 10].includes(rashiIdx % 12)) vargaRashiIdx = (4 + part45) % 12; // Simha
                else vargaRashiIdx = (8 + part45) % 12; // Dhanu
                break;
            case 60: // Shashtiamsa (0.5 deg)
                const part60 = Math.floor(degInRashi / 0.5);
                vargaRashiIdx = (rashiIdx + part60) % 12;
                break;
            default:
                vargaRashiIdx = rashiIdx;
        }
        return vargaRashiIdx;
    }

    calculateVarga(planets, vargaNumber) {
        return planets.map(p => {
            const long = p.siderealLongitude !== undefined ? p.siderealLongitude : p.longitude;
            const vargaRashiIdx = this.getVargaRashi(long, vargaNumber);

            return {
                name: p.name,
                longitude: long,
                rashiIndex: vargaRashiIdx,
                rashi: config.RASHIS[vargaRashiIdx]
            };
        });
    }

    getHouses(lagnaRashiIndex, planetPositions) {
        if (lagnaRashiIndex === undefined || isNaN(lagnaRashiIndex)) {
            lagnaRashiIndex = 0;
        }

        const houses = Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            rashiIndex: (lagnaRashiIndex + i) % 12,
            rashi: config.RASHIS[(lagnaRashiIndex + i) % 12],
            planets: []
        }));

        planetPositions.forEach(p => {
            const hIdx = (p.rashiIndex - lagnaRashiIndex + 12) % 12;
            // Store the full planet object with name and rashi
            houses[hIdx].planets.push({
                name: p.name,
                rashi: p.rashi,
                rashiIndex: p.rashiIndex,
                longitude: p.longitude
            });
        });

        return houses;
    }
}

module.exports = DivisionalCalculator;
