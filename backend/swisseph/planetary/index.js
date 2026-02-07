/**
 * Planetary Module API
 */

const PlanetaryPositions = require('./positions');
const { PlanetaryCalculator } = require('./riseSet');

const posCalc = new PlanetaryPositions();
const riseSetCalc = new PlanetaryCalculator();

module.exports = {
    // Classes
    PlanetaryPositions,
    PlanetaryCalculator,

    // Instances/Functions
    getAllPlanetDetails: (date) => posCalc.getAllPlanetDetails(date),
    getMoonrise: (date, lat, lng) => riseSetCalc.getMoonrise(date, lat, lng),
    getMoonset: (date, lat, lng) => riseSetCalc.getMoonset(date, lat, lng),
    getSunrise: (date, lat, lng) => riseSetCalc.getSunrise(date, lat, lng),
    getSunset: (date, lat, lng) => riseSetCalc.getSunset(date, lat, lng),
    getPlanetPosition: (date, planetId) => posCalc.getPlanetPosition(date, planetId)
};
