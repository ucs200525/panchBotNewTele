/**
 * Lagna (Ascendant) Calculator
 * Professional-grade Lagna calculations with all 4 critical fixes
 */

const BaseCalculator = require('../core/baseCalculator');
const config = require('../core/config');

class LagnaCalculator extends BaseCalculator {
    /**
     * Get Lagna at specific time
     * @param {Date} date 
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} {name, index, longitude, symbol}
     */
    getLagnaAtTime(date, lat, lng) {
        const jd = this.getJD(date);
        const result = this.swisseph.swe_houses(jd, lat, lng, 'P');

        if (result.error) {
            throw new Error(`Lagna calculation error: ${result.error}`);
        }

        const tropicalAsc = result.ascendant || result.ascmc[0];
        const ayanamsa = this.getAyanamsa(jd);
        const siderealAsc = this.tropicalToSidereal(tropicalAsc, ayanamsa);
        const lagnaIndex = Math.floor(siderealAsc / 30) % 12;

        return {
            name: config.RASHIS[lagnaIndex],
            index: lagnaIndex,
            longitude: siderealAsc,
            symbol: config.RASHI_SYMBOLS[config.RASHIS[lagnaIndex]],
            tropicalLongitude: tropicalAsc,
            ayanamsa: ayanamsa
        };
    }

    /**
     * Calculate all Lagna timings for a day (sunrise to sunrise)
     * @param {Date} date - Local date
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {string} timezone - Timezone (e.g., 'Asia/Kolkata')
     * @param {string} sunriseStr - Sunrise time (HH:MM:SS)
     * @returns {Array} Array of Lagna periods with start/end times
     */
    calculateDayLagnas(date, lat, lng, timezone, sunriseStr) {
        console.log('  ⏳ Calculating Lagna timings...');

        const lagnas = [];

        try {
            // Clean time string (remove am/pm and trim)
            const cleanTime = sunriseStr.toLowerCase().replace(/[ap]m/, '').trim();
            const parts = cleanTime.split(':').map(Number);
            const hour = parts[0];
            const min = parts[1] || 0;
            const sec = parts[2] || 0;

            const sunriseDate = new Date(date);
            sunriseDate.setHours(hour, min, sec, 0);

            // Adjust for PM if original string had it (though sunrise usually isn't PM)
            if (sunriseStr.toLowerCase().includes('pm') && hour < 12) sunriseDate.setHours(hour + 12);
            if (sunriseStr.toLowerCase().includes('am') && hour === 12) sunriseDate.setHours(0);

            console.log(`  🌅 Sunrise: ${this.formatTime(sunriseDate, timezone)}`);

            const endTime = new Date(sunriseDate);
            endTime.setDate(endTime.getDate() + 1);

            // Get Lagna at sunrise
            let currentLagna = this.getLagnaAtTime(sunriseDate, lat, lng);
            console.log(`  📍 Sunrise Lagna: ${currentLagna.symbol} ${currentLagna.name} (${currentLagna.longitude.toFixed(2)}°)`);

            // BACKWARD SEARCH: Find when this Lagna actually started
            let lagnaStartTime = sunriseDate;
            const backStepSize = 2 * 60 * 1000;
            let backSearchTime = new Date(sunriseDate);

            for (let i = 0; i < 200; i++) {
                backSearchTime = new Date(backSearchTime.getTime() - backStepSize);
                const prevLagna = this.getLagnaAtTime(backSearchTime, lat, lng);

                if (prevLagna.index !== currentLagna.index) {
                    lagnaStartTime = backSearchTime;
                    console.log(`  ⏪ ${currentLagna.symbol} ${currentLagna.name} started at ${this.formatTime(lagnaStartTime, timezone)}`);
                    break;
                }
            }

            // FORWARD SEARCH: Find all Lagna transitions
            let currentTime = new Date(sunriseDate);
            const stepSize = 2 * 60 * 1000;
            let searchCount = 0;

            while (currentTime < endTime && searchCount < 1000) {
                const nextTime = new Date(currentTime.getTime() + stepSize);
                searchCount++;

                try {
                    const nextLagna = this.getLagnaAtTime(nextTime, lat, lng);

                    // Check for boundary crossing
                    let currentBoundary = (currentLagna.index + 1) * 30;
                    if (currentBoundary >= 360) currentBoundary = 360;

                    const crossed = (currentLagna.longitude < currentBoundary && nextLagna.longitude >= currentBoundary) ||
                        (currentLagna.index === 11 && nextLagna.index === 0);

                    if (crossed || nextLagna.index !== currentLagna.index) {
                        // Find exact transition using binary search
                        const transitionTime = this.binarySearch(
                            currentTime,
                            nextTime,
                            (t) => this.getLagnaAtTime(t, lat, lng).longitude,
                            currentBoundary
                        );

                        console.log(`  🔍 ${currentLagna.symbol} ${currentLagna.name} → ${nextLagna.symbol} ${nextLagna.name} at ${this.formatTime(transitionTime, timezone)}`);

                        lagnas.push({
                            name: currentLagna.name,
                            symbol: currentLagna.symbol,
                            index: currentLagna.index,
                            startTime: lagnaStartTime,
                            endTime: transitionTime
                        });

                        // Recompute Lagna at exact transition time
                        const transitionLagna = this.getLagnaAtTime(transitionTime, lat, lng);
                        currentLagna = transitionLagna;
                        lagnaStartTime = transitionTime;
                    }

                    currentTime = nextTime;
                } catch (error) {
                    console.error('  ⚠️  Error:', error.message);
                    currentTime = nextTime;
                }
            }

            console.log(`  ✅ Found ${lagnas.length} Lagna periods`);
            return lagnas;

        } catch (error) {
            console.error('  ❌ Fatal error:', error);
            return [];
        }
    }
}

module.exports = LagnaCalculator;
