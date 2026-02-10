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

            // Calculate Abhijit Lagna (auspicious midday lagna)
            abhijitLagna: calculateAbhijitLagna(dateObj, lat, lng, timezone, sunriseStr, sunsetStr),

            // Calculate Brahma Muhurta
            brahmaMuhurat: calculateBrahmaMuhurta(sunriseStr),

            // Calculate Choghadiya (Day and Night muhurta timings)
            choghadiya: calculateChoghadiya(dateObj, sunriseStr, sunsetStr, formattedSunrise, formattedSunset),

            // Calculate Dur Muhurat (inauspicious periods)
            durMuhurat: calculateDurMuhurat(dateObj, sunriseStr, sunsetStr),

            // Calculate Varjyam (5th inauspicious element)
            varjyam: calculateVarjyam(dateObj, sunriseStr, sunsetStr, panchangaData.tithis?.[0]?.number),

            // Calculate Pancha Rahita Muhurat (periods free from ALL 5 inauspicious timings)
            // Pancha = 5: Rahu Kaal, Yamaganda, Gulika, Varjyam, Dur Muhurat
            panchaRahitaMuhurat: calculatePanchaRahitaMuhurat(
                dateObj,
                sunriseStr,
                sunsetStr,
                calculateRahuKaal(dateObj, formattedSunrise, formattedSunset),
                calculateYamaganda(dateObj, sunriseStr, sunsetStr),
                calculateGulika(dateObj, sunriseStr, sunsetStr),
                calculateVarjyam(dateObj, sunriseStr, sunsetStr, panchangaData.tithis?.[0]?.number),
                calculateDurMuhurat(dateObj, sunriseStr, sunsetStr)
            ),

            // Additional Vedic calendar info
            masa: panchanga.getMasa ? panchanga.getMasa(dateObj) : { name: 'Pausha', type: 'Lunar' },
            samvatsara: panchanga.getSamvatsara ? panchanga.getSamvatsara(dateObj) : { name: 'Vijaya', year: 2082 },
            rtu: panchanga.getRtu ? panchanga.getRtu(dateObj) : { name: 'Hemanta', season: 'Pre-winter' },

            // Enhanced Moon phase calculation
            moonPhase: calculateMoonPhase(panchangaData.tithis?.[0]?.number),

            // Vara (ruling lord)
            varaLord: getVaraLord(vara),

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

function calculateBrahmaMuhurta(sunriseStr) {
    try {
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const sunriseDate = new Date();
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        // Brahma Muhurta: 96 minutes before sunrise for 48 minutes
        const brahmStart = new Date(sunriseDate.getTime() - 96 * 60 * 1000);
        const brahmEnd = new Date(sunriseDate.getTime() - 48 * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(brahmStart),
            end: formatTime(brahmEnd),
            duration: '48 minutes'
        };
    } catch (error) {
        console.error('Error calculating Brahma Muhurta:', error);
        return { start: 'N/A', end: 'N/A', duration: 'N/A' };
    }
}

function calculateChoghadiya(dateObj, sunriseStr, sunsetStr, formattedSunrise, formattedSunset) {
    try {
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        const nextSunrise = new Date(sunriseDate.getTime() + 24 * 60 * 60 * 1000);

        const dayDuration = (sunsetDate - sunriseDate) / (8 * 60 * 1000); // 8 parts in minutes
        const nightDuration = (nextSunrise - sunsetDate) / (8 * 60 * 1000);

        const weekday = dateObj.getDay();
        // Choghadiya names
        const dayOrder = [
            ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],  // Sunday
            ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],     // Monday
            ['Labh', 'Amrit', 'Kaal', 'Rog', 'Udveg', 'Shubh', 'Char', 'Labh'],     // Tuesday
            ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],      // Wednesday
            ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],    // Thursday
            ['Char', 'Rog', 'Kaal', 'Labh', 'Amrit', 'Shubh', 'Rog', 'Char'],       // Friday
            ['Labh', 'Amrit', 'Shubh', 'Rog', 'Udveg', 'Char', 'Kaal', 'Labh']      // Saturday
        ];

        const nightOrder = [
            ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],    // Sunday night
            ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],    // Monday night
            ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],     // Tuesday night
            ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],      // Wednesday night
            ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],     // Thursday night
            ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],     // Friday night
            ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg']     // Saturday night
        ];

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const dayChoghadiya = [];
        const nightChoghadiya = [];

        // Day Choghadiya
        for (let i = 0; i < 8; i++) {
            const start = new Date(sunriseDate.getTime() + i * dayDuration * 60 * 1000);
            const end = new Date(sunriseDate.getTime() + (i + 1) * dayDuration * 60 * 1000);
            const name = dayOrder[weekday][i];
            const type = ['Amrit', 'Shubh', 'Labh', 'Char'].includes(name) ? 'Good' : 'Bad';

            dayChoghadiya.push({
                name,
                type,
                start: formatTime(start),
                end: formatTime(end)
            });
        }

        // Night Choghadiya
        for (let i = 0; i < 8; i++) {
            const start = new Date(sunsetDate.getTime() + i * nightDuration * 60 * 1000);
            const end = new Date(sunsetDate.getTime() + (i + 1) * nightDuration * 60 * 1000);
            const name = nightOrder[weekday][i];
            const type = ['Amrit', 'Shubh', 'Labh', 'Char'].includes(name) ? 'Good' : 'Bad';

            nightChoghadiya.push({
                name,
                type,
                start: formatTime(start),
                end: formatTime(end)
            });
        }

        return {
            day: dayChoghadiya,
            night: nightChoghadiya
        };
    } catch (error) {
        console.error('Error calculating Choghadiya:', error);
        return { day: [], night: [] };
    }
}

function calculateDurMuhurat(dateObj, sunriseStr, sunsetStr) {
    try {
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        const dayDuration = (sunsetDate - sunriseDate) / (30 * 60 * 1000); // 30 muhurtas

        const weekday = dateObj.getDay();
        // Dur Muhurat positions for each day (0-indexed, out of 30)
        const durMuhuratPositions = [
            [11, 12, 28],      // Sunday: 12th, 13th, 29th
            [14, 15, 27],      // Monday: 15th, 16th, 28th
            [9, 10, 25],       // Tuesday: 10th, 11th, 26th
            [17, 18, 29],      // Wednesday: 18th, 19th, 30th
            [7, 8, 22],        // Thursday: 8th, 9th, 23rd
            [5, 6, 20],        // Friday: 6th, 7th, 21st
            [2, 3, 18]         // Saturday: 3rd, 4th, 19th
        ];

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const positions = durMuhuratPositions[weekday];
        const durMuhurtas = positions.map((pos, idx) => {
            const start = new Date(sunriseDate.getTime() + pos * dayDuration * 60 * 1000);
            const end = new Date(sunriseDate.getTime() + (pos + 1) * dayDuration * 60 * 1000);

            return {
                name: `Dur Muhurat ${idx + 1}`,
                start: formatTime(start),
                end: formatTime(end)
            };
        });

        return durMuhurtas;
    } catch (error) {
        console.error('Error calculating Dur Muhurat:', error);
        return [];
    }
}

function calculateMoonPhase(tithiNumber) {
    if (!tithiNumber) {
        return {
            name: 'Unknown',
            percentage: 0,
            illumination: 'N/A'
        };
    }

    // Calculate moon phase based on Tithi
    const phases = [
        { name: 'New Moon', range: [0, 1] },
        { name: 'Waxing Crescent', range: [1, 7] },
        { name: 'First Quarter', range: [7, 9] },
        { name: 'Waxing Gibbous', range: [9, 14] },
        { name: 'Full Moon', range: [14, 16] },
        { name: 'Waning Gibbous', range: [16, 22] },
        { name: 'Last Quarter', range: [22, 24] },
        { name: 'Waning Crescent', range: [24, 30] }
    ];

    let phaseName = 'Unknown';
    for (const phase of phases) {
        if (tithiNumber >= phase.range[0] && tithiNumber < phase.range[1]) {
            phaseName = phase.name;
            break;
        }
    }

    // Calculate illumination percentage
    const percentage = Math.round((tithiNumber / 30) * 100);
    const illumination = tithiNumber <= 15 ? `${Math.round((tithiNumber / 15) * 100)}%` : `${Math.round(((30 - tithiNumber) / 15) * 100)}%`;

    return {
        name: phaseName,
        percentage,
        illumination,
        emoji: getMoonEmoji(tithiNumber)
    };
}

function getMoonEmoji(tithiNumber) {
    if (tithiNumber === 0 || tithiNumber === 30) return '🌑';
    if (tithiNumber === 15) return '🌕';
    if (tithiNumber < 7) return '🌒';
    if (tithiNumber < 9) return '🌓';
    if (tithiNumber < 15) return '🌔';
    if (tithiNumber < 22) return '🌖';
    if (tithiNumber < 24) return '🌗';
    return '🌘';
}

function calculateAbhijitLagna(dateObj, lat, lng, timezone, sunriseStr, sunsetStr) {
    try {
        // Abhijit Lagna is when Cancer (Karkata) rises, which is auspicious
        // It occurs around midday for about 24 minutes
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        // Calculate noon time (midpoint of the day)
        const dayDuration = (sunsetDate - sunriseDate);
        const noonTime = new Date(sunriseDate.getTime() + dayDuration / 2);

        // Use Swiss Ephemeris to find when Cancer (Karkata) lagna rises
        // Cancer is the 4th sign, so we look for lagna in Cancer
        // For now, we'll use the traditional calculation: 8 ghatis after sunrise
        // (1 ghati = 24 minutes, so 8 ghatis = 192 minutes = 3 hours 12 minutes)

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Try to use lagnaModule to get exact Cancer lagna timing
        if (lagnaModule && lagnaModule.calculateDayLagnas) {
            try {
                const lagnas = lagnaModule.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr);
                // Find Karkata (Cancer) lagna
                const cancerLagna = lagnas.find(l => l.name === 'Karkata' || l.number === 4);

                if (cancerLagna && cancerLagna.startTime && cancerLagna.endTime) {
                    return {
                        name: 'Abhijit Lagna (Karkata)',
                        start: cancerLagna.startTime,
                        end: cancerLagna.endTime,
                        rashi: cancerLagna.name,
                        description: 'Most auspicious Cancer lagna period'
                    };
                }
            } catch (lagnaError) {
                console.warn('Could not calculate exact Cancer lagna, using traditional method:', lagnaError);
            }
        }

        // Fallback: Traditional calculation around noon
        const abhijitStart = new Date(noonTime.getTime() - 12 * 60 * 1000);
        const abhijitEnd = new Date(noonTime.getTime() + 12 * 60 * 1000);

        return {
            name: 'Abhijit Lagna (Approx.)',
            start: formatTime(abhijitStart),
            end: formatTime(abhijitEnd),
            rashi: 'Karkata (Cancer)',
            description: 'Auspicious midday period (approximate)'
        };
    } catch (error) {
        console.error('Error calculating Abhijit Lagna:', error);
        return {
            name: 'Abhijit Lagna',
            start: 'N/A',
            end: 'N/A',
            rashi: 'N/A',
            description: 'Could not calculate'
        };
    }
}

function calculatePanchaRahitaMuhurat(dateObj, sunriseStr, sunsetStr, rahuKaal, yamaganda, gulika, varjyam, durMuhurtas) {
    try {
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        // Parse time string to Date object
        const parseTimeToDate = (timeStr) => {
            if (!timeStr || timeStr === 'N/A') return null;
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

        // Collect all inauspicious periods
        const inauspiciousPeriods = [];

        // Add Rahu Kaal
        if (rahuKaal && rahuKaal.start && rahuKaal.end) {
            const start = parseTimeToDate(rahuKaal.start);
            const end = parseTimeToDate(rahuKaal.end);
            if (start && end) {
                inauspiciousPeriods.push({ name: 'Rahu Kaal', start, end });
            }
        }

        // Add Yamaganda
        if (yamaganda && yamaganda.start && yamaganda.end) {
            const start = parseTimeToDate(yamaganda.start);
            const end = parseTimeToDate(yamaganda.end);
            if (start && end) {
                inauspiciousPeriods.push({ name: 'Yamaganda', start, end });
            }
        }

        // Add Gulika
        if (gulika && gulika.start && gulika.end) {
            const start = parseTimeToDate(gulika.start);
            const end = parseTimeToDate(gulika.end);
            if (start && end) {
                inauspiciousPeriods.push({ name: 'Gulika', start, end });
            }
        }

        // Add Varjyam (5th element!)
        if (varjyam && varjyam.start && varjyam.end) {
            const start = parseTimeToDate(varjyam.start);
            const end = parseTimeToDate(varjyam.end);
            if (start && end) {
                inauspiciousPeriods.push({ name: 'Varjyam', start, end });
            }
        }

        // Add Dur Muhurtas
        if (durMuhurtas && Array.isArray(durMuhurtas)) {
            durMuhurtas.forEach(dur => {
                const start = parseTimeToDate(dur.start);
                const end = parseTimeToDate(dur.end);
                if (start && end) {
                    inauspiciousPeriods.push({ name: dur.name, start, end });
                }
            });
        }

        // Sort periods by start time
        inauspiciousPeriods.sort((a, b) => a.start - b.start);

        // Find gaps (Pancha Rahita periods)
        const panchaRahitaPeriods = [];
        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Check from sunrise to first inauspicious period
        if (inauspiciousPeriods.length > 0 && inauspiciousPeriods[0].start > sunriseDate) {
            const duration = Math.round((inauspiciousPeriods[0].start - sunriseDate) / (1000 * 60));
            if (duration >= 20) { // Only include if at least 20 minutes
                panchaRahitaPeriods.push({
                    start: formatTime(sunriseDate),
                    end: formatTime(inauspiciousPeriods[0].start),
                    duration: `${duration} minutes`
                });
            }
        }

        // Check gaps between inauspicious periods
        for (let i = 0; i < inauspiciousPeriods.length - 1; i++) {
            const currentEnd = inauspiciousPeriods[i].end;
            const nextStart = inauspiciousPeriods[i + 1].start;

            if (nextStart > currentEnd) {
                const duration = Math.round((nextStart - currentEnd) / (1000 * 60));
                if (duration >= 20) { // Only include if at least 20 minutes
                    panchaRahitaPeriods.push({
                        start: formatTime(currentEnd),
                        end: formatTime(nextStart),
                        duration: `${duration} minutes`
                    });
                }
            }
        }

        // Check from last inauspicious period to sunset
        if (inauspiciousPeriods.length > 0) {
            const lastPeriod = inauspiciousPeriods[inauspiciousPeriods.length - 1];
            if (lastPeriod.end < sunsetDate) {
                const duration = Math.round((sunsetDate - lastPeriod.end) / (1000 * 60));
                if (duration >= 20) { // Only include if at least 20 minutes
                    panchaRahitaPeriods.push({
                        start: formatTime(lastPeriod.end),
                        end: formatTime(sunsetDate),
                        duration: `${duration} minutes`
                    });
                }
            }
        }

        // If no inauspicious periods, the whole day is Pancha Rahita (unlikely but possible)
        if (inauspiciousPeriods.length === 0) {
            const duration = Math.round((sunsetDate - sunriseDate) / (1000 * 60));
            panchaRahitaPeriods.push({
                start: formatTime(sunriseDate),
                end: formatTime(sunsetDate),
                duration: `${duration} minutes`
            });
        }

        return panchaRahitaPeriods;
    } catch (error) {
        console.error('Error calculating Pancha Rahita Muhurat:', error);
        return [];
    }
}

function calculateVarjyam(dateObj, sunriseStr, sunsetStr, tithiNumber) {
    try {
        // Varjyam is inauspicious period based on Tithi number
        // Each Tithi has specific Varjyam duration in ghatis (1 ghati = 24 minutes)

        // Varjyam durations in ghatis for each Tithi (1-30)
        const varjyamGhatis = {
            1: 3,   // Pratipada - 3 ghatis
            2: 2.5, // Dwitiya - 2.5 ghatis
            3: 1.5, // Tritiya - 1.5 ghatis
            4: 2,   // Chaturthi - 2 ghatis
            5: 2,   // Panchami - 2 ghatis
            6: 4,   // Shashthi - 4 ghatis
            7: 2,   // Saptami - 2 ghatis
            8: 1.5, // Ashtami - 1.5 ghatis
            9: 2.5, // Navami - 2.5 ghatis
            10: 3,  // Dashami - 3 ghatis
            11: 2,  // Ekadashi - 2 ghatis
            12: 1,  // Dwadashi - 1 ghati
            13: 1.5,// Trayodashi - 1.5 ghatis
            14: 2,  // Chaturdashi - 2 ghatis
            15: 0,  // Purnima/Amavasya - No Varjyam (highly auspicious/inauspicious respectively)
            16: 3,  // Pratipada (Krishna) - 3 ghatis
            17: 2.5,// Dwitiya (Krishna) - 2.5 ghatis
            18: 1.5,// Tritiya (Krishna) - 1.5 ghatis
            19: 2,  // Chaturthi (Krishna) - 2 ghatis
            20: 2,  // Panchami (Krishna) - 2 ghatis
            21: 4,  // Shashthi (Krishna) - 4 ghatis
            22: 2,  // Saptami (Krishna) - 2 ghatis
            23: 1.5,// Ashtami (Krishna) - 1.5 ghatis
            24: 2.5,// Navami (Krishna) - 2.5 ghatis
            25: 3,  // Dashami (Krishna) - 3 ghatis
            26: 2,  // Ekadashi (Krishna) - 2 ghatis
            27: 1,  // Dwadashi (Krishna) - 1 ghati
            28: 1.5,// Trayodashi (Krishna) - 1.5 ghatis
            29: 2,  // Chaturdashi (Krishna) - 2 ghatis
            30: 0   // Amavasya - No Varjyam
        };

        const varjyamDurationGhatis = varjyamGhatis[tithiNumber] || 2;

        if (varjyamDurationGhatis === 0) {
            return null; // No Varjyam for Purnima/Amavasya
        }

        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = new Date(dateObj);
        sunriseDate.setHours(sh, sm, ss || 0, 0);

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        // Calculate day duration
        const dayDuration = (sunsetDate - sunriseDate) / 1000; // in seconds
        const oneGhati = dayDuration / 60; // 1 ghati = 1/60th of day duration

        // Varjyam timing varies by Tithi - calculated from noon
        const noonTime = new Date(sunriseDate.getTime() + (dayDuration * 1000) / 2);

        // Calculate Varjyam start - typically in afternoon
        const varjyamStartOffset = oneGhati * 30 * 1000; // Around midday
        const varjyamStart = new Date(noonTime.getTime() - varjyamStartOffset / 2);

        // Calculate Varjyam end
        const varjyamDuration = varjyamDurationGhatis * oneGhati * 1000;
        const varjyamEnd = new Date(varjyamStart.getTime() + varjyamDuration);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const calculateDuration = (start, end) => {
            const durationMs = end - start;
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes} minutes`;
        };

        return {
            start: formatTime(varjyamStart),
            end: formatTime(varjyamEnd),
            duration: calculateDuration(varjyamStart, varjyamEnd),
            ghatis: varjyamDurationGhatis
        };
    } catch (error) {
        console.error('Error calculating Varjyam:', error);
        return null;
    }
}

function getVaraLord(vara) {
    const varaLords = {
        'Sunday': { lord: 'Surya (Sun)', planet: 'Sun ☉', color: 'Red', gemstone: 'Ruby' },
        'Monday': { lord: 'Chandra (Moon)', planet: 'Moon ☽', color: 'White', gemstone: 'Pearl' },
        'Tuesday': { lord: 'Mangala (Mars)', planet: 'Mars ♂', color: 'Red', gemstone: 'Coral' },
        'Wednesday': { lord: 'Budha (Mercury)', planet: 'Mercury ☿', color: 'Green', gemstone: 'Emerald' },
        'Thursday': { lord: 'Guru (Jupiter)', planet: 'Jupiter ♃', color: 'Yellow', gemstone: 'Yellow Sapphire' },
        'Friday': { lord: 'Shukra (Venus)', planet: 'Venus ♀', color: 'White', gemstone: 'Diamond' },
        'Saturday': { lord: 'Shani (Saturn)', planet: 'Saturn ♄', color: 'Black', gemstone: 'Blue Sapphire' }
    };

    return varaLords[vara] || { lord: 'Unknown', planet: 'N/A', color: 'N/A', gemstone: 'N/A' };
}

module.exports = { calculatePanchangData, getTimezoneFromCoordinates };

