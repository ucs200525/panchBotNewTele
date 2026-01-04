/**
 * Calculate Lagna (Ascendant) timings using Swiss Ephemeris
 * ALL 4 CRITICAL FIXES APPLIED
 */

const swisseph = require('swisseph');

swisseph.swe_set_ephe_path('/usr/share/libswe/ephe');
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const RASHI_NAMES = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

function dateToJulianDay(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hourUT = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    return swisseph.swe_julday(year, month, day, hourUT, swisseph.SE_GREG_CAL);
}

function getLagnaAtTime(date, lat, lng) {
    const julday = dateToJulianDay(date);
    const result = swisseph.swe_houses(julday, lat, lng, 'P');
    
    if (result.error) {
        throw new Error(`Swiss Ephemeris error: ${result.error}`);
    }
    
    const tropicalAsc = result.ascendant || result.ascmc[0];
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(julday);
    let siderealAsc = tropicalAsc - ayanamsa;
    
    while (siderealAsc < 0) siderealAsc += 360;
    while (siderealAsc >= 360) siderealAsc -= 360;
    
    const lagnaIndex = Math.floor(siderealAsc / 30) % 12;
    
    return {
        name: RASHI_NAMES[lagnaIndex],
        index: lagnaIndex,
        longitude: siderealAsc,
        tropicalLongitude: tropicalAsc,
        ayanamsa: ayanamsa
    };
}

function binarySearchLagnaChange(startTime, endTime, lat, lng, currentBoundary, maxIterations = 20) {
    const threshold = 10 * 1000; // 10 seconds
    let iterations = 0;
    
    while ((endTime - startTime) > threshold && iterations < maxIterations) {
        const midTime = new Date((startTime.getTime() + endTime.getTime()) / 2);
        iterations++;
        
        try {
            const lagna = getLagnaAtTime(midTime, lat, lng);
            if (lagna.longitude >= currentBoundary) {
                endTime = midTime;
            } else {
                startTime = midTime;
            }
        } catch (error) {
            console.error('Binary search error:', error);
            break;
        }
    }
    
    return { time: endTime, iterations };
}

function calculateDayLagnas(date, lat, lng, timezone, sunriseStr) {
    console.log('  ⏳ Calculating Lagna timings...');
    
    const lagnas = [];
    
    try {
        // Use provided sunrise time
        let sunriseDate;
        if (sunriseStr) {
            const [hour, min, sec = 0] = sunriseStr.split(':').map(Number);
            sunriseDate = new Date(date);
            sunriseDate.setHours(hour, min, sec || 0, 0);
            console.log(`  🌅 Using sunrise: ${sunriseDate.toLocaleString('en-IN', { timeZone: timezone })}`);
        } else {
            sunriseDate = new Date(date);
            sunriseDate.setHours(6, 0, 0, 0);
        }
        
        const endTime = new Date(sunriseDate);
        endTime.setDate(endTime.getDate() + 1);
        
        // Get Lagna at sunrise
        let currentLagna = getLagnaAtTime(sunriseDate, lat, lng);
        console.log(`  📍 Sunrise Lagna: ${currentLagna.name} at ${currentLagna.longitude.toFixed(2)}°`);
        
        // BACKWARD SEARCH: Find when this Lagna actually started (previous day)
        let lagnaStartTime = sunriseDate;
        const backStepSize = 2 * 60 * 1000; // 2 minutes
        let backSearchTime = new Date(sunriseDate);
        
        for (let i = 0; i < 200; i++) { // Max ~6.6 hours back
            backSearchTime = new Date(backSearchTime.getTime() - backStepSize);
            const prevLagna = getLagnaAtTime(backSearchTime, lat, lng);
            
            if (prevLagna.index !== currentLagna.index) {
                // Found when previous Lagna ended = when current Lagna started
                lagnaStartTime = backSearchTime;
                console.log(`  ⏪ ${currentLagna.name} started at ${lagnaStartTime.toLocaleTimeString('en-IN', { timeZone: timezone })}`);
                break;
            }
        }
        
        let currentTime = new Date(sunriseDate);
        const stepSize = 2 * 60 * 1000; // 2 minutes
        let searchCount = 0;
        
        while (currentTime < endTime && searchCount < 1000) {
            const nextTime = new Date(currentTime.getTime() + stepSize);
            searchCount++;
            
            try {
                const nextLagna = getLagnaAtTime(nextTime, lat, lng);
                
                let currentBoundary = (currentLagna.index + 1) * 30;
                if (currentBoundary >= 360) currentBoundary = 360;
                
                const crossed = (currentLagna.longitude < currentBoundary && nextLagna.longitude >= currentBoundary) ||
                               (currentLagna.index === 11 && nextLagna.index === 0);
                
                if (crossed || nextLagna.index !== currentLagna.index) {
                    const result = binarySearchLagnaChange(currentTime, nextTime, lat, lng, currentBoundary);
                    
                    console.log(`  🔍 Lagna ${currentLagna.name} → ${nextLagna.name} at ${result.time.toLocaleTimeString('en-IN', { timeZone: timezone })}`);
                    
                    lagnas.push({
                        name: currentLagna.name,
                        index: currentLagna.index,
                        startTime: lagnaStartTime,
                        endTime: result.time
                    });
                    
                    const transitionLagna = getLagnaAtTime(result.time, lat, lng);
                    currentLagna = transitionLagna;
                    lagnaStartTime = result.time;
                }
                
                currentTime = nextTime;
            } catch (error) {
                console.error('  ⚠️  Error:', error.message);
                currentTime = nextTime;
            }
        }
        
        // Don't add the last incomplete Lagna (it belongs to next day)
        
        console.log(`  ✅ Found ${lagnas.length} Lagna periods`);
        return lagnas;
        
    } catch (error) {
        console.error('  ❌ Fatal error:', error);
        return [];
    }
}

module.exports = {
    calculateDayLagnas,
    getLagnaAtTime,
    RASHI_NAMES
};
