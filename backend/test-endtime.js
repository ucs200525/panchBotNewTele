// Test to find when endTime is provided
const { getPanchanga } = require('@bidyashish/panchang');

const tests = [
    { name: 'Midnight', date: new Date('2026-01-04T00:00:00+05:30') },
    { name: 'Noon', date: new Date('2026-01-04T12:00:00+05:30') },
    { name: 'With Z', date: new Date('2026-01-04T00:00:00Z') },
    { name: 'Simple Date', date: new Date('2026-01-04') },
    { name: 'ISO String', date: new Date('2026-01-04T06:32:45+05:30') } // At sunrise
];

const latitude = 16.8144;
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';

console.log('Testing different date formats to find endTime:\n');

tests.forEach(test => {
    console.log(`--- ${test.name}: ${test.date.toISOString()} ---`);
    const panchanga = getPanchanga(test.date, latitude, longitude, timezone);
    console.log('Tithi endTime:', panchanga.tithi.endTime);
    console.log('Nakshatra endTime:', panchanga.nakshatra.endTime);
    console.log('');
});
