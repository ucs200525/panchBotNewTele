// Quick test for @bidyashish/panchang
const { getPanchanga } = require('@bidyashish/panchang');

console.log('Testing @bidyashish/panchang...\n');

const date = new Date('2026-01-04');
const latitude = 28.6139;   // Delhi
const longitude = 77.2090;
const timezone = 'Asia/Kolkata';

try {
    const panchanga = getPanchanga(date, latitude, longitude, timezone);
    
    console.log('✅ SUCCESS! Panchanga data received:\n');
    console.log('Date:', date.toDateString());
    console.log('Location: Delhi, India\n');
    console.log('--- CORE PANCHANGA ---');
    console.log('Tithi:', panchanga.tithi.name, `(${panchanga.tithi.paksha} paksha, ${panchanga.tithi.percentage.toFixed(1)}% complete)`);
    console.log('Nakshatra:', panchanga.nakshatra.name, `(Pada ${panchanga.nakshatra.pada})`);
    console.log('Yoga:', panchanga.yoga.name);
    console.log('Karana:', panchanga.karana.name);
    console.log('Vara:', panchanga.vara.name);
    console.log('');
    
    console.log('--- TIMINGS ---');
    if (panchanga.sunrise) {
        console.log('Sunrise:', panchanga.sunrise.toLocaleTimeString('en-US'));
    }
    if (panchanga.sunset) {
        console.log('Sunset:', panchanga.sunset.toLocaleTimeString('en-US'));
    }
    console.log('');
    
    console.log('--- OTHER INFO ---');
    console.log('Moon Phase:', panchanga.moonPhase);
    if (panchanga.rahuKaal && panchanga.rahuKaal.start) {
        console.log('Rahu Kaal:', panchanga.rahuKaal.start.toLocaleTimeString('en-US'), '-', panchanga.rahuKaal.end.toLocaleTimeString('en-US'));
    }
    console.log('');
    
    console.log('🎉 Test Completed Successfully!');
    console.log('\nThe @bidyashish/panchang library is working correctly!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
}
