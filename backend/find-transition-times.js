/**
 * Find Nakshatra transition times using binary search
 * 
 * Strategy:
 * 1. Start from beginning of day (00:00)
 * 2. Search forward in chunks to find when Nakshatra changes
 * 3. Use binary search to pinpoint exact transition time
 * 4. Return start and end times
 */

const { getPanchanga } = require('@bidyashish/panchang');

/**
 * Find exact time when Nakshatra changes
 * @param {Date} startTime - Start of search window
 * @param {Date} endTime - End of search window  
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} timezone - Timezone
 * @param {string} currentNakshatra - Current nakshatra name
 * @returns {Date} - Exact transition time
 */
function findTransitionTime(startTime, endTime, lat, lng, timezone, currentNakshatra) {
    const threshold = 60 * 1000; // 1 minute precision
    
    while ((endTime - startTime) > threshold) {
        const midTime = new Date((startTime.getTime() + endTime.getTime()) / 2);
        const panchanga = getPanchanga(midTime, lat, lng, timezone);
        
        if (panchanga.nakshatra.name === currentNakshatra) {
            // Nakshatra still same, transition is later
            startTime = midTime;
        } else {
            // Nakshatra changed, transition is earlier
            endTime = midTime;
        }
    }
    
    return endTime; // Return the transition point
}

/**
 * Find Nakshatra start and end times for a given date
 * @param {Date} date - Date to find transitions for
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} timezone - Timezone
 * @returns {Object} - Object with start and end times
 */
function findNakshatraTransitions(date, lat, lng, timezone) {
    // Start from beginning of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Get Nakshatra at start of day
    const startPanchanga = getPanchanga(startOfDay, lat, lng, timezone);
    const currentNakshatra = startPanchanga.nakshatra.name;
    
    console.log(`Finding transitions for ${currentNakshatra} on ${date.toDateString()}`);
    
    // Search for when Nakshatra STARTS (may be from previous day)
    let searchStart = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000); // Previous day
    let nakshatraStart = null;
    
    // Find when current Nakshatra started (could be yesterday)
    let t = searchStart;
    const increment = 10 * 60 * 1000; // 10 minute steps
    
    while (t < startOfDay) {
        const p = getPanchanga(t, lat, lng, timezone);
        if (p.nakshatra.name === currentNakshatra) {
            // Found where it starts
            nakshatraStart = t;
            break;
        }
        t = new Date(t.getTime() + increment);
    }
    
    // If not found in previous day, it started before that
    if (!nakshatraStart) {
        nakshatraStart = searchStart;
    }
    
    // Search for when Nakshatra ENDS (forward search from start of day)
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
    
    let nakshatraEnd = null;
    t = startOfDay;
    
    while (t <= endOfDay) {
        const p = getPanchanga(t, lat, lng, timezone);
        if (p.nakshatra.name !== currentNakshatra) {
            // Found transition point - use binary search for precision
            const prevTime = new Date(t.getTime() - increment);
            nakshatraEnd = findTransitionTime(prevTime, t, lat, lng, timezone, currentNakshatra);
            break;
        }
        t = new Date(t.getTime() + increment);
    }
    
    // If not found, Nakshatra continues into next day
    if (!nakshatraEnd) {
        nakshatraEnd = new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000); // Next day
    }
    
    return {
        nakshatra: currentNakshatra,
        start: nakshatraStart,
        end: nakshatraEnd,
        pada: startPanchanga.nakshatra.pada
    };
}

// Test the function
const testDate = new Date('2026-01-04T12:00:00+05:30');
const latitude = 16.8144; // Tadepallegudem
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('=== Finding Nakshatra Transition Times ===\n');
console.log('Date:', testDate.toDateString());
console.log('Location: Tadepallegudem\n');

const result = findNakshatraTransitions(testDate, latitude, longitude, timezone);

console.log('\n=== RESULTS ===');
console.log('Nakshatra:', result.nakshatra);
console.log('Pada:', result.pada);
console.log('Start Time:', result.start.toLocaleString('en-IN', { timeZone: timezone }));
console.log('End Time:', result.end.toLocaleString('en-IN', { timeZone: timezone }));

// Verify by checking at the transition times
console.log('\n=== VERIFICATION ===');
const beforeEnd = new Date(result.end.getTime() - 60000); // 1 min before end
const afterEnd = new Date(result.end.getTime() + 60000);  // 1 min after end

const p1 = getPanchanga(beforeEnd, latitude, longitude, timezone);
const p2 = getPanchanga(afterEnd, latitude, longitude, timezone);

console.log('1 min before end:', p1.nakshatra.name);
console.log('1 min after end:', p2.nakshatra.name);
console.log('Transition verified:', p1.nakshatra.name !== p2.nakshatra.name ? '✅' : '❌');
