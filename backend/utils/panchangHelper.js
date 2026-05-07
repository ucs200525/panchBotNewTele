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
        // Parse date string as local date (not UTC) to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0); // Noon local time
        
        // Determine timezone - default to Asia/Kolkata (IST) if not specified
        const timezone = getTimezoneFromCoordinates(lat, lng);
        
        console.log(`Calculating Panchanga for: ${city} on ${date}`);
        
        

        
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
        
        // Get ALL elements for the day using NEW Swiss Ephemeris modules
        let dayElements = null;
        let lagnas = [];
        if (includeTransitions) {
            try {
                // Use NEW Swiss Ephemeris modules
                const { panchanga: swissPanchanga } = require('../swisseph');
                const { calculateDayLagnas } = require('./lagnaFinder');
                
                console.log('  🕉️  Using Swiss Ephemeris for accurate calculations...');
                
                // Calculate Panchanga elements (Tithi, Nakshatra)
                const panchangaData = swissPanchanga.calculateDayPanchanga(dateObj, timezone);
                
                dayElements = panchangaData;
                
                // Calculate Lagna timings
                lagnas = calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr);
                
                console.log(`  ✅ Found ${panchangaData.tithis.length} Tithi(s), ${panchangaData.nakshatras.length} Nakshatra(s), ${panchangaData.yogas.length} Yoga(s), ${panchangaData.karanas.length} Karana(s)`);
            } catch (error) {
                console.warn('  ⚠️  Could not calculate transitions:', error.message);
                console.error(error);
            }
        }
        
        // Build comprehensive response
        return {
            city,
            date,
            
            // Sun timings - use the accurate provided times
            sunrise: formattedSunrise,
            sunset: formattedSunset,
            
            // Core Panchanga elements
            tithis: dayElements?.tithis || [],
            nakshatras: dayElements?.nakshatras || [],
            yogas: dayElements?.yogas || [],
            karanas: dayElements?.karanas || [],
            
            // Backward compatibility fields
            yoga: dayElements?.yogas?.[0] || { name: 'N/A', number: 0 },
            karana: dayElements?.karanas?.[0] || { name: 'N/A', number: 0 },
            
            vara: dayElements?.vara?.name || 'N/A', 
            weekday: dayElements?.vara?.name || 'N/A',
            
            // Moon phase
            moonPhase: dayElements?.moonPhase || 'N/A',
            
            // Paksha
            paksha: dayElements?.paksha?.name || 'N/A',
            
            // Ayanamsa
            ayanamsa: (() => {
                try {
                    const { julianDay } = require('../swisseph');
                    const jd = julianDay.dateToJulianDay(dateObj);
                    const swisseph = require('swisseph');
                    const ayanamsaValue = swisseph.swe_get_ayanamsa_ut(jd);
                    return `${ayanamsaValue.toFixed(6)}° (Lahiri)`;
                } catch (error) {
                    return 'N/A';
                }
            })(),
            
            // Masa & Rtu
            masa: dayElements?.masa ? `${dayElements.masa.name} (${dayElements.masa.rashi})` : 'N/A',
            rtu: dayElements?.rtu?.name || 'N/A',
            
            // Years & Cycle
            samvatsara: dayElements?.samvatsara?.name || 'N/A',
            shakaYear: dayElements?.samvatsara?.shakaYear || 'N/A',
            vikramaYear: dayElements?.samvatsara?.vikramaYear || 'N/A',
            kaliYear: dayElements?.samvatsara?.kaliYear || 'N/A',
            
            // Moon Sign
            moonSign: (() => {
                try {
                    const { julianDay } = require('../swisseph');
                    const swisseph = require('swisseph');
                    const jd = julianDay.dateToJulianDay(dateObj);
                    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
                    const moonResult = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
                    const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;
                    const moonRashi = Math.floor(moonSidereal / 30);
                    const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                                       'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
                    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
                    return `${symbols[moonRashi]} ${rashiNames[moonRashi]}`;
                } catch (error) {
                    return 'N/A';
                }
            })(),
            
            // Sun Sign
            sunSign: (() => {
                try {
                    const { julianDay } = require('../swisseph');
                    const swisseph = require('swisseph');
                    const jd = julianDay.dateToJulianDay(dateObj);
                    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
                    const sunResult = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
                    const sunSidereal = (sunResult.longitude - ayanamsa + 360) % 360;
                    const sunRashi = Math.floor(sunSidereal / 30);
                    const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                                      'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
                    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
                    return `${symbols[sunRashi]} ${rashiNames[sunRashi]}`;
                } catch (error) {
                    return 'N/A';
                }
            })(),
            
            // NEW: Moon Sign
            moonSign: (() => {
                try {
                    const { julianDay } = require('../swisseph');
                    const swisseph = require('swisseph');
                    const jd = julianDay.dateToJulianDay(dateObj);
                    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
                    const moonResult = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);
                    const moonSidereal = (moonResult.longitude - ayanamsa + 360) % 360;
                    const moonRashi = Math.floor(moonSidereal / 30);
                    const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                                       'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
                    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
                    return `${symbols[moonRashi]} ${rashiNames[moonRashi]}`;
                } catch (error) {
                    console.warn('Could not calculate moon sign:', error.message);
                    return 'N/A';
                }
            })(),
            
            // NEW: Sun Sign
            sunSign: (() => {
                try {
                    const { julianDay } = require('../swisseph');
                    const swisseph = require('swisseph');
                    const jd = julianDay.dateToJulianDay(dateObj);
                    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
                    const sunResult = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
                    const sunSidereal = (sunResult.longitude - ayanamsa + 360) % 360;
                    const sunRashi = Math.floor(sunSidereal / 30);
                    const rashiNames = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                                       'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
                    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
                    return `${symbols[sunRashi]} ${rashiNames[sunRashi]}`;
                } catch (error) {
                    console.warn('Could not calculate sun sign:', error.message);
                    return 'N/A';
                }
            })(),
            
            // Rahu Kaal (inauspicious time)
            rahuKaal: dayElements?.rahuKaal ? {
                start: formatTime(dayElements.rahuKaal.start),
                end: formatTime(dayElements.rahuKaal.end),
                duration: calculateDuration(dayElements.rahuKaal.start, dayElements.rahuKaal.end)
            } : null,
            
            // NEW: Calculate Gulika Kalam 
            gulika: (() => {
                try {
                    const { muhurta } = require('../swisseph');
                    const sunriseDate = new Date(dateObj);
                    const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
                    sunriseDate.setHours(sh, sm, ss || 0, 0);
                    
                    const sunsetDate = new Date(dateObj);
                    const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);
                    sunsetDate.setHours(suh, sum, sus || 0, 0);
                    
                    const weekday = dateObj.getDay();
                    const gulikaData = muhurta.calculateGulikaKalam(sunriseDate, sunsetDate, weekday);
                    
                    return {
                        start: formatTime(gulikaData.start),
                        end: formatTime(gulikaData.end),
                        duration: calculateDuration(gulikaData.start, gulikaData.end)
                    };
                } catch (error) {
                    return null;
                }
            })(),
            
            // NEW: Calculate Yamaganda
            yamaganda: (() => {
                try {
                    const { muhurta } = require('../swisseph');
                    const sunriseDate = new Date(dateObj);
                    const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
                    sunriseDate.setHours(sh, sm, ss || 0, 0);
                    
                    const sunsetDate = new Date(dateObj);
                    const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);
                    sunsetDate.setHours(suh, sum, sus || 0, 0);
                    
                    const weekday = dateObj.getDay();
                    const yamagandaData = muhurta.calculateYamaganda(sunriseDate, sunsetDate, weekday);
                    
                    return {
                        start: formatTime(yamagandaData.start),
                        end: formatTime(yamagandaData.end),
                        duration: calculateDuration(yamagandaData.start, yamagandaData.end)
                    };
                } catch (error) {
                    return null;
                }
            })(),
            
            // Lagna (Ascendant) timings - all 12 signs for the day
            lagnas: lagnas.map(lagna => ({
                name: lagna.name,
                symbol: lagna.symbol || '',
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
            
            // Abhijit Muhurat
            abhijitMuhurat: calculateAbhijitMuhurat(sunriseStr, sunsetStr, timezone),
            
            // Hindu calendar years and cycles
            shakaYear: dayElements?.samvatsara?.shakaYear || 'N/A',
            vikramaYear: dayElements?.samvatsara?.vikramaYear || 'N/A',
            kaliYear: dayElements?.samvatsara?.kaliYear || 'N/A',
            samvatsara: dayElements?.samvatsara?.name || 'N/A',
            
            // NEW: Moonrise/Moonset
            moonrise: (() => {
                try {
                    const { planetary } = require('../swisseph');
                    const planner = new planetary.PlanetaryCalculator();
                    const moonriseTime = planner.getMoonrise(dateObj, lat, lng);
                    return moonriseTime ? formatTime(moonriseTime) : 'N/A';
                } catch (error) {
                    return 'N/A';
                }
            })(),

            moonset: (() => {
                try {
                    const { planetary } = require('../swisseph');
                    const planner = new planetary.PlanetaryCalculator();
                    const moonsetTime = planner.getMoonset(dateObj, lat, lng);
                    return moonsetTime ? formatTime(moonsetTime) : 'N/A';
                } catch (error) {
                    return 'N/A';
                }
            })(),

            // NEW: Brahma Muhurta
            brahmaMuhurta: (() => {
                try {
                    const { muhurta } = require('../swisseph');
                    const sunriseDate = new Date(dateObj);
                    const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
                    sunriseDate.setHours(sh, sm, ss || 0, 0);
                    
                    const brahmaData = muhurta.calculateBrahmaMuhurta(sunriseDate);
                    return {
                        start: formatTime(brahmaData.start),
                        end: formatTime(brahmaData.end),
                        duration: calculateDuration(brahmaData.start, brahmaData.end)
                    };
                } catch (error) {
                    return null;
                }
            })(),

            // NEW: Choghadiya
            choghadiya: (() => {
                try {
                    const { muhurta } = require('../swisseph');
                    const sunriseDate = new Date(dateObj);
                    const [sh, sm, ss = 0] = sunriseStr.split(':').map(Number);
                    sunriseDate.setHours(sh, sm, ss || 0, 0);

                    const sunsetDate = new Date(dateObj);
                    const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);
                    sunsetDate.setHours(suh, sum, sus || 0, 0);

                    const sunriseNextDate = new Date(sunriseDate);
                    sunriseNextDate.setDate(sunriseNextDate.getDate() + 1);
                    
                    const choghadiyaData = muhurta.calculateChoghadiya(dateObj, sunriseDate, sunsetDate, sunriseNextDate);
                    
                    const formatP = (p) => ({
                        name: p.name,
                        type: p.type,
                        start: formatTime(p.start),
                        end: formatTime(p.end)
                    });

                    return {
                        day: choghadiyaData.day.map(formatP),
                        night: choghadiyaData.night.map(formatP)
                    };
                } catch (error) {
                    return null;
                }
            })(),
            
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

const formatTime = (date, timezone = 'Asia/Kolkata', baseDate = null, is12HourFormat = true) => {
    if (!date) return 'N/A';
    
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: is12HourFormat,
        timeZone: timezone
    };
    
    let timeStr = date.toLocaleTimeString('en-IN', options).toUpperCase();
    
    if (baseDate) {
        const d1Str = new Date(baseDate).toLocaleDateString('en-CA', { timeZone: timezone });
        const d2Str = new Date(date).toLocaleDateString('en-CA', { timeZone: timezone });
        
        if (d2Str > d1Str) {
            const datePart = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', timeZone: timezone });
            return `${timeStr}, ${datePart}`;
        }
    }
    
    return timeStr;
};

/**
 * Calculate Abhijit Muhurat (auspicious time around noon)
 * @param {string} sunriseStr - Sunrise time as "HH:MM:SS" string
 * @param {string} sunsetStr - Sunset time as "HH:MM:SS" string  
 */
function calculateAbhijitMuhurat(sunriseStr, sunsetStr, timezone = 'Asia/Kolkata') {
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
        
        return {
            start: formatTime(abhijitStart, timezone),
            end: formatTime(abhijitEnd, timezone),
            duration: '48 minutes' // Standard Abhijit duration
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

function calculateSwissPanchakaRahita(dateObj, lat, lng, timezone, sunriseStr, sunsetStr, nextSunriseStr, existingLagnas, is12HourFormat = true) {
    try {
        const { panchanga, lagna: lagnaModule } = require('../swisseph');
        const fs = require('fs');
        const path = require('path');
        const epheLocal = path.join(__dirname, '..', 'data', 'ephe');
        const epheVercel = path.join(process.cwd(), 'data', 'ephe');
        // Removed logger.info because logger is undefined

        const tithiCalc = new panchanga.TithiCalculator();
        const naksCalc = new panchanga.NakshatraCalculator();
        const lagnaCalc = new lagnaModule.LagnaCalculator();

        const parseTime = (date, str) => {
            const clean = str.toLowerCase().replace(/[ap]m/, '').trim();
            const parts = clean.split(':').map(Number);
            let h = parts[0];
            const m = parts[1] || 0;
            const s = parts[2] || 0;
            if (str.toLowerCase().includes('pm') && h < 12) h += 12;
            if (str.toLowerCase().includes('am') && h === 12) h = 0;

            // Build the date string in the target timezone (e.g. IST) and parse as UTC
            // This ensures it works regardless of the server's local timezone (UTC on Vercel)
            const baseDate = new Date(date);
            const year = baseDate.getFullYear();
            const mo = String(baseDate.getMonth() + 1).padStart(2, '0');
            const dy = String(baseDate.getDate()).padStart(2, '0');
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const ss = String(s).padStart(2, '0');

            // Use Temporal-style trick: format a known UTC time in the target timezone
            // to find the UTC offset, then apply it when constructing the target time
            const testUtc = new Date(`${year}-${mo}-${dy}T${hh}:${mm}:${ss}Z`);
            const localStr = testUtc.toLocaleString('en-CA', { timeZone: timezone, hour12: false });
            // localStr is like "2026-05-04, 10:40:00" (UTC interpreted in target TZ)
            const localDate = new Date(localStr.replace(', ', 'T') + 'Z');
            const offsetMs = testUtc.getTime() - localDate.getTime();
            return new Date(testUtc.getTime() + offsetMs);
        };

        const dayStart = parseTime(dateObj, sunriseStr);
        const dayEnd = parseTime(new Date(dateObj.getTime() + 24 * 60 * 60 * 1000), nextSunriseStr);

        const transitions = new Set();
        transitions.add(dayStart.getTime());
        transitions.add(dayEnd.getTime());

        const addInRange = (list) => {
            list.forEach(item => {
                const e = item.endTime ? new Date(item.endTime).getTime() : null;
                if (e && e > dayStart.getTime() && e < dayEnd.getTime()) transitions.add(e);
            });
        };

        const tomorrow = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
        addInRange(tithiCalc.calculateDayTithis(dateObj, timezone));
        addInRange(tithiCalc.calculateDayTithis(tomorrow, timezone));
        addInRange(naksCalc.calculateDayNakshatras(dateObj, timezone));
        addInRange(naksCalc.calculateDayNakshatras(tomorrow, timezone));
        addInRange(existingLagnas || lagnaCalc.calculateDayLagnas(dateObj, lat, lng, timezone, sunriseStr));

        const sortedTimes = Array.from(transitions).sort((a, b) => a - b);
        const results = [];
        const varaIndex = dateObj.getDay() + 1; // 1=Sun, 7=Sat


        for (let i = 0; i < sortedTimes.length - 1; i++) {
            const start = new Date(sortedTimes[i]);
            const end = new Date(sortedTimes[i + 1]);
            if (end.getTime() - start.getTime() < 120000) continue;
            const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);

            const tithi = tithiCalc.getTithiAtTime(mid);
            const naks = naksCalc.getNakshatraAtTime(mid);
            const lagna = lagnaCalc.getLagnaAtTime(mid, lat, lng);

            const tIndex = tithi.number + 1; // 1-30
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
                start: formatTime(start, timezone, dateObj, is12HourFormat),
                end: formatTime(end, timezone, dateObj, is12HourFormat),
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

function calculateKaalRatri(dateObj, sunsetStr, nextSunriseStr) {
    try {
        const [suh, sum, sus = 0] = sunsetStr.split(':').map(Number);
        let [nsh, nsm, nss = 0] = (nextSunriseStr || '').split(':').map(Number);
        if (isNaN(nsh)) {
            nsh = (suh + 12) % 24;
            nsm = sum;
        }

        const sunsetDate = new Date(dateObj);
        sunsetDate.setHours(suh, sum, sus || 0, 0);

        const nextSunriseDate = new Date(dateObj);
        nextSunriseDate.setDate(nextSunriseDate.getDate() + 1);
        nextSunriseDate.setHours(nsh, nsm, nss || 0, 0);

        const nightDuration = (nextSunriseDate - sunsetDate) / (8 * 60 * 1000); 

        const weekday = dateObj.getDay();
        const kaalRatriParts = [4, 2, 7, 5, 3, 1, 6];
        const partIdx = kaalRatriParts[weekday] - 1; 

        const kaalRatriStart = new Date(sunsetDate.getTime() + partIdx * nightDuration * 60 * 1000);
        const kaalRatriEnd = new Date(sunsetDate.getTime() + (partIdx + 1) * nightDuration * 60 * 1000);

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
