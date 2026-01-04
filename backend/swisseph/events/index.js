/**
 * Events Module API
 */

const AstronomicalEvents = require('./astronomical');
const events = new AstronomicalEvents();

module.exports = {
    getEclipses: (date) => events.getEclipses(date)
};
