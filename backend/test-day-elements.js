// Test the new multi-element finder
const { getDayPanchangElements } = require('./utils/transitionFinder');

const testDate = new Date('2026-01-04T12:00:00+05:30');
const latitude = 16.8144;
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('=== Testing Day Elements (No Cache) ===\n');
console.log('Date:', testDate.toDateString());
console.log();

const result = getDayPanchangElements(testDate, latitude, longitude, timezone);

console.log('\n=== TITHIS FOR THE DAY ===');
result.tithis.forEach((tithi, index) => {
    console.log(`\n${index + 1}. ${tithi.name} (${tithi.paksha} Paksha)`);
    if (tithi.startTime) {
        console.log(`   Starts: ${tithi.startTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    } else {
        console.log(`   Starts: Beginning of day`);
    }
    if (tithi.endTime) {
        console.log(`   Ends: ${tithi.endTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    } else {
        console.log(`   Ends: Continues into next day`);
    }
});

console.log('\n=== NAKSHATRAS FOR THE DAY ===');
result.nakshatras.forEach((nakshatra, index) => {
    console.log(`\n${index + 1}. ${nakshatra.name} (Pada ${nakshatra.pada})`);
    if (nakshatra.startTime) {
        console.log(`   Starts: ${nakshatra.startTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    } else {
        console.log(`   Starts: Beginning of day`);
    }
    if (nakshatra.endTime) {
        console.log(`   Ends: ${nakshatra.endTime.toLocaleString('en-IN', { timeZone: timezone })}`);
    } else {
        console.log(`   Ends: Continues into next day`);
    }
});

console.log('\n✅ Test complete!');
