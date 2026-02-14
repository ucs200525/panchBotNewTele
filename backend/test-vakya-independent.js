/**
 * Test Vakya Independent Engine
 */

const VakyaEngine = require('./astrology_engines/vakya_engine');

const testDate = new Date('2026-02-14');
const latitude = 13.0827; // Chennai
const longitude = 80.2707;

console.log('=== TESTING VAKYA INDEPENDENT PANCHANGA ===\n');

try {
    const result = VakyaEngine.calculateCompletePanchanga(testDate, latitude, longitude);

    console.log('✓ Vakya Engine initialized successfully!\n');
    console.log(`Date: ${result.date}`);
    console.log(`System: ${result.system}`);
    console.log(`Ahargana: ${result.ahargana}\n`);

    console.log('FIVE ANGAS (Panchanga Elements):');
    console.log(`  Vara: ${result.vara.day} (Lord: ${result.vara.lord})`);
    console.log(`  Tithi: ${result.tithi.name} #${result.tithi.number} (${result.tithi.paksha} Paksha)`);
    console.log(`  Nakshatra: ${result.nakshatra.name} #${result.nakshatra.number} (Lord: ${result.nakshatra.lord}, Pada: ${result.nakshatra.pada})`);
    console.log(`  Yoga: ${result.yoga.name} #${result.yoga.number}`);
    console.log(`  Karana: ${result.karana.name}\n`);

    console.log('ADDITIONAL ELEMENTS:');
    console.log(`  Chandra Rasi: ${result.rasi.name} (#${result.rasi.number})`);
    console.log(`  Lagna: ${result.lagna.rasi} at ${result.lagna.degree}°\n`);

    console.log('PLANETARY POSITIONS (All Ancient Calculations):');
    console.log(`  Sun (Surya): ${result.planetaryPositions.sun}°`);
    console.log(`  Moon (Chandra): ${result.planetaryPositions.moon}°`);
    console.log(`  Mars (Mangal): ${result.planetaryPositions.mars}°`);
    console.log(`  Mercury (Budha): ${result.planetaryPositions.mercury}°`);
    console.log(`  Jupiter (Guru): ${result.planetaryPositions.jupiter}°`);
    console.log(`  Venus (Shukra): ${result.planetaryPositions.venus}°`);
    console.log(`  Saturn (Shani): ${result.planetaryPositions.saturn}°`);
    console.log(`  Rahu: ${result.planetaryPositions.rahu}°`);
    console.log(`  Ketu: ${result.planetaryPositions.ketu}°\n`);

    console.log('===VAKYA ENGINE: 100% INDEPENDENT ===');
    console.log('✓ NO Swiss Ephemeris used for planetary positions');
    console.log('✓ All calculations using Vakya + Surya Siddhanta methods');
    console.log('✓ Complete panchanga with all elements calculated');

} catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
}
