const { calculateSwissPanchakaRahita } = require('./utils/panchangHelper');

async function test() {
    const date = new Date(2026, 4, 4, 12, 0, 0); // May 4, 2026
    const lat = 16.5061743;
    const lng = 80.6480153;
    const timezone = 'Asia/Kolkata';
    const sunriseToday = '05:45:00';
    const sunsetToday = '18:30:00';
    const sunriseTmrw = '05:44:00';

    console.log('Testing calculateSwissPanchakaRahita with updated formula...');
    try {
        const results = await calculateSwissPanchakaRahita(
            date, lat, lng, timezone, sunriseToday, sunsetToday, sunriseTmrw
        );
        console.log('Results:', JSON.stringify(results.slice(0, 3), null, 2));
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
