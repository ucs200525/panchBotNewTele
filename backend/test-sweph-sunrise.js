const swisseph = require('sweph');
const path = require('path');

if (swisseph.constants) {
    Object.assign(swisseph, swisseph.constants);
}

const ephePath = path.join(__dirname, 'data', 'ephe');
try {
    swisseph.set_ephe_path(ephePath);
} catch (e) {
    console.error(e);
}

function calcSunTimeSwiss(lat, lng, dateStr, isSunrise) {
    const SE_SUN = 0;
    const SEFLG_SWIEPH = 2;
    const SE_CALC_RISE = 1;
    const SE_CALC_SET = 2;
    const SE_GREG_CAL = 1;

    const [year, month, day] = dateStr.split('-').map(Number);
    let jd = swisseph.julday(year, month, day, 12, SE_GREG_CAL);
    
    console.log('JD:', jd);
    const rsmi = isSunrise ? SE_CALC_RISE : SE_CALC_SET;
    
    try {
        const result = swisseph.rise_trans(jd, SE_SUN, null, SEFLG_SWIEPH, rsmi, [lng, lat, 0], 1013.25, 15);
        console.log('Result:', result);
        if (result && result.data !== undefined) {
            const revDate = swisseph.revjul(result.data, SE_GREG_CAL);
            console.log('RevDate:', revDate);
            const d = revDate;
            const hourDec = d.hour;
            const hour = Math.floor(hourDec);
            const minDec = (hourDec - hour) * 60;
            const min = Math.floor(minDec);
            const sec = Math.floor((minDec - min) * 60);

            const utcDate = new Date(Date.UTC(d.year, d.month - 1, d.day, hour, min, sec));
            console.log('UTC Date:', utcDate);
            return utcDate.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
        }
    } catch (e) {
        console.error('Error in calc:', e);
    }
    return null;
}

const time = calcSunTimeSwiss(17.3850, 78.4867, '2023-10-15', true); // Hyderabad Sunrise
console.log('Result formatted time:', time);
