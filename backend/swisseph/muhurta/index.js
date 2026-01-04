/**
 * Muhurta Module API
 */

const Abhijit = require('./abhijit');
const RahuKala = require('./rahuKala');
const Brahma = require('./brahma');
const Choghadiya = require('./timings'); // Alias old timings to preserve Choghadiya logic for now

const abhijitCalc = new Abhijit();
const rahuCalc = new RahuKala();
const brahmaCalc = new Brahma();

module.exports = {
    Abhijit: abhijitCalc,
    RahuKala: rahuCalc,
    Brahma: brahmaCalc,

// Re-export functions expected by panchangHelper
    calculateGulikaKalam: (start, end, day) => Choghadiya.calculateGulikaKalam(start, end, day),
    calculateYamaganda: (start, end, day) => Choghadiya.calculateYamaganda(start, end, day),
    calculateBrahmaMuhurta: (sunrise) => brahmaCalc.calculate(sunrise), 
    calculateChoghadiya: (date, sunrise, sunset, nextSunrise) => Choghadiya.calculateChoghadiya(date, sunrise, sunset, nextSunrise),
    
    // Legacy support
    calculateNote: Choghadiya.calculateNote,
    getTimedTable: Choghadiya.getTimedTable
};
