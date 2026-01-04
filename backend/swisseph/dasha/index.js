/**
 * Dasha Module API
 */

const Vimshottari = require('./vimshottari');
const dasha = new Vimshottari();

module.exports = {
    calculateVimshottari: (moonLong, birthDate) => dasha.calculateVimshottari(moonLong, birthDate)
};
