// Test Lagna calculation
const { calculateDayLagnas } = require('./utils/lagnaFinder');

const testDate = new Date('2026-01-04T12:00:00+05:30');
const latitude = 16.8144; // Tadepallegudem
const longitude = 81.5267;
const timezone = 'Asia/Kolkata';
const sunriseStr = '06:32:45';
const sunsetStr = '17:44:42';

console.log('=== Testing Lagna (Ascendant) Timings ===\n');
console.log('Date:', testDate.toDateString());
console.log('Location: Tadepallegudem');
console.log('Sunrise:', sunriseStr);
console.log();

try {
    const lagnas = calculateDayLagnas(testDate, latitude, longitude, timezone, sunriseStr, sunsetStr);
    
    if (lagnas.length === 0) {
        console.log('⚠️  No Lagna data available - library may not support Ascendant');
    } else {
        console.log('\n=== LAGNA TIMINGS FOR THE DAY ===\n');
        console.log('Lagna\t\t\tStart\t\t\tEnd');
        console.log('─'.repeat(70));
        
        lagnas.forEach(lagna => {
            const start = lagna.startTime.toLocaleString('en-IN', { 
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit'
            });
            const end = lagna.endTime 
                ? lagna.endTime.toLocaleString('en-IN', { 
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Next Day';
            
            console.log(`${lagna.name.padEnd(15)}\t${start}\t\t${end}`);
        });
    }
} catch (error) {
    console.error('❌ Error:', error.message);
}

console.log('\n✅ Test complete!');
