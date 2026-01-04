// Test cache with different dates
const { getTransitionTimes, transitionCache } = require('./utils/transitionFinder');

console.log('=== Testing Cache with Different Dates ===\n');

const latitude = 16.8144;
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

// Test January 3rd
console.log('--- Testing January 3, 2026 ---');
const jan3 = new Date('2026-01-03T12:00:00+05:30');
console.log('Date object:', jan3.toString());
console.log('ISO:', jan3.toISOString());

const result3 = getTransitionTimes(jan3, latitude, longitude, timezone);
console.log('Nakshatra:', result3.nakshatra);
if (result3.nakshatraEndTime) {
    console.log('Ends at:', result3.nakshatraEndTime.toLocaleString('en-IN', { timeZone: timezone }));
}

console.log('\n--- Testing January 4, 2026 ---');
const jan4 = new Date('2026-01-04T12:00:00+05:30');
console.log('Date object:', jan4.toString());
console.log('ISO:', jan4.toISOString());

const result4 = getTransitionTimes(jan4, latitude, longitude, timezone);
console.log('Nakshatra:', result4.nakshatra);
if (result4.nakshatraEndTime) {
    console.log('Ends at:', result4.nakshatraEndTime.toLocaleString('en-IN', { timeZone: timezone }));
}

// Show cache
console.log('\n--- Cache Contents ---');
const stats = transitionCache.getStats();
console.log('Entries:', stats.memoryEntries);
console.log('Directory:', stats.cacheDir);

// List cache files
const fs = require('fs');
if (fs.existsSync(stats.cacheDir)) {
    const files = fs.readdirSync(stats.cacheDir);
    console.log('Files:', files);
}

console.log('\n✅ Multi-date test complete!');
