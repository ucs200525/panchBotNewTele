const { panchanga, lagna: lagnaModule } = require('../swisseph');
const tithiCalc = new panchanga.TithiCalculator();
const naksCalc = new panchanga.NakshatraCalculator();
const lagnaCalc = new lagnaModule.LagnaCalculator();

const lat = 13.0827;
const lng = 80.2707;
const timezone = 'Asia/Kolkata';

// Check times around 3:54 AM, 4:30 AM (midpoint), 5:11 AM, 5:30 AM (midpoint) on May 16, 2026
const checkTimes = [
    new Date('2026-05-16T03:00:00+05:30'),
    new Date('2026-05-16T04:30:00+05:30'),
    new Date('2026-05-16T05:30:00+05:30')
];

for (const time of checkTimes) {
    const tithi = tithiCalc.getTithiAtTime(time);
    const naks = naksCalc.getNakshatraAtTime(time);
    const lagna = lagnaCalc.getLagnaAtTime(time, lat, lng);
    
    const tIndex = tithi.number + 1;
    const nIndex = naks.number + 1;
    const lIndex = lagna.index + 1;
    const vIndex = 6; // Friday
    
    const sum = tIndex + nIndex + lIndex + vIndex;
    const remainder = sum % 9;
    
    console.log(`Time: ${time.toISOString()}`);
    console.log(`  Tithi: ${tithi.name} (${tIndex})`);
    console.log(`  Naks: ${naks.name} (${nIndex})`);
    console.log(`  Lagna: ${lagna.name} (${lIndex})`);
    console.log(`  Sum: ${sum}, Remainder: ${remainder}`);
}
