/**
 * Optimized transition time finder for Panchang elements
 * Uses intelligent binary search to minimize API calls
 */

const { getPanchanga } = require('@bidyashish/panchang');

/**
 * Find transition time with optimized binary search
 * @param {Date} searchStart - Start of time window
 * @param {Date} searchEnd - End of time window
 * @param {Function} checkTransition - Function that returns true if transition happened
 * @returns {Date} - Exact transition time (within 1 minute)
 */
function binarySearchTransition(searchStart, searchEnd, checkTransition) {
    const threshold = 60 * 1000; // 1 minute precision
    let callCount = 0;
    
    while ((searchEnd - searchStart) > threshold) {
        const midTime = new Date((searchStart.getTime() + searchEnd.getTime()) / 2);
        callCount++;
        
        if (checkTransition(midTime)) {
            // Transition happened, move back
            searchEnd = midTime;
        } else {
            // Not yet, move forward
            searchStart = midTime;
        }
    }
    
    console.log(`  Binary search completed in ${callCount} iterations`);
    return searchEnd;
}

/**
 * Find when a Nakshatra ends on given date
 * @param {Date} date - Date to check
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} timezone - Timezone
 * @returns {Object} - {nakshatra, pada, endTime} or null if doesn't end today
 */
function findNakshatraEndTime(date, lat, lng, timezone) {
    console.log('Finding Nakshatra end time...');
    
    // Get Nakshatra at noon
    const noon = new Date(date);
    noon.setHours(12, 0, 0, 0);
    
    const currentPanchanga = getPanchanga(noon, lat, lng, timezone);
    const currentNakshatra = currentPanchanga.nakshatra.name;
    
    console.log(`  Current Nakshatra: ${currentNakshatra}`);
    
    // Check end of day
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const endPanchanga = getPanchanga(endOfDay, lat, lng, timezone);
    
    if (endPanchanga.nakshatra.name === currentNakshatra) {
        // Nakshatra doesn't change today
        console.log(`  Nakshatra continues into next day`);
        return null;
    }
    
    // Nakshatra changes today - find exact time with binary search
    console.log(`  Nakshatra changes to: ${endPanchanga.nakshatra.name}`);
    
    const transitionTime = binarySearchTransition(
        noon,
        endOfDay,
        (testTime) => {
            const p = getPanchanga(testTime, lat, lng, timezone);
            return p.nakshatra.name !== currentNakshatra;
        }
    );
    
    return {
        nakshatra: currentNakshatra,
        pada: currentPanchanga.nakshatra.pada,
        endTime: transitionTime,
        nextNakshatra: endPanchanga.nakshatra.name
    };
}

/**
 * Find Tithi end time (same logic)
 */
function findTithiEndTime(date, lat, lng, timezone) {
    console.log('Finding Tithi end time...');
    
    const noon = new Date(date);
    noon.setHours(12, 0, 0, 0);
    
    const currentPanchanga = getPanchanga(noon, lat, lng, timezone);
    const currentTithi = currentPanchanga.tithi.name;
    
    console.log(`  Current Tithi: ${currentTithi}`);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const endPanchanga = getPanchanga(endOfDay, lat, lng, timezone);
    
    if (endPanchanga.tithi.name === currentTithi) {
        console.log(`  Tithi continues into next day`);
        return null;
    }
    
    console.log(`  Tithi changes to: ${endPanchanga.tithi.name}`);
    
    const transitionTime = binarySearchTransition(
        noon,
        endOfDay,
        (testTime) => {
            const p = getPanchanga(testTime, lat, lng, timezone);
            return p.tithi.name !== currentTithi;
        }
    );
    
    return {
        tithi: currentTithi,
        paksha: currentPanchanga.tithi.paksha,
        percentage: currentPanchanga.tithi.percentage,
        endTime: transitionTime,
        nextTithi: endPanchanga.tithi.name
    };
}

// Test
const testDate = new Date('2026-01-04T12:00:00+05:30');
const latitude = 16.8144;
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('=== Optimized Transition Time Finder ===\n');
console.log('Date:', testDate.toDateString());
console.log();

const nakshatraResult = findNakshatraEndTime(testDate, latitude, longitude, timezone);

if (nakshatraResult) {
    console.log('\n✅ Nakshatra Transition Found:');
    console.log(`   ${nakshatraResult.nakshatra} (Pada ${nakshatraResult.pada})`);
    console.log(`   Ends at: ${nakshatraResult.endTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    console.log(`   Next: ${nakshatraResult.nextNakshatra}`);
}

console.log();

const tithiResult = findTithiEndTime(testDate, latitude, longitude, timezone);

if (tithiResult) {
    console.log('\n✅ Tithi Transition Found:');
    console.log(`   ${tithiResult.tithi} (${tithiResult.paksha} Paksha, ${tithiResult.percentage.toFixed(1)}%)`);
    console.log(`   Ends at: ${tithiResult.endTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    console.log(`   Next: ${tithiResult.nextTithi}`);
}

console.log('\n✨ Optimized version complete!');
