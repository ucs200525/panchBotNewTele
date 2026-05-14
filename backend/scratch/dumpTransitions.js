const { panchanga, lagna: lagnaModule } = require('../swisseph');
const tithiCalc = new panchanga.TithiCalculator();
const naksCalc = new panchanga.NakshatraCalculator();
const lagnaCalc = new lagnaModule.LagnaCalculator();

const lat = 13.0827;
const lng = 80.2707;
const timezone = 'Asia/Kolkata';
const dateObj = new Date('2026-05-15T12:00:00+05:30');

console.log("Tithis:");
console.log(tithiCalc.calculateDayTithis(dateObj, timezone));
const tmrw = new Date('2026-05-16T12:00:00+05:30');
console.log(tithiCalc.calculateDayTithis(tmrw, timezone));

console.log("\nNakshatras:");
console.log(naksCalc.calculateDayNakshatras(dateObj, timezone));
console.log(naksCalc.calculateDayNakshatras(tmrw, timezone));

console.log("\nLagnas:");
console.log(lagnaCalc.calculateDayLagnas(dateObj, lat, lng, timezone, "05:43:00"));
