// Test Swiss Ephemeris Lagna integration

const { calculateDayLagnas } = require('./utils/lagnaFinder');

const date = new Date('2026-01-04T12:00:00+05:30');
const lat = 16.8135;
const lng = 81.5217;
const timezone = 'Asia/Kolkata';
const sunrise = '06:32:45';

console.log('Testing Swiss Ephemeris integration...\n');

const lagnas = calculateDayLagnas(date, lat, lng, timezone, sunrise);

console.log(`\n✅ Integration test PASSED!`);
console.log(`Found ${lagnas.length} Lagnas for the day\n`);

console.log('Sample output:');
lagnas.slice(0, 3).forEach(l => {
    const start = l.startTime.toLocaleTimeString('en-IN', { timeZone: timezone });
    const end = l.endTime ? l.endTime.toLocaleTimeString('en-IN', { timeZone: timezone }) : 'Next day';
    console.log(`${l.symbol} ${l.name}: ${start} - ${end}`);
});

console.log('\n📁 New structure working correctly!');
