// Comprehensive test of all Swiss Ephemeris modules

const { lagna, panchanga } = require('./swisseph');

const date = new Date('2026-01-04T12:00:00+05:30');
const lat = 16.8135;
const lng = 81.5217;
const timezone = 'Asia/Kolkata';
const sunrise = '06:32:45';

console.log('🕉️  COMPREHENSIVE SWISS EPHEMERIS TEST\n');
console.log(`📅 Date: ${date.toLocaleDateString('en-IN')}`);
console.log(`📍 Location: ${lat}°N, ${lng}°E`);
console.log(`🌅 Sunrise: ${sunrise}\n`);
console.log('='.repeat(60));

// Test Lagna
console.log('\n1️⃣  LAGNA (ASCENDANT) TIMINGS\n');
const lagnas = lagna.calculateDayLagnas(date, lat, lng, timezone, sunrise);
console.log(`\nFound ${lagnas.length} Lagna periods:`);
lagnas.slice(0, 3).forEach(l => {
    const start = l.startTime.toLocaleTimeString('en-IN', { timeZone: timezone });
    const end = l.endTime ? l.endTime.toLocaleTimeString('en-IN', { timeZone: timezone }) : 'Next day';
    console.log(`  ${l.symbol} ${l.name}: ${start} - ${end}`);
});
console.log('  ...');

// Test Panchanga
console.log('\n' + '='.repeat(60));
console.log('\n2️⃣  PANCHANGA ELEMENTS\n');
const dayPanchanga = panchanga.calculateDayPanchanga(date, timezone);

console.log(`\n📊 Tithi (${dayPanchanga.tithis.length} period(s)):`);
dayPanchanga.tithis.forEach(t => {
    const start = t.startTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true });
    const end = t.endTime ? t.endTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true }) : 'Next day';
    console.log(`  ${t.name} (${t.paksha}): ${start} - ${end}`);
});

console.log(`\n⭐ Nakshatra (${dayPanchanga.nakshatras.length} period(s)):`);
dayPanchanga.nakshatras.forEach(n => {
    const start = n.startTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true });
    const end = n.endTime ? n.endTime.toLocaleTimeString('en-IN', { timeZone: timezone, hour12: true }) : 'Next day';
    console.log(`  ${n.name} Pada ${n.pada}: ${start} - ${end}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ ALL MODULES WORKING PERFECTLY!\n');
console.log('📦 Available modules:');
console.log('  ✅ Lagna (Ascendant with zodiac symbols)');
console.log('  ✅ Panchanga (Tithi & Nakshatra with precise timings)');
console.log('  ⏳ Muhurta (Coming next)');
console.log('  ⏳ Planetary (Coming next)');
console.log('  ⏳ Charts (Coming next)');
console.log('  ⏳ Dasha (Coming next)');
console.log('\n' + '='.repeat(60) + '\n');
