const assert = require('assert');
const { calculatePanchangData } = require('./utils/panchangHelper');

async function runTest() {
    console.log('🧪 Starting Timezone Independence Verification...');

    const city = 'Hyderabad';
    const date = '2026-05-31';
    const lat = 17.3850;
    const lng = 78.4867;
    const sunriseStr = '05:43:00';
    const sunsetStr = '18:41:00';
    const moonriseStr = '18:30:00';
    const moonsetStr = '05:15:00';
    const nextSunriseStr = '05:43:00';

    // 1. Run in Asia/Kolkata
    process.env.TZ = 'Asia/Kolkata';
    console.log(`Setting environment TZ to: ${process.env.TZ}`);
    const resultsKolkata = await calculatePanchangData(
        city, date, lat, lng, sunriseStr, sunsetStr, moonriseStr, moonsetStr, nextSunriseStr, true
    );

    // 2. Run in UTC
    process.env.TZ = 'UTC';
    console.log(`Setting environment TZ to: ${process.env.TZ}`);
    const resultsUtc = await calculatePanchangData(
        city, date, lat, lng, sunriseStr, sunsetStr, moonriseStr, moonsetStr, nextSunriseStr, true
    );

    // 3. Compare key elements
    const keysToCompare = [
        'vara',
        'weekday',
        'paksha',
        'tithi',
        'nakshatra',
        'yoga',
        'karana',
        'sunrise',
        'sunset',
        'moonrise',
        'moonset',
        'abhijitMuhurat',
        'rahuKaal',
        'gulika',
        'yamaganda',
        'brahmaMuhurat',
        'kaalRatri',
        'durMuhurat',
        'varjyam'
    ];

    let discrepancies = 0;
    console.log('\n--- Comparing Core Timing Elements ---');
    for (const key of keysToCompare) {
        const valKolkata = JSON.stringify(resultsKolkata[key]);
        const valUtc = JSON.stringify(resultsUtc[key]);
        if (valKolkata === valUtc) {
            console.log(`✅ [${key}]: Match (${valKolkata})`);
        } else {
            console.error(`❌ [${key}]: Discrepancy!`);
            console.error(`   Kolkata: ${valKolkata}`);
            console.error(`   UTC:     ${valUtc}`);
            discrepancies++;
        }
    }

    // Compare first Lagna timing
    console.log('\n--- Comparing Lagna Transitions ---');
    if (resultsKolkata.lagnas.length !== resultsUtc.lagnas.length) {
        console.error(`❌ Lagna periods length mismatch! Kolkata: ${resultsKolkata.lagnas.length}, UTC: ${resultsUtc.lagnas.length}`);
        discrepancies++;
    } else {
        for (let i = 0; i < resultsKolkata.lagnas.length; i++) {
            const lagnaKolkata = resultsKolkata.lagnas[i];
            const lagnaUtc = resultsUtc.lagnas[i];
            if (lagnaKolkata.name === lagnaUtc.name && lagnaKolkata.startTime === lagnaUtc.startTime && lagnaKolkata.endTime === lagnaUtc.endTime) {
                console.log(`✅ [Lagna ${i}]: Match (${lagnaKolkata.name} from ${lagnaKolkata.startTime} to ${lagnaKolkata.endTime})`);
            } else {
                console.error(`❌ [Lagna ${i}]: Discrepancy!`);
                console.error(`   Kolkata: ${JSON.stringify(lagnaKolkata)}`);
                console.error(`   UTC:     ${JSON.stringify(lagnaUtc)}`);
                discrepancies++;
            }
        }
    }

    if (discrepancies === 0) {
        console.log('\n🎉 SUCCESS! All calculations are identical regardless of the server timezone!');
        process.exit(0);
    } else {
        console.error(`\n🔴 FAILURE! Found ${discrepancies} timezone discrepancies.`);
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error('Fatal error running verification:', err);
    process.exit(1);
});
