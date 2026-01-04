// Test if getPanchangaReport provides endTime data
const { getPanchanga, getPanchangaReport } = require('@bidyashish/panchang');

const testDate = new Date('2026-01-04');
const latitude = 16.8144; // Tadepallegudem
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('=== Testing getPanchanga vs getPanchangaReport ===\n');

// Test 1: getPanchanga
console.log('--- getPanchanga() ---');
const panchanga = getPanchanga(testDate, latitude, longitude, timezone);
console.log('Tithi:', panchanga.tithi);
console.log('Nakshatra:', panchanga.nakshatra);
console.log('Yoga:', panchanga.yoga);
console.log('Karana:', panchanga.karana);
console.log('');

// Test 2: getPanchangaReport
console.log('--- getPanchangaReport() ---');
try {
    const report = getPanchangaReport(testDate, latitude, longitude, timezone, 'Tadepallegudem');
    console.log(report);
} catch (error) {
    console.error('Error:', error.message);
}
