/**
 * Calculate comprehensive Panchang data using Swiss Ephemeris
 * No external dependencies required - uses built-in swisseph modules
 */

const { panchanga, julianDay, muhurta, lagna: lagnaModule } = require('../swisseph');
const { swisseph, useNative } = require('../swisseph/core/config');
const {
    getPartsInTimezone,
    getUtcDateForLocalTime,
    getStartOfDay,
    getEndOfDay,
    getUtcDateFromLocalTimeStr
} = require('./timezoneHelper');

async function calculatePanchangData(city, date, lat, lng, sunriseStr, sunsetStr, moonriseStr, moonsetStr, nextSunriseStr, includeTransitions = true) {
    try {
        const timezone = getTimezoneFromCoordinates(lat, lng);

        // Parse date string
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = getUtcDateForLocalTime(year, month, day, 12, 0, 0, timezone);

        console.log(`🕉️  Calculating Panchanga using Swiss Ephemeris for: ${city} on ${date}`);
        console.log(`  Coordinates: ${lat}, ${lng}`);
        console.log(`  Timezone: ${timezone}`);
        console.log(`  Using: ${useNative ? 'Native SwissEph' : 'JavaScript Fallback'}`);

        // Calculate all Panchanga elements
        const panchangaData = panchanga.calculateDayPanchanga(dateObj, timezone);

        // Format helper for provided times (sunrise, sunset, etc.)
        const formatProvidedTime = (hour, min, sec) => {
            if (isNaN(hour)) return 'N/A';
            const dateInTz = getUtcDateForLocalTime(year, month, day, hour, min, sec || 0, timezone);
            return dateInTz.toLocaleTimeString('en-IN', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const parseTime = (str) => {
            if (!str || str === 'N/A') return { h: NaN, m: 0, s: 0 };
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
        const moonr = parseTime(moonriseStr);
        const moons = parseTime(moonsetStr);

        const formattedSunrise = formatProvidedTime(sunr.h, sunr.m, sunr.s);
        const formattedSunset = formatProvidedTime(suns.h, suns.m, suns.s);
        const formattedMoonrise = formatProvidedTime(moonr.h, moonr.m, moonr.s);
        const formattedMoonset = formatProvidedTime(moons.h, moons.m, moons.s);

        // Get weekday (timezone independent)
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dateObjUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        const vara = weekdays[dateObjUtc.getUTCDay()];

        // Format helper for Lagna times
        const formatLagnaTime = (dateStr) => {
            if (!dateStr || dateStr === 'N/A') return 'N/A';
            try {
                const d = new Date(dateStr);
                return d.toLocaleTimeString('en-IN', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            } catch (e) {
                return dateStr;
            }
        };

        // Format lagnas
        const rawLagnas = panchangaData.lagnas || lagnaModule.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr);
        
        const formattedLagnas = rawLagnas.map(lagna => ({
            ...lagna,
            startTime: formatLagnaTime(lagna.startTime),
            endTime: formatLagnaTime(lagna.endTime)
        }));

        const rawPaksha = panchangaData.paksha?.name || (panchangaData.tithis?.[0]?.paksha) || 'N/A';
        const cleanPaksha = rawPaksha.replace(/\s*Paksha\s*/gi, '').trim();

        // Build comprehensive response
        return {
            city,
            date,

            // Sun & Moon timings
            sunrise: formattedSunrise,
            sunset: formattedSunset,
            moonrise: formattedMoonrise,
            moonset: formattedMoonset,

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
            paksha: cleanPaksha,

            // Moon phase (simplified)
            moonPhase: panchangaData.tithis?.[0]?.number <= 15 ? 'Waxing' : 'Waning',

            // Calculate Abhijit Muhurat
            abhijitMuhurat: calculateAbhijitMuhurat(sunriseStr, sunsetStr, dateObj, timezone),

            // Calculate Rahu Kaal
            rahuKaal: calculateRahuKaal(dateObj, formattedSunrise, formattedSunset, timezone),

            // Gulika, Yamaganda using muhurta module if available
            gulika: calculateGulika(dateObj, sunriseStr, sunsetStr, timezone),
            yamaganda: calculateYamaganda(dateObj, sunriseStr, sunsetStr, timezone),

            // Calculate Lagnas (Daily transitions)
            lagnas: formattedLagnas,

            // Calculate Abhijit Lagna (auspicious midday lagna)
            abhijitLagna: calculateAbhijitLagna(dateObj, lat, lng, timezone, sunriseStr, sunsetStr, rawLagnas),

            // Calculate Brahma Muhurta
            brahmaMuhurat: calculateBrahmaMuhurta(sunriseStr, dateObj, timezone),

            // Calculate Choghadiya (Day and Night muhurta timings)
            choghadiya: calculateChoghadiya(dateObj, sunriseStr, sunsetStr, formattedSunrise, formattedSunset, timezone),

            // Calculate Kaal Ratri (inauspicious night period)
            kaalRatri: calculateKaalRatri(dateObj, sunsetStr, nextSunriseStr, timezone),

            // Calculate Dur Muhurat (inauspicious periods)
            durMuhurat: calculateDurMuhurat(dateObj, sunriseStr, sunsetStr, timezone),

            // Calculate Varjyam (5th inauspicious element)
            varjyam: calculateVarjyam(dateObj, sunriseStr, sunsetStr, panchangaData.tithis?.[0]?.number, timezone),

            // Calculate Pancha Rahita Muhurat (periods free from ALL 5 inauspicious timings)
            panchaRahitaMuhurat: calculateSwissPanchakaRahita(dateObj, lat, lng, timezone, sunriseStr, sunsetStr, nextSunriseStr, rawLagnas),

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

function calculateAbhijitMuhurat(sunriseStr, sunsetStr, dateObj, timezone) {
    try {
        const sunriseTime = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetTime = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60);
        const noonTime = new Date(sunriseTime.getTime() + (dayDuration / 2) * 60 * 1000);
        const abhijitStart = new Date(noonTime.getTime() - 12 * 60 * 1000);
        const abhijitEnd = new Date(noonTime.getTime() + 12 * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateRahuKaal(dateObj, sunrise, sunset, timezone) {
    try {
        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

        // Rahu Kaal periods (1/8th of day duration, starting from sunrise)
        const rahuPeriods = [5, 1, 6, 3, 7, 4, 2]; // Sun to Sat (0-6)
        const periodIndex = rahuPeriods[weekday];

        const sunriseTime = getUtcDateFromLocalTimeStr(dateObj, sunrise, timezone);
        const sunsetTime = getUtcDateFromLocalTimeStr(dateObj, sunset, timezone);

        if (!sunriseTime || !sunsetTime) {
            return null;
        }

        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const rahuStart = new Date(sunriseTime.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const rahuEnd = new Date(rahuStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateGulika(dateObj, sunriseStr, sunsetStr, timezone) {
    try {
        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

        const gulikaPeriods = [7, 5, 4, 3, 2, 1, 6]; // Sun to Sat (0-6)
        const periodIndex = gulikaPeriods[weekday];

        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const dayDuration = (sunsetDate - sunriseDate) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const gulikaStart = new Date(sunriseDate.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const gulikaEnd = new Date(gulikaStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateYamaganda(dateObj, sunriseStr, sunsetStr, timezone) {
    try {
        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

        const yamagandaPeriods = [4, 7, 5, 3, 6, 2, 1]; // Sun to Sat (0-6)
        const periodIndex = yamagandaPeriods[weekday];

        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const dayDuration = (sunsetDate - sunriseDate) / (1000 * 60);
        const periodDuration = dayDuration / 8;

        const yamagandaStart = new Date(sunriseDate.getTime() + (periodIndex - 1) * periodDuration * 60 * 1000);
        const yamagandaEnd = new Date(yamagandaStart.getTime() + periodDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateBrahmaMuhurta(sunriseStr, dateObj, timezone) {
    try {
        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);

        // Brahma Muhurta: 96 minutes before sunrise for 48 minutes
        const brahmStart = new Date(sunriseDate.getTime() - 96 * 60 * 1000);
        const brahmEnd = new Date(sunriseDate.getTime() - 48 * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateChoghadiya(dateObj, sunriseStr, sunsetStr, formattedSunrise, formattedSunset, timezone) {
    try {
        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const nextSunrise = new Date(sunriseDate.getTime() + 24 * 60 * 60 * 1000);

        const dayDuration = (sunsetDate - sunriseDate) / (8 * 60 * 1000); // 8 parts in minutes
        const nightDuration = (nextSunrise - sunsetDate) / (8 * 60 * 1000);

        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

        // Correct Choghadiya sequences based on traditional Vedic astrology
        const dayOrder = [
            ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],  // Sunday (Sun)
            ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],  // Monday (Moon)
            ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],    // Tuesday (Mars)
            ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],   // Wednesday (Mercury)
            ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],  // Thursday (Jupiter)
            ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],   // Friday (Venus)
            ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal']    // Saturday (Saturn)
        ];

        const nightOrder = [
            ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],  // Sunday night
            ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],   // Monday night  
            ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],   // Tuesday night
            ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],  // Wednesday night
            ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],  // Thursday night
            ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],    // Friday night
            ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh']    // Saturday night
        ];

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateDurMuhurat(dateObj, sunriseStr, sunsetStr, timezone) {
    try {
        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const dayDuration = (sunsetDate - sunriseDate) / (30 * 60 * 1000); // 30 muhurtas

        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

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
                timeZone: timezone,
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

function calculateAbhijitLagna(dateObj, lat, lng, timezone, sunriseStr, sunsetStr, existingLagnas) {
    try {
        const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);

        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        // Calculate noon time (midpoint of the day)
        const dayDuration = (sunsetDate - sunriseDate);
        const noonTime = new Date(sunriseDate.getTime() + dayDuration / 2);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Try to use existingLagnas first or lagnaModule
        if (existingLagnas || (lagnaModule && lagnaModule.calculateDayLagnas)) {
            try {
                const lagnas = existingLagnas || lagnaModule.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr);
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

function calculateSwissPanchakaRahita(dateObj, lat, lng, timezone, sunriseStr, sunsetStr, nextSunriseStr, existingLagnas) {
    try {
        const tithiCalc = new panchanga.TithiCalculator();
        const naksCalc = new panchanga.NakshatraCalculator();
        const lagnaCalc = new lagnaModule.LagnaCalculator();

        const dayStart = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const tomorrow = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
        const dayEnd = getUtcDateFromLocalTimeStr(tomorrow, nextSunriseStr, timezone);

        // Identify all transitions
        const transitions = new Set();
        transitions.add(dayStart.getTime());
        transitions.add(dayEnd.getTime());

        // Helper to add transitions within range
        const addInRange = (list) => {
            list.forEach(item => {
                const s = item.startTime ? new Date(item.startTime).getTime() : null;
                const e = item.endTime ? new Date(item.endTime).getTime() : null;
                if (s && s > dayStart.getTime() && s < dayEnd.getTime()) transitions.add(s);
                if (e && e > dayStart.getTime() && e < dayEnd.getTime()) transitions.add(e);
            });
        };

        addInRange(tithiCalc.calculateDayTithis(dateObj, timezone));
        addInRange(tithiCalc.calculateDayTithis(tomorrow, timezone));

        addInRange(naksCalc.calculateDayNakshatras(dateObj, timezone));
        addInRange(naksCalc.calculateDayNakshatras(tomorrow, timezone));

        addInRange(existingLagnas || lagnaCalc.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr));

        // Create sorted unique transition timestamps
        const sortedTimes = Array.from(transitions).sort((a, b) => a - b);

        const results = [];
        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const varaIndex = dateObjUtc.getUTCDay() + 1; // 1=Sun, 7=Sat

        const formatTime = (d) => {
            return d.toLocaleTimeString('en-IN', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        for (let i = 0; i < sortedTimes.length - 1; i++) {
            const start = new Date(sortedTimes[i]);
            const end = new Date(sortedTimes[i + 1]);

            if (end.getTime() - start.getTime() < 120000) continue;

            const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);

            // Get data at midpoint
            const tithi = tithiCalc.getTithiAtTime(mid);
            const naks = naksCalc.getNakshatraAtTime(mid);
            const lagna = lagnaCalc.getLagnaAtTime(mid, lat, lng);

            // Calculation: (Tithi(1-15) + Vara(1-7) + Nakshatra(1-27) + Lagna(1-12)) % 9
            const tIndex = (tithi.number % 15) + 1;
            const vIndex = varaIndex;
            const nIndex = naks.number + 1;
            const lIndex = lagna.index + 1;

            const sum = tIndex + vIndex + nIndex + lIndex;
            const remainder = sum % 9;

            let muhuratName = "";
            let category = "Good";

            switch (remainder) {
                case 1: muhuratName = "Mrityu (Danger)"; category = "Danger"; break;
                case 2: muhuratName = "Agni (Risk)"; category = "Risk"; break;
                case 4: muhuratName = "Raja (Bad)"; category = "Bad"; break;
                case 6: muhuratName = "Chora (Evil)"; category = "Evil"; break;
                case 8: muhuratName = "Roga (Disease)"; category = "Disease"; break;
                default: muhuratName = "Shubha (Good)"; category = "Good"; break;
            }

            results.push({
                muhurat: muhuratName,
                category: category,
                start: formatTime(start),
                end: formatTime(end),
                duration: Math.round((end.getTime() - start.getTime()) / 60000) + ' mins',
                _start: start.getTime(),
                _end: end.getTime(),
                _sum: sum,
                _remainder: remainder
            });
        }

        return results;

    } catch (error) {
        console.error('Error in calculateSwissPanchakaRahita:', error);
        return [];
    }
}

function calculateVarjyam(dateObj, sunriseStr, sunsetStr, tithiNumber, timezone) {
    try {
        const varjyamGhatis = {
            1: 3, 2: 2.5, 3: 1.5, 4: 2, 5: 2, 6: 4, 7: 2, 8: 1.5, 9: 2.5, 10: 3,
            11: 2, 12: 1, 13: 1.5, 14: 2, 15: 0, 16: 3, 17: 2.5, 18: 1.5, 19: 2,
            20: 2, 21: 4, 22: 2, 23: 1.5, 24: 2.5, 25: 3, 26: 2, 27: 1, 28: 1.5,
            29: 2, 30: 0
        };

        const varjyamDurationGhatis = varjyamGhatis[tithiNumber] || 2;

        if (varjyamDurationGhatis === 0) {
            return null;
        }

        const sunriseDate = getUtcDateFromLocalTimeStr(dateObj, sunriseStr, timezone);
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        const dayDuration = (sunsetDate - sunriseDate) / 1000; // in seconds
        const oneGhati = dayDuration / 60;

        const noonTime = new Date(sunriseDate.getTime() + (dayDuration * 1000) / 2);

        const varjyamStartOffset = oneGhati * 30 * 1000;
        const varjyamStart = new Date(noonTime.getTime() - varjyamStartOffset / 2);

        const varjyamDuration = varjyamDurationGhatis * oneGhati * 1000;
        const varjyamEnd = new Date(varjyamStart.getTime() + varjyamDuration);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
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

function calculateKaalRatri(dateObj, sunsetStr, nextSunriseStr, timezone) {
    try {
        const sunsetDate = getUtcDateFromLocalTimeStr(dateObj, sunsetStr, timezone);

        let [nsh, nsm, nss = 0] = (nextSunriseStr || '').split(':').map(Number);
        let nextSunriseDate;
        if (isNaN(nsh)) {
            nextSunriseDate = new Date(sunsetDate.getTime() + 12 * 60 * 60 * 1000); // 12h rough fallback
        } else {
            const tomorrow = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
            nextSunriseDate = getUtcDateFromLocalTimeStr(tomorrow, nextSunriseStr, timezone);
        }

        const nightDuration = (nextSunriseDate - sunsetDate) / (8 * 60 * 1000); // 8 parts in minutes

        const parts = getPartsInTimezone(dateObj, timezone);
        const dateObjUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
        const weekday = dateObjUtc.getUTCDay();

        const kaalRatriParts = [4, 2, 7, 5, 3, 1, 6];
        const partIdx = kaalRatriParts[weekday] - 1;

        const kaalRatriStart = new Date(sunsetDate.getTime() + partIdx * nightDuration * 60 * 1000);
        const kaalRatriEnd = new Date(sunsetDate.getTime() + (partIdx + 1) * nightDuration * 60 * 1000);

        const formatTime = (date) => {
            return date.toLocaleTimeString('en-IN', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return {
            start: formatTime(kaalRatriStart),
            end: formatTime(kaalRatriEnd),
            duration: Math.round(nightDuration) + ' mins'
        };
    } catch (error) {
        console.error('Error calculating Kaal Ratri:', error);
        return { start: 'N/A', end: 'N/A' };
    }
}

module.exports = { calculatePanchangData, getTimezoneFromCoordinates, calculateSwissPanchakaRahita, calculateKaalRatri };
