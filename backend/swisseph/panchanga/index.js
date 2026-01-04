/**
 * Panchanga Module
 * Unified API for all Panchanga calculations
 */

const TithiCalculator = require('./tithi');
const NakshatraCalculator = require('./nakshatra');
const YogaCalculator = require('./yoga');
const KaranaCalculator = require('./karana');
const PakshaCalculator = require('./paksha');
const MasaCalculator = require('./masa');
const SamvatsaraCalculator = require('./samvatsara');
const RtuCalculator = require('./rtu');

const tithiCalc = new TithiCalculator();
const nakshatraCalc = new NakshatraCalculator();
const yogaCalc = new YogaCalculator();
const karanaCalc = new KaranaCalculator();
const pakshaCalc = new PakshaCalculator();
const masaCalc = new MasaCalculator();
const samvatsaraCalc = new SamvatsaraCalculator();
const rtuCalc = new RtuCalculator();

/**
 * Get all Panchanga elements for the day
 */
function calculateDayPanchanga(date, timezone = 'Asia/Kolkata') {
    console.log('\n🕉️  Calculating Complete Panchanga...\n');

    const samvatsaraData = samvatsaraCalc.getSamvatsara(date);
    const masaData = masaCalc.getLunarMasa(date);
    const rtuData = rtuCalc.getRtu(date);
    const pakshaData = pakshaCalc.getPakshaAtTime(date);

    return {
        tithis: tithiCalc.calculateDayTithis(date, timezone),
        nakshatras: nakshatraCalc.calculateDayNakshatras(date, timezone),
        yogas: yogaCalc.calculateDayYogas(date, timezone),
        karanas: karanaCalc.calculateDayKaranas(date, timezone),
        paksha: pakshaData,
        masa: masaData,
        rtu: rtuData,
        samvatsara: samvatsaraData
    };
}

module.exports = {
    TithiCalculator,
    NakshatraCalculator,
    YogaCalculator,
    KaranaCalculator,
    PakshaCalculator,
    MasaCalculator,
    SamvatsaraCalculator,
    RtuCalculator,
    
    // API
    calculateDayPanchanga,
    getTithiAtTime: (date) => tithiCalc.getTithiAtTime(date),
    getNakshatraAtTime: (date) => nakshatraCalc.getNakshatraAtTime(date),
    getPakshaAtTime: (date) => pakshaCalc.getPakshaAtTime(date),
    getMasa: (date) => masaCalc.getLunarMasa(date),
    getSamvatsara: (date) => samvatsaraCalc.getSamvatsara(date),
    getRtu: (date) => rtuCalc.getRtu(date)
};
