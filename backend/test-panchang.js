/**
 * Test script to demonstrate panchang calculations
 * Run with: node test-panchang.js
 */

const { calculatePanchangData } = require('./utils/panchangHelper');

async function testPanchang() {
    try {
        console.log('=== Testing Panchang Calculations ===\n');
        
        // Example: New Delhi, India
        const city = 'New Delhi';
        const date = '2026-01-04'; // YYYY-MM-DD format
        const latitude = 28.6139;
        const longitude = 77.2090;
        const sunrise = '07:15:00'; // HH:MM:SS format
        const sunset = '17:45:00';  // HH:MM:SS format
        
        console.log(`Location: ${city}`);
        console.log(`Date: ${date}`);
        console.log(`Coordinates: ${latitude}, ${longitude}`);
        console.log(`Sunrise: ${sunrise}, Sunset: ${sunset}\n`);
        
        const panchangData = await calculatePanchangData(
            city,
            date,
            latitude,
            longitude,
            sunrise,
            sunset
        );
        
        console.log('=== PANCHANG DETAILS ===\n');
        
        // Five limbs of Panchang
        console.log('📅 PANCHANGA (Five Limbs):');
        console.log(`  1. Tithi: ${panchangData.tithi.name} (ends at ${panchangData.tithi.endTime})`);
        console.log(`  2. Nakshatra: ${panchangData.nakshatra.name} (ends at ${panchangData.nakshatra.endTime})`);
        if (panchangData.nakshatra.lord) {
            console.log(`     - Lord: ${panchangData.nakshatra.lord}`);
        }
        console.log(`  3. Yoga: ${panchangData.yoga.name} (ends at ${panchangData.yoga.endTime})`);
        console.log(`  4. Karana: ${panchangData.karana.name} (ends at ${panchangData.karana.endTime})`);
        console.log(`  5. Vara (Day): ${panchangData.vara}\n`);
        
        // Astronomical details
        console.log('🌙 ASTRONOMICAL DETAILS:');
        console.log(`  Moon Sign (Chandra Rashi): ${panchangData.moonSign}`);
        if (panchangData.sunSign) {
            console.log(`  Sun Sign (Surya Rashi): ${panchangData.sunSign}`);
        }
        console.log(`  Paksha: ${panchangData.paksha}`);
        if (panchangData.masa) {
            console.log(`  Masa (Month): ${panchangData.masa}`);
        }
        if (panchangData.samvatsara) {
            console.log(`  Samvatsara (Year): ${panchangData.samvatsara}`);
        }
        if (panchangData.ayanamsa) {
            console.log(`  Ayanamsa: ${panchangData.ayanamsa}°`);
        }
        console.log('');
        
        // Auspicious and Inauspicious timings
        console.log('⏰ IMPORTANT TIMINGS:');
        console.log(`  Sunrise: ${panchangData.sunrise}`);
        console.log(`  Sunset: ${panchangData.sunset}`);
        console.log(`  Abhijit Muhurat: ${panchangData.abhijitMuhurat?.start || 'N/A'} - ${panchangData.abhijitMuhurat?.end || 'N/A'}`);
        console.log(`    (Auspicious time, ${panchangData.abhijitMuhurat?.duration || 'N/A'})`);
        if (panchangData.rahuKaal) {
            console.log(`  Rahu Kaal: ${panchangData.rahuKaal.start} - ${panchangData.rahuKaal.end}`);
            console.log(`    (Inauspicious time, ${panchangData.rahuKaal.duration})`);
        } else {
            console.log(`  Rahu Kaal: Not available`);
        }
        if (panchangData.gulika) {
            console.log(`  Gulika: ${panchangData.gulika.start} - ${panchangData.gulika.end}`);
            console.log(`    (${panchangData.gulika.duration})`);
        }
        console.log('');
        
        console.log('=== TEST COMPLETED SUCCESSFULLY ===\n');
        
        // Show available properties
        console.log('Available properties in panchangData:');
        console.log(Object.keys(panchangData).filter(key => !key.startsWith('_')).join(', '));
        
    } catch (error) {
        console.error('\n❌ TEST FAILED\n');
        console.error('Error:', error.message);
        
        if (error.message.includes('Panchang library not available')) {
            console.error('\n📋 INSTALLATION REQUIRED:');
            console.error('The @bidyashish/panchang package is not installed.');
            console.error('\nPlease follow the installation guide:');
            console.error('See INSTALLATION_GUIDE.md for detailed instructions.\n');
            console.error('Quick start:');
            console.error('1. Install Visual Studio Build Tools');
            console.error('2. Open a NEW terminal');
            console.error('3. Run: npm install @bidyashish/panchang\n');
        } else {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        
        process.exit(1);
    }
}

// Run the test
testPanchang();
