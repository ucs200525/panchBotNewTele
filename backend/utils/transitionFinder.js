/**
 * Binary search utility for finding Panchang element transitions
 * Returns BOTH current and next elements if transition happens during the day
 */

const { getPanchanga } = require('@bidyashish/panchang');

/**
 * Binary search to find exact transition time
 */
function binarySearchTransition(searchStart, searchEnd, checkTransition, maxIterations = 15) {
    const threshold = 60 * 1000; // 1 minute precision
    let iterations = 0;
    
    while ((searchEnd - searchStart) > threshold && iterations < maxIterations) {
        const midTime = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
        iterations++;
        
        if (checkTransition(midTime)) {
            searchEnd = midTime;
        } else {
            searchStart = midTime;
        }
    }
    
    return { time: searchEnd, iterations };
}

/**
 * Find all Tithis for a given day (current + next if transition happens)
 * @returns Array of Tithi objects with start/end times
 */
function findDayTithis(date, lat, lng, timezone) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check panchanga at START of day (not noon)
    const startPanchanga = getPanchanga(startOfDay, lat, lng, timezone);
    const endPanchanga = getPanchanga(endOfDay, lat, lng, timezone);
    
    const tithis = [];
    
    // First Tithi (at start of day)
    const firstTithi = {
        name: startPanchanga.tithi.name,
        number: startPanchanga.tithi.number,
        paksha: startPanchanga.tithi.paksha,
        percentage: startPanchanga.tithi.percentage,
        startTime: null, // Started before today
        endTime: null
    };
    
    // Check if Tithi changes during the day
    if (endPanchanga.tithi.name !== startPanchanga.tithi.name) {
        // Find exact transition time
        const result = binarySearchTransition(
            startOfDay,
            endOfDay,
            (testTime) => {
                const p = getPanchanga(testTime, lat, lng, timezone);
                return p.tithi.name !== startPanchanga.tithi.name;
            }
        );
        
        firstTithi.endTime = result.time;
        console.log(`  🔍 Tithi transition found in ${result.iterations} iterations`);
        
        // Add next Tithi
        tithis.push(firstTithi);
        tithis.push({
            name: endPanchanga.tithi.name,
            number: endPanchanga.tithi.number,
            paksha: endPanchanga.tithi.paksha,
            percentage: endPanchanga.tithi.percentage,
            startTime: result.time,
            endTime: null // Continues into next day
        });
    } else {
        // Tithi doesn't change - continues all day
        tithis.push(firstTithi);
    }
    
    return tithis;
}

/**
 * Find all Nakshatras for a given day
 */
function findDayNakshatras(date, lat, lng, timezone) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check panchanga at START of day (not noon)
    const startPanchanga = getPanchanga(startOfDay, lat, lng, timezone);
    const endPanchanga = getPanchanga(endOfDay, lat, lng, timezone);
    
    const nakshatras = [];
    
    // First Nakshatra
    const firstNakshatra = {
        name: startPanchanga.nakshatra.name,
        number: startPanchanga.nakshatra.number,
        pada: startPanchanga.nakshatra.pada,
        lord: startPanchanga.nakshatra.lord || 'N/A',
        startTime: null,
        endTime: null
    };
    
    // Check if Nakshatra changes during the day
    if (endPanchanga.nakshatra.name !== startPanchanga.nakshatra.name) {
        // Find exact transition time
        const result = binarySearchTransition(
            startOfDay,
            endOfDay,
            (testTime) => {
                const p = getPanchanga(testTime, lat, lng, timezone);
                return p.nakshatra.name !== startPanchanga.nakshatra.name;
            }
        );
        
        firstNakshatra.endTime = result.time;
        console.log(`  🔍 Nakshatra transition found in ${result.iterations} iterations`);
        
        // Add next Nakshatra
        nakshatras.push(firstNakshatra);
        nakshatras.push({
            name: endPanchanga.nakshatra.name,
            number: endPanchanga.nakshatra.number,
            pada: endPanchanga.nakshatra.pada,
            lord: endPanchanga.nakshatra.lord || 'N/A',
            startTime: result.time,
            endTime: null
        });
    } else {
        nakshatras.push(firstNakshatra);
    }
    
    return nakshatras;
}

/**
 * Get all panchang elements for the day
 */
function getDayPanchangElements(date, lat, lng, timezone) {
    console.log('  ⏳ Calculating day transitions...');
    
    return {
        tithis: findDayTithis(date, lat, lng, timezone),
        nakshatras: findDayNakshatras(date, lat, lng, timezone)
    };
}

module.exports = {
    getDayPanchangElements,
    findDayTithis,
    findDayNakshatras
};
