/**
 * Hora Timings Calculator
 */

const BaseCalculator = require('../core/baseCalculator');

class Hora extends BaseCalculator {
    constructor() {
        super();
        this.PLANET_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
        // Mapping from weekday (0=Sun, 1=Mon...) to starting planet index in PLANET_ORDER
        // Sun(0) -> Sun(0)
        // Mon(1) -> Moon(3)
        // Tue(2) -> Mars(6)
        // Wed(3) -> Mercury(2)
        // Thu(4) -> Jupiter(5)
        // Fri(5) -> Venus(1)
        // Sat(6) -> Saturn(4)
        this.WEEKDAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4];
    }

    calculate(date, sunrise, sunset, nextSunrise) {
        const weekday = date.getDay();
        const startPlanetIndex = this.WEEKDAY_START_INDEX[weekday];
        
        const dayDuration = sunset.getTime() - sunrise.getTime();
        const nightDuration = nextSunrise.getTime() - sunset.getTime();
        
        const dayHoraLength = dayDuration / 12;
        const nightHoraLength = nightDuration / 12;
        
        const horas = [];
        
        // Calculate 24 Horas
        for (let i = 0; i < 24; i++) {
            const isDay = i < 12;
            const startTime = isDay 
                ? new Date(sunrise.getTime() + (i * dayHoraLength))
                : new Date(sunset.getTime() + ((i - 12) * nightHoraLength));
            
            const endTime = isDay
                ? new Date(sunrise.getTime() + ((i + 1) * dayHoraLength))
                : new Date(sunset.getTime() + ((i - 11) * nightHoraLength));

            // Planet index increments by 1 for each hora, cycling through 7 planets
            const planetIndex = (startPlanetIndex + i) % 7;
            
            horas.push({
                index: i + 1,
                lord: this.PLANET_ORDER[planetIndex],
                type: isDay ? 'Day' : 'Night',
                start: startTime,
                end: endTime
            });
        }
        
        return horas;
    }
}

module.exports = Hora;
