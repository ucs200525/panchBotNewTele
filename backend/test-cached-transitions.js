// Test the cached transition finder
const { getTransitionTimes, transitionCache } = require('./utils/transitionFinder');

const testDate = new Date('2026-01-04T12:00:00+05:30');
const latitude = 16.8144; // Tadepallegudem
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('=== Testing Cached Transition Times ===\n');
console.log('Date:', testDate.toDateString());
console.log('Location: Tadepallegudem\n');

// First call - will calculate
console.log('--- First Call (should calculate) ---');
const result1 = getTransitionTimes(testDate, latitude, longitude, timezone);

console.log('\nResults:');
if (result1.nakshatraEndTime) {
    console.log(`Nakshatra: ${result1.nakshatra} ends at ${result1.nakshatraEndTime.toLocaleString('en-IN', { timeZone: timezone })}`);
}
if (result1.tithiEndTime) {
    console.log(`Tithi: ${result1.tithi} ends at ${result1.tithiEndTime.toLocaleString('en-IN', { timeZone: timezone })}`);
}
console.log('Cached?', result1.cached);

// Second call - should use cache
console.log('\n--- Second Call (should use cache) ---');
const result2 = getTransitionTimes(testDate, latitude, longitude, timezone);

console.log('\nResults:');
if (result2.nakshatraEndTime) {
    console.log(`Nakshatra: ${result2.nakshatra} ends at ${result2.nakshatraEndTime.toLocaleString('en-IN', { timeZone: timezone })}`);
}
if (result2.tithiEndTime) {
    console.log(`Tithi: ${result2.tithi} ends at ${result2.tithiEndTime.toLocaleString('en-IN', { timeZone: timezone })}`);
}
console.log('Cached?', result2.cached);

// Show cache stats
console.log('\n--- Cache Statistics ---');
const stats = transitionCache.getStats();
console.log('Memory entries:', stats.memoryEntries);
console.log('Disk entries:', stats.diskEntries);
console.log('Cache directory:', stats.cacheDir);

console.log('\n✅ Cache test complete!');
