// Test the actual panchang helper with timezone conversion
const { calculatePanchangData } = require('./utils/panchangHelper');

async function testHelper() {
    console.log('=== Testing Panchang Helper with Timezone Conversion ===\n');
    
    // Test for Tadepallegudem (Andhra Pradesh, India)
    const city = 'Tadepallegudem';
    const date = '2026-01-04';
    const latitude = 16.8144;
    const longitude = 81.5267;
    const sunrise = '06:32:45';
    const sunset = '17:44:42';
    
    console.log(`Testing for: ${city}`);
    console.log(`Date: ${date}`);
    console.log(`Expected Sunrise: ${sunrise}`);
    console.log(`Expected Sunset: ${sunset}\n`);
    
    try {
        const result = await calculatePanchangData(
            city,
            date,
            latitude,
            longitude,
            sunrise,
            sunset
        );
        
        console.log('\n=== RESULTS ===');
        console.log('Sunrise:', result.sunrise);
        console.log('Sunset:', result.sunset);
        
        console.log('\n=== TITHIS ===');
        result.tithis.forEach((tithi, i) => {
            console.log(`${i+1}. ${tithi.name} (${tithi.paksha} Paksha, ${tithi.percentage.toFixed(1)}% complete)`);
            if (tithi.startTime) console.log(`   Starts: ${tithi.startTime}`);
            if (tithi.endTime) console.log(`   Ends: ${tithi.endTime}`);
        });
        
        console.log('\n=== NAKSHATRAS ===');
        result.nakshatras.forEach((nakshatra, i) => {
            console.log(`${i+1}. ${nakshatra.name} (Pada ${nakshatra.pada})`);
            if (nakshatra.startTime) console.log(`   Starts: ${nakshatra.startTime}`);
            if (nakshatra.endTime) console.log(`   Ends: ${nakshatra.endTime}`);
        });
        
        console.log('\nYoga:', result.yoga.name);
        console.log('Karana:', result.karana.name);
        
        if (result.rahuKaal) {
            console.log('\nRahu Kaal:', result.rahuKaal.start, '-', result.rahuKaal.end);
            console.log('Duration:', result.rahuKaal.duration);
        }
        
        if (result.abhijitMuhurat) {
            console.log('\nAbhijit:', result.abhijitMuhurat.start, '-', result.abhijitMuhurat.end);
        }
        
        console.log('\n✅ Test Complete!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
    }
}

testHelper();
