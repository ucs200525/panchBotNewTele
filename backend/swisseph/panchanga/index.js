/**
 * Panchanga Module
 * Calculates daily Panchanga elements with transitions
 */

const TithiCalculator = require('./tithiCalculator');
const NakshatraCalculator = require('./nakshatraCalculator');
const YogaCalculator = require('./yogaCalculator');
const KaranaCalculator = require('./karanaCalculator');
const PakshaCalculator = require('./paksha');

// Create instances
const tithiCalc = new TithiCalculator();
const nakshatraCalc = new NakshatraCalculator();
const yogaCalc = new YogaCalculator();
const karanaCalc = new KaranaCalculator();
const pakshaCalc = new PakshaCalculator();

/**
 * Calculate all Panchanga elements for the day
 */
function calculateDayPanchanga(date, timezone = 'Asia/Kolkata') {
    console.log('🕉️  Calculating Panchanga with Swiss Ephemeris...');
    
    const tithis = tithiCalc.calculateDayTithis(date, timezone);
    const nakshatras = nakshatraCalc.calculateDayNakshatras(date, timezone);
    const yogas = yogaCalc.calculateDayYogas(date, timezone);
    const karanas = karanaCalc.calculateDayKaranas(date, timezone);
    const paksha = pakshaCalc.getPakshaAtTime(date);
    
    console.log(`✅ Found ${tithis.length} Tithi(s), ${nakshatras.length} Nakshatra(s), ${yogas.length} Yoga(s), ${karanas.length} Karana(s)`);
    
    return {
        tithis,
        nakshatras,
        yogas,
        karanas,
        paksha
    };
}

module.exports = {
    TithiCalculator,
    NakshatraCalculator,
    YogaCalculator,
    KaranaCalculator,
    PakshaCalculator,
    calculateDayPanchanga,
    getPakshaAtTime: (date) => pakshaCalc.getPakshaAtTime(date),
    getMasa: (date) => ({ name: 'Pausha', type: 'Lunar' }),
    getSamvatsara: (date) => ({ name: 'Vijaya', year: 2082 }),
    getRtu: (date) => ({ name: 'Hemanta', season: 'Pre-winter' })
};
