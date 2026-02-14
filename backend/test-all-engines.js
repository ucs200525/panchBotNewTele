/**
 * Final Test for All Astrology Systems
 */

const AstrologyAPI = require('./astrology_engines/astrology_api');

const testDate = new Date();
const lat = 13.0827; // Chennai
const lng = 80.2707;

console.log(`=== ANCIENT ASTROLOGY SYSTEMS VERIFICATION ===`);
console.log(`Date: ${testDate.toLocaleDateString()}`);

try {
    const report = AstrologyAPI.getFullReport(testDate, lat, lng);

    console.log(`\n1. SURYA SIDDHANTA:`);
    console.log(`   Sun True: ${report.surya_siddhanta.sun.true.toFixed(2)}°`);

    console.log(`\n2. VAKYA SYSTEM:`);
    console.log(`   Lunar Position (Vakya): ${report.vakya.moon.toFixed(2)}°`);

    console.log(`\n3. KP SYSTEM:`);
    console.log(`   Lagna (Ascendant) Cusp: ${report.kp_system.houses[0].cusp.toFixed(2)}°`);
    console.log(`   Lagna Sub-Lord: ${report.kp_system.houses[0].subLord}`);

    console.log(`\nALL SYSTEMS INITIALIZED AND FUNCTIONAL.`);

} catch (error) {
    console.error(`Verification Failed:`, error.message);
}
