/**
 * Hora Timings Calculator
 */

const BaseCalculator = require('../core/baseCalculator');

class Hora extends BaseCalculator {
    constructor() {
        super();
        // Vedic Hora sequence: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
        this.PLANET_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

        // Starting planet index for each weekday (0=Sun, 1=Mon, ..., 6=Sat)
        this.WEEKDAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4];
    }

    /**
     * Calculate 24 Horas for a day
     * @param {number} weekday - 0 for Sunday, 1 for Monday, etc.
     * @param {Date} sunrise - Sunrise UTC Date
     * @param {Date} sunset - Sunset UTC Date
     * @param {Date} nextSunrise - Next day Sunrise UTC Date
     */
    calculate(weekday, sunrise, sunset, nextSunrise) {
        const startPlanetIndex = this.WEEKDAY_START_INDEX[weekday];

        const dayDuration = sunset.getTime() - sunrise.getTime();
        const nightDuration = nextSunrise.getTime() - sunset.getTime();

        const dayHoraLength = dayDuration / 12;
        const nightHoraLength = nightDuration / 12;

        const horas = [];

        // 24 Horas cycle
        for (let i = 0; i < 24; i++) {
            const isDay = i < 12;
            let startTime, endTime;

            if (isDay) {
                startTime = new Date(sunrise.getTime() + (i * dayHoraLength));
                endTime = new Date(sunrise.getTime() + ((i + 1) * dayHoraLength));
            } else {
                startTime = new Date(sunset.getTime() + ((i - 12) * nightHoraLength));
                endTime = new Date(sunset.getTime() + ((i - 11) * nightHoraLength));
            }

            // Planet lord cycle
            const planetIndex = (startPlanetIndex + i) % 7;

            horas.push({
                index: i + 1,
                lord: this.PLANET_ORDER[planetIndex],
                type: isDay ? 'Day' : 'Night',
                start: startTime.toISOString(),
                end: endTime.toISOString()
            });
        }

        return horas;
    }
}

module.exports = Hora;
