// Test Panchanga module

const { panchanga } = require('./swisseph');

const date = new Date('2026-01-04T12:00:00+05:30');
const timezone = 'Asia/Kolkata';

console.log('🕉️  Testing Panchanga Module\n');

// Test all Panchanga elements for the day
const dayPanchanga = panchanga.calculateDayPanchanga(date, timezone);

console.log('\n📊 RESULTS:\n');

console.log('=== TITHIS ===');
dayPanchanga.tithis.forEach(t => {
    const start = t.startTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true });
    const end = t.endTime ? t.endTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true }) : 'Next day';
    console.log(`${t.name} (${t.paksha}): ${start} - ${end}`);
});

console.log('\n=== NAKSHATRAS ===');
dayPanchanga.nakshatras.forEach(n => {
    const start = n.startTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true });
    const end = n.endTime ? n.endTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true }) : 'Next day';
    console.log(`${n.name} Pada ${n.pada}: ${start} - ${end}`);
});

console.log('\n✅ Panchanga module test complete!');
