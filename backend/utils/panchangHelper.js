/**
 * Calculate comprehensive Panchang data using @bidyashish/panchang library
 * with cached transition times
 * 
 * IMPORTANT: This library requires @bidyashish/panchang to be installed:
 * npm install @bidyashish/panchang
 * 
 * NOTE: On Windows, you may need to install build tools first:
 * npm install --global windows-build-tools
 * OR install Visual Studio Build Tools manually
 * 
 * @param {string} city - City name
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} sunriseStr - Sunrise time string (HH:MM:SS format)
 * @param {string} sunsetStr - Sunset time string (HH:MM:SS format)
 * @param {boolean} includeTransitions - Whether to calculate transition times (default: true)
 * @returns {Object} Comprehensive Panchang data
 */
async function calculatePanchangData(city, date, lat, lng, sunriseStr, sunsetStr, includeTransitions = true) {
    try {
        // Try to require the @bidyashish/panchang library
        let getPanchanga, getPanchangaReport;
        
        try {
            const panchangLib = require('@bidyashish/panchang');
            getPanchanga = panchangLib.getPanchanga;
            getPanchangaReport = panchangLib.getPanchangaReport;
        } catch (requireError) {
            console.error('⚠️  @bidyashish/panchang is not installed or failed to load.');
            console.error('Error:', requireError.message);
            console.error('\nTo install, run:');
            console.error('  npm install @bidyashish/panchang');
            console.error('\nOn Windows, you may need build tools:');
            console.error('  npm install --global windows-build-tools');
            throw new Error('Panchang library not available. Please install @bidyashish/panchang');
        }
        
        // Parse date string as local date (not UTC) to avoid timezone issues
        // "2026-01-05" parsed as UTC becomes Jan 4 in IST timezone
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0); // Noon local time
        
        // Determine timezone - default to Asia/Kolkata (IST) if not specified
        // You can make this configurable based on latitude/longitude
        const timezone = getTimezoneFromCoordinates(lat, lng);
        
        console.log(`Calculating Panchanga for: ${city} on ${date}`);
        console.log(`Coordinates: ${lat}, ${lng}`);
        console.log(`Timezone: ${timezone}`);
        
        // Get Panchanga data using the library
        const panchanga = getPanchanga(dateObj, lat, lng, timezone);
        
        // Panchanga calculated successfully
        
        
        // Format time helper - based on official library examples
        // Converts Date objects (from library) to properly formatted time strings
        const formatTime = (dateInput) => {
            if (!dateInput) return 'N/A';
            
            // If it's already a formatted string, return it
            if (typeof dateInput === 'string') {
                return dateInput;
            }
            
            // Convert Date object to locale time string with user's timezone
            // This is the pattern used in official library examples
            const d = new Date(dateInput);
            
            // Extract just the time part from the full locale string
            const fullString = d.toLocaleString('en-US', { timeZone: timezone });
            const timePart = fullString.split(', ')[1]; // Gets "HH:MM:SS AM/PM" part
            
            // Remove seconds for cleaner display
            const [time, period] = timePart.split(' ');
            const [hours, minutes] = time.split(':');
            
            return `${hours}:${minutes} ${period}`;
        };
        

        
        // Parse provided sunrise/sunset (these are accurate from sunrise-sunset.org API)
        const [sunriseHour, sunriseMin, sunriseSec = 0] = sunriseStr.split(':').map(Number);
        const [sunsetHour, sunsetMin, sunsetSec = 0] = sunsetStr.split(':').map(Number);
        
        // Format provided times (already correct for user's timezone)
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
        
        // Get ALL elements for the day (no cache - always calculate)
        let dayElements = null;
        let lagnas = [];
        if (includeTransitions) {
            try {
                const { getDayPanchangElements } = require('./transitionFinder');
                const { calculateDayLagnas } = require('./lagnaFinder');
                
                dayElements = getDayPanchangElements(dateObj, lat, lng, timezone);
                lagnas = calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr);
            } catch (error) {
                console.warn('  ⚠️  Could not calculate transitions:', error.message);
            }
        }
        
        // Build comprehensive response
        return {
            city,
            date,
            
            // Sun timings - use the accurate provided times
            sunrise: formattedSunrise,
            sunset: formattedSunset,
            
            // Core Panchanga elements - now as arrays showing all elements for the day
            tithis: dayElements?.tithis?.map(t => ({
                name: t.name,
                number: t.number,
                paksha: t.paksha,
                percentage: t.percentage,
                startTime: t.startTime ? formatTime(t.startTime) : null,
                endTime: t.endTime ? formatTime(t.endTime) : null
            })) || [{
                name: panchanga.tithi.name,
                number: panchanga.tithi.number,
                paksha: panchanga.tithi.paksha,
                percentage: panchanga.tithi.percentage,
                startTime: null,
                endTime: null
            }],
            
            nakshatras: dayElements?.nakshatras?.map(n => ({
                name: n.name,
                number: n.number,
                pada: n.pada,
                lord: n.lord,
                startTime: n.startTime ? formatTime(n.startTime) : null,
                endTime: n.endTime ? formatTime(n.endTime) : null
            })) || [{
                name: panchanga.nakshatra.name,
                number: panchanga.nakshatra.number,
                pada: panchanga.nakshatra.pada,
                lord: panchanga.nakshatra.lord || 'N/A',
                startTime: null,
                endTime: null
            }],
            
            yoga: {
                name: panchanga.yoga.name,
                number: panchanga.yoga.number,
            },
            
            karana: {
                name: panchanga.karana.name,
                number: panchanga.karana.number,
            },
            
            vara: panchanga.vara.name || panchanga.vara, // Day of the week
            weekday: panchanga.vara.name || panchanga.vara,
            
            // Moon phase
            moonPhase: panchanga.moonPhase || 'N/A',
            
            // Paksha (fortnight)
            paksha: panchanga.tithi.paksha,
            
            // Rahu Kaal (inauspicious time) - check if valid
            rahuKaal: (() => {
                if (panchanga.rahuKaal && panchanga.rahuKaal.start && panchanga.rahuKaal.end) {
                    const start = formatTime(panchanga.rahuKaal.start);
                    const end = formatTime(panchanga.rahuKaal.end);
                    const duration = calculateDuration(panchanga.rahuKaal.start, panchanga.rahuKaal.end);
                    
                    // If duration is negative, library calculation is wrong - return null
                    const durationNum = parseInt(duration);
                    if (durationNum < 0) {
                        console.warn('⚠️  Rahu Kaal has invalid times (end before start), skipping display');
                        return null;
                    }
                    
                    return { start, end, duration };
                }
                return null;
            })(),
            
            gulika: (panchanga.gulikaKaal && panchanga.gulikaKaal.start && panchanga.gulikaKaal.end) ? {
                start: formatTime(panchanga.gulikaKaal.start),
                end: formatTime(panchanga.gulikaKaal.end),
                duration: calculateDuration(panchanga.gulikaKaal.start, panchanga.gulikaKaal.end)
            } : null,
            
            yamaganda: (panchanga.yamaganda && panchanga.yamaganda.start && panchanga.yamaganda.end) ? {
                start: formatTime(panchanga.yamaganda.start),
                end: formatTime(panchanga.yamaganda.end),
                duration: calculateDuration(panchanga.yamaganda.start, panchanga.yamaganda.end)
            } : null,
            
            // Lagna (Ascendant) timings - all 12 signs for the day
            lagnas: lagnas.map(lagna => ({
                name: lagna.name,
                index: lagna.index,
                startTime: lagna.startTime ? formatTime(lagna.startTime) : null,
                endTime: lagna.endTime ? formatTime(lagna.endTime) : null,
                startDate: lagna.startTime ? lagna.startTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: timezone 
                }) : null,
                endDate: lagna.endTime ? lagna.endTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    timeZone: timezone 
                }) : null
            })),
            
            // Abhijit Muhurat - calculate from correct sunrise/sunset times
            abhijitMuhurat: (() => {
                if (panchanga.abhijitMuhurat && panchanga.abhijitMuhurat.start) {
                    return {
                        start: formatTime(panchanga.abhijitMuhurat.start),
                        end: formatTime(panchanga.abhijitMuhurat.end),
                        duration: '24 minutes'
                    };
                }
                // Calculate it ourselves from provided times
                return calculateAbhijitMuhurat(sunriseStr, sunsetStr);
            })(),
            
            // Additional astronomical data (if available)
            moonSign: panchanga.moonSign || 'N/A',
            sunSign: panchanga.sunSign || 'N/A',
            masa: panchanga.masa || panchanga.month || 'N/A',
            samvatsara: panchanga.samvatsara || panchanga.year || 'N/A',
            ayanamsa: panchanga.ayanamsa || 'N/A',
            
            // Lunar months (if available)
            amantaMonth: panchanga.amantaMonth || 'N/A',
            purnimantaMonth: panchanga.purnimantaMonth || 'N/A',
            
            // Hindu calendar years (if available)
            shakaYear: panchanga.shakaYear || 'N/A',
            vikramaYear: panchanga.vikramaYear || 'N/A',
            
            // Moonrise/Moonset (if available)
            moonrise: panchanga.moonrise ? formatTime(panchanga.moonrise) : 'N/A',
            moonset: panchanga.moonset ? formatTime(panchanga.moonset) : 'N/A',
            
            // Store raw data for debugging
            _rawPanchangData: panchanga,
            _timezone: timezone
        };

    } catch (error) {
        console.error('❌ Error calculating Panchang data:', error);
        throw error;
    }
}

/**
 * Helper function to determine timezone from coordinates
 */
function getTimezoneFromCoordinates(lat, lng) {
    // Simple mapping - you can enhance this with a proper timezone library
    // For now, use common timezone mappings
    
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
    // Default to Asia/Kolkata (IST)
    return 'Asia/Kolkata';
}

/**
 * Calculate duration between two times
 */
function calculateDuration(start, end) {
    if (!start || !end) return 'N/A';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const minutes = Math.round((endTime - startTime) / (1000 * 60));
    return `${minutes} minutes`;
}

/**
 * Calculate Abhijit Muhurat (auspicious time around noon)
 * @param {string} sunriseStr - Sunrise time as "HH:MM:SS" string
 * @param {string} sunsetStr - Sunset time as "HH:MM:SS" string  
 */
function calculateAbhijitMuhurat(sunriseStr, sunsetStr) {
    try {
        // Parse sunrise and sunset times
        const [sunriseHour, sunriseMin, sunriseSec = 0] = sunriseStr.split(':').map(Number);
        const [sunsetHour, sunsetMin, sunsetSec = 0] = sunsetStr.split(':').map(Number);
        
        // Create date objects for today
        const sunriseTime = new Date();
        sunriseTime.setHours(sunriseHour, sunriseMin, sunriseSec, 0);
        
        const sunsetTime = new Date();
        sunsetTime.setHours(sunsetHour, sunsetMin, sunsetSec, 0);
        
        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60); // minutes
        
        // Abhijit is 24 minutes centered around noon (mid-point of day)
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
        console.error('Error calculating Abhijit Muhurat:', error);
        return {
            start: 'N/A',
            end: 'N/A',
            duration: 'N/A'
        };
    }
}

module.exports = { calculatePanchangData };
