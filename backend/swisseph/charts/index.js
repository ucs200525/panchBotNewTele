/**
 * Charts Module API
 */

const RasiChart = require('./rasi');
const NavamsaChart = require('./navamsa');
const DasamsaChart = require('./dasamsa');

const rasi = new RasiChart();
const navamsa = new NavamsaChart();
const dasamsa = new DasamsaChart();

// Export unified API
module.exports = {
    calculateD1: (planets) => rasi.calculate(planets),
    calculateD9: (planets) => navamsa.calculate(planets),
    calculateD10: (planets) => dasamsa.calculate(planets),
    // Helper to get houses is available on any instance
    getHouses: (lagnaIdx, planets) => rasi.getHouses(lagnaIdx, planets)
};
