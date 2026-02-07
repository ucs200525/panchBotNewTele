/**
 * Calculate comprehensive Panchang data using Swiss Ephemeris
 * No external dependencies required - uses built-in swisseph modules
 */

const { panchanga, julianDay, muhurta, lagna: lagnaModule } = require('../swisseph');
const { swisseph, useNative } = require('../swisseph/core/config');

async function calculatePanchangData(city, date, lat, lng, sunriseStr, sunsetStr, includeTransitions = true) {
    try {
        // Parse date string
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);

        const timezone = getTimezoneFromCoordinates(lat, lng);

        console.log(`🕉️  Calculating Panchanga using Swiss Ephemeris for: ${city} on ${date}`);
        console.log(`  Coordinates: ${lat}, ${lng}`);
        console.log(`  Timezone: ${timezone}`);
        console.log(`  Using: ${useNative ? 'Native SwissEph' : 'JavaScript Fallback'}`);

        // Calculate all Panchanga elements
        const panchangaData = panchanga.calculateDayPanchanga(dateObj, timezone);

        // Format time helper
        const formatTime = (dateInput) => {
            if (!dateInput) return 'N/A';
            if (typeof dateInput === 'string') return dateInput;

            const d = new Date(dateInput);
            return d.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Parse sunrise/sunset times safely
        const parseTime = (str) => {
            const clean = str.toLowerCase().replace(/[ap]m/, '').trim();
            const parts = clean.split(':').map(Number);
            let h = parts[0];
            const m = parts[1] || 0;
            const s = parts[2] || 0;
            if (str.toLowerCase().includes('pm') && h < 12) h += 12;
            if (str.toLowerCase().includes('am') && h === 12) h = 0;
            return { h, m, s };
        };

        const sunr = parseTime(sunriseStr);
        const suns = parseTime(sunsetStr);

        const sunriseHour = sunr.h;
        const sunriseMin = sunr.m;
        const sunriseSec = sunr.s;

        const sunsetHour = suns.h;
        const sunsetMin = suns.m;
        const sunsetSec = suns.s;

        const formatProvidedTime = (hour, min, sec) => {
            const d = new Date();
            d.setHours(hour, min, sec || 0);
            return d.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const formattedSunrise = formatProvidedTime(sunriseHour, sunriseMin, sunriseSec);
        const formattedSunset = formatProvidedTime(sunsetHour, sunsetMin, sunsetSec);

        // Get weekday
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const vara = weekdays[dateObj.getDay()];

        // Build comprehensive response
        return {
            city,
            date,

            // Sun timings
            sunrise: formattedSunrise,
            sunset: formattedSunset,

            // Core Panchanga elements
            tithis: panchangaData.tithis || [],
            nakshatras: panchangaData.nakshatras || [],
            yogas: panchangaData.yogas || [],
            karanas: panchangaData.karanas || [],

            // Backward compatibility - use first element
            tithi: panchangaData.tithis?.[0] || { name: 'N/A', number: 0, paksha: 'N/A' },
            nakshatra: panchangaData.nakshatras?.[0] || { name: 'N/A', number: 0 },
            yoga: panchangaData.yogas?.[0] || { name: 'N/A', number: 0 },
            karana: panchangaData.karanas?.[0] || { name: 'N/A', number: 0 },

            vara: vara,
            weekday: vara,

            // Paksha
            paksha: panchangaData.paksha?.name || (panchangaData.tithis?.[0]?.paksha) || 'N/A',

            // Moon phase (simplified)
            moonPhase: panchangaData.tithis?.[0]?.number <= 15 ? 'Waxing' : 'Waning',

            // Calculate Abhijit Muhurat
            abhijitMuhurat: calculateAbhijitMuhurat(sunriseStr, sunsetStr),

            // Calculate Rahu Kaal
            rahuKaal: calculateRahuKaal(dateObj, formattedSunrise, formattedSunset),

            // Gulika, Yamaganda using muhurta module if available
            gulika: calculateGulika(dateObj, sunriseStr, sunsetStr),
            yamaganda: calculateYamaganda(dateObj, sunriseStr, sunsetStr),

            // Calculate Lagnas (Daily transitions)
            lagnas: lagnaModule.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr),

            // Additional info
            moonSign: 'N/A',  // Can be calculated if needed
            sunSign: 'N/A',   // Can be calculated if needed

            _timezone: timezone,
            _useNative: useNative
        };

    } catch (error) {
        console.error('❌ Error calculating Panchang data:', error);
        console.error(error.stack);
        throw error;
    }
}

function getTimezoneFromCoordinates(lat, lng) {
    // India
    if (lat >= 8 && lat <= 35 && lng >= 68 && lng <= 97) {
        return 'Asia/Kolkata';
    }
    // USA East Coast
    if (lat >= 24 && lat <= 47 && lng >= -85 && lng <= -67) {
        return 'America/New_York';
    }
    // USA West Coast
    if (lat >= 32 && lat <= 49 && lng >= -125 && lng <= -114) {
        return 'America/Los_Angeles';
    }
    // UK
    if (lat >= 50 && lat <= 59 && lng >= -8 && lng <= 2) {
        return 'Europe/London';
    }
    return 'Asia/Kolkata';
}

function calculateDuration(start, end) {
    if (!start || !end) return 'N/A';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const minutes = Math.round((endTime - startTime) / (1000 * 60));
    return `${minutes} minutes`;
}

function calculateAbhijitMuhurat(sunriseStr, sunsetStr) {
    try {
        const [sunriseHour, sunriseMin, sunriseSec = 0] = sunriseStr.split(':').map(Number);
        const [sunsetHour, sunsetMin, sunsetSec = 0] = sunsetStr.split(':').map(Number);

        const sunriseTime = new Date();
        sunriseTime.setHours(sunriseHour, sunriseMin, sunriseSec, 0);

        const sunsetTime = new Date();
        sunsetTime.setHours(sunsetHour, sunsetMin, sunsetSec, 0);

        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60);
        const noonTime = new Date(sunriseTime.getTime() + (dayDuration / 2) * 60 * 1000);
        const abhijitStart = new Date(noonTime.getTime() - 12 * 60 * 1000);
        const abhijitEnd = new Date(noonTime.getTime() + 12 * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(abhijitStart),
            end: formatTime(abhijitEnd),
            duration: '24 minutes'
        };
    } catch (error) {
        return { start: 'N/A', end: 'N/A', duration: 'N/A' };
    }
}

function calculateRahuKaal(dateObj, sunrise, sunset) {
    try {
        const weekday = dateObj.getDay();
        // Rahu Kaal periods (1/8th of day duration, starting from sunrise)
        const rahuPeriods = [5, 1, 6, 3, 7, 4, 2]; // Sun to Sat (0-6)
        const periodIndex = rahuPeriods[weekday];

        // Parse formatted time strings like "07:04 am" or "06:06 pm"
        const parseFormattedTime = (timeStr) => {
            const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
            if (!match) return null;

            let [, hours, minutes, period] = match;
            hours = parseInt(hours);
            minutes = parseInt(minutes);

            // Convert to 24-hour format
            if (period.toLowerCase() === 'pm' && hours !== 12) {
                hours += 12;
            } else if (period.toLowerCase() === 'am' && hours === 12) {
                hours = 0;
            }

            const time = new Date(dateObj);
            time.setHours(hours, minutes, 0, 0);
            return time;
        };

        const sunriseTime = parseFormattedTime(sunrise);
        const sunsetTime = parseFormattedTime(sunset);

        if (!sunriseTime || !sunsetTime) {
            return null;
        }

        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const rahuStart = new Date(sunriseTime.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const rahuEnd = new Date(rahuStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(rahuStart),
            end: formatTime(rahuEnd),
            duration: calculateDuration(rahuStart, rahuEnd)
        };
    } catch (error) {
        console.error('Error calculating Rahu Kaal:', error);
        return null;
    }
}

function calculateGulika(dateObj, sunriseStr, sunsetStr) {
    try {
        // Gulika Kaal periods (similar to Rahu Kaal but different sequence)
        const weekday = dateObj.getDay();
        const gulikaPeriods = [7, 5, 4, 3, 2, 1, 6]; // Sun to Sat (0-6)
        const periodIndex = gulikaPeriods[weekday];

        // Parse sunrise/sunset times  
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        const dayDuration = (sunsetDate - sunriseDate) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const gulikaStart = new Date(sunriseDate.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const gulikaEnd = new Date(gulikaStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(gulikaStart),
            end: formatTime(gulikaEnd),
            duration: calculateDuration(gulikaStart, gulikaEnd)
        };
    } catch (error) {
        console.error('Error calculating Gulika:', error);
        return null;
    }
}

function calculateYamaganda(dateObj, sunriseStr, sunsetStr) {
    try {
        // Yamaganda periods
        const weekday = dateObj.getDay();
        const yamagandaPeriods = [4, 7, 5, 3, 6, 2, 1]; // Sun to Sat (0-6)
        const periodIndex = yamagandaPeriods[weekday];

        // Parse sunrise/sunset times
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        const dayDuration = (sunsetDate - sunriseDate) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const yamagandaStart = new Date(sunriseDate.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const yamagandaEnd = new Date(yamagandaStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(yamagandaStart),
            end: formatTime(yamagandaEnd),
            duration: calculateDuration(yamagandaStart, yamagandaEnd)
        };
    } catch (error) {
        console.error('Error calculating Yamaganda:', error);
        return null;
    }
}

module.exports = { calculatePanchangData };
