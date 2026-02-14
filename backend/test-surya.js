/**
 * Test script for Surya Siddhanta Engine
 */

const SuryaEngine = require('./astrology_engines/surya_siddhanta_engine');

function formatDegrees(deg) {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
}

// Test for Today
const testDate = new Date(); // Feb 14, 2026 based on metadata
console.log(`=== SURYA SIDDHANTA TEST ===`);
console.log(`Date: ${testDate.toUTCString()}`);

try {
    const results = SuryaEngine.calculatePositions(testDate);

    console.log(`\nAhargana: ${results.ahargana.toFixed(4)} days`);

    console.log(`\nPLANETARY POSITIONS:`);
    console.log(`SUN:`);
    console.log(`  Mean: ${formatDegrees(results.sun.mean)}`);
    console.log(`  True: ${formatDegrees(results.sun.true)}`);

    console.log(`MOON:`);
    console.log(`  Mean:   ${formatDegrees(results.moon.mean)}`);
    console.log(`  Apogee: ${formatDegrees(results.moon.apogee)}`);
    console.log(`  True:   ${formatDegrees(results.moon.true)}`);

    console.log(`RAHU:`);
    console.log(`  True: ${formatDegrees(results.rahu.true)}`);

    console.log(`\nVerification Notes:`);
    console.log(`- These positions are based on pure Surya Siddhanta Mahayuga constants.`);
    console.log(`- They will differ from modern ephemeris (NASA/Drik) by several degrees.`);
    console.log(`- Epoch used is Kali Yuga Start (3102 BCE).`);

} catch (error) {
    console.error(`ERROR during calculation:`, error);
}
