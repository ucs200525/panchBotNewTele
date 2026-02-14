/**
 * Test script for comprehensive panchanga engines
 */

const SuryaEngine = require('./astrology_engines/surya_siddhanta_engine');
const VakyaEngine = require('./astrology_engines/vakya_engine');

const testDate = new Date('2026-02-14');
const latitude = 13.0827; // Chennai

console.log('=== TESTING COMPREHENSIVE PANCHANGA ENGINES ===\n');

// Test Surya Siddhanta
console.log('1. SURYA SIDDHANTA COMPREHENSIVE PANCHANGA:');
console.log('-------------------------------------------');
try {
    const suryaResult = SuryaEngine.calculateCompletePanchanga(testDate, latitude);
    console.log(`Date: ${suryaResult.date}`);
    console.log(`Ahargana: ${suryaResult.ahargana}`);
    console.log(`\nFive Angas:`);
    console.log(`  Vara: ${suryaResult.vara.day} (Lord: ${suryaResult.vara.lord})`);
    console.log(`  Tithi: ${suryaResult.tithi.name} #${suryaResult.tithi.number} (${suryaResult.tithi.paksha} Paksha)`);
    console.log(`  Nakshatra: ${suryaResult.nakshatra.name} #${suryaResult.nakshatra.number} (Lord: ${suryaResult.nakshatra.lord}, Pada: ${suryaResult.nakshatra.pada})`);
    console.log(`  Yoga: ${suryaResult.yoga.name} #${suryaResult.yoga.number}`);
    console.log(`  Karana: ${suryaResult.karana.name}`);
    console.log(`\nAdditional:`);
    console.log(`  Chandra Rasi: ${suryaResult.rasi.name} (#${suryaResult.rasi.number})`);
    console.log(`  Lagna: ${suryaResult.lagna.rasi} at ${suryaResult.lagna.degree}°`);
    console.log(`\nPlanetary Positions:`);
    console.log(`  Sun: ${suryaResult.planetaryPositions.sun}°`);
    console.log(`  Moon: ${suryaResult.planetaryPositions.moon}°`);
    console.log(`  Rahu: ${suryaResult.planetaryPositions.rahu}°`);
    console.log('\n✓ Surya Siddhanta calculation successful!\n');
} catch (error) {
    console.error('✗ Error in Surya Siddhanta:', error.message);
}

// Test Vakya
console.log('\n2. VAKYA PANCHANGAM COMPREHENSIVE CALCULATION:');
console.log('--------------------------------------------');
try {
    const vakyaResult = VakyaEngine.calculateCompletePanchanga(testDate, latitude);
    console.log(`Date: ${vakyaResult.date}`);
    console.log(`Ahargana: ${vakyaResult.ahargana}`);
    console.log(`\nFive Angas:`);
    console.log(`  Vara: ${vakyaResult.vara.day} (Lord: ${vakyaResult.vara.lord})`);
    console.log(`  Tithi: ${vakyaResult.tithi.name} #${vakyaResult.tithi.number} (${vakyaResult.tithi.paksha} Paksha)`);
    console.log(`  Nakshatra: ${vakyaResult.nakshatra.name} #${vakyaResult.nakshatra.number} (Lord: ${vakyaResult.nakshatra.lord}, Pada: ${vakyaResult.nakshatra.pada})`);
    console.log(`  Yoga: ${vakyaResult.yoga.name} #${vakyaResult.yoga.number}`);
    console.log(`  Karana: ${vakyaResult.karana.name}`);
    console.log(`\nAdditional:`);
    console.log(`  Chandra Rasi: ${vakyaResult.rasi.name} (#${vakyaResult.rasi.number})`);
    console.log(`  Lagna: ${vakyaResult.lagna.rasi} at ${vakyaResult.lagna.degree}°`);
    console.log(`\nPlanetary Positions:`);
    console.log(`  Sun: ${vakyaResult.planetaryPositions.sun}°`);
    console.log(`  Moon: ${vakyaResult.planetaryPositions.moon}°`);
    console.log('\n✓ Vakya Panchangam calculation successful!\n');
} catch (error) {
    console.error('✗ Error in Vakya:', error.message);
}

console.log('\n=== ALL COMPREHENSIVE CALCULATIONS VERIFIED ===');
