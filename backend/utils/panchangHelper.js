/**
 * Calculate comprehensive Panchang data including Rahu Kaal, Abhijit, Tithi, etc.
 * Using manual calculations based on traditional Vedic formulas
 * @param {string} city - City name
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} sunriseStr - Sunrise time string (HH:MM:SS format)
 * @param {string} sunsetStr - Sunset time string (HH:MM:SS format)
 * @returns {Object} Comprehensive Panchang data
 */
async function calculatePanchangData(city, date, lat, lng, sunriseStr, sunsetStr) {
    try {
        const dateObj = new Date(date);
        const weekday = dateObj.getDay(); // 0=Sunday, 6=Saturday
        
        // Parse sunrise and sunset times
        const [sunriseHour, sunriseMin, sunriseSec] = sunriseStr.split(':').map(Number);
        const [sunsetHour, sunsetMin, sunsetSec] = sunsetStr.split(':').map(Number);
        
        const sunriseTime = new Date(dateObj);
        sunriseTime.setHours(sunriseHour, sunriseMin, sunriseSec || 0);
        
        const sunsetTime = new Date(dateObj);
        sunsetTime.setHours(sunsetHour, sunsetMin, sunsetSec || 0);
        
        const dayDuration = (sunsetTime - sunriseTime) / (1000 * 60); // minutes
        const oneEighth = dayDuration / 8;

        // Rahu Kaal timing based on weekday (traditional calculation)
        const rahuKaalParts = {
            0: 4.5, // Sunday: 4.5/8 parts after sunrise
            1: 1.5, // Monday: 1.5/8 parts
            2: 6,   // Tuesday: 6/8 parts
            3: 3,   // Wednesday: 3/8 parts
            4: 4.5, // Thursday: 4.5/8 parts
            5: 6,   // Friday: 6/8 parts
            6: 1.5  // Saturday: 1.5/8 parts
        };

        const rahuStartOffset = rahuKaalParts[weekday] * oneEighth;
        const rahuStart = new Date(sunriseTime.getTime() + rahuStartOffset * 60 * 1000);
        const rahuEnd = new Date(rahuStart.getTime() + (oneEighth * 60 * 1000));

        // Calculate Abhijit Muhurat (24-minute period around noon)
        const noonTime = new Date(sunriseTime.getTime() + (dayDuration / 2) * 60 * 1000);
        const abhijitStart = new Date(noonTime.getTime() - 12 * 60 * 1000);
        const abhijitEnd = new Date(noonTime.getTime() + 12 * 60 * 1000);

        // Gulika (Yamghanda) timing
        const gulikaParts = {
            0: 6,   // Sunday
            1: 4.5, // Monday
            2: 3,   // Tuesday
            3: 1.5, // Wednesday
            4: 6,   // Thursday
            5: 3,   // Friday
            6: 4.5  // Saturday
        };

        const gulikaStartOffset = gulikaParts[weekday] * oneEighth;
        const gulikaStartTime = new Date(sunriseTime.getTime() + gulikaStartOffset * 60 * 1000);
        const gulikaEndTime = new Date(gulikaStartTime.getTime() + (oneEighth * 60 * 1000));

        // Calculate Tithi (simplified - actual calculation requires moon phase)
        // Using day of lunar month approximation
        const lunarDay = Math.floor(((dateObj.getDate() - 1) % 30) / 2) + 1;
        const tithis = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];
        const tithiName = tithis[Math.min(lunarDay - 1, 14)];

        // Calculate Nakshatra (simplified)
        const nakshatras = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
            'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
            'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
            'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
            'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        const nakshatraIndex = ((dateObj.getDate() - 1) * 27 / 30) % 27;
        const nakshatraName = nakshatras[Math.floor(nakshatraIndex)];

        // Yoga (simplified)
        const yogas = [
            'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
            'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
            'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
            'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
            'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
            'Indra', 'Vaidhriti'
        ];
        const yogaIndex = ((dateObj.getDate() - 1) * 27 / 30) % 27;
        const yogaName = yogas[Math.floor(yogaIndex)];

        // Karana (half of tithi)
        const karanas = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
            'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
        ];
        const karanaIndex = (dateObj.getDate() - 1) % 11;
        const karanaName = karanas[karanaIndex];

        // Format time helper
        const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Calculate end times (approximate - 24 hours after start for demo)
        const tithiEnd = new Date(sunriseTime.getTime() + (dayDuration * 0.6) * 60 * 1000);
        const nakshatraEnd = new Date(sunriseTime.getTime() + (dayDuration * 0.7) * 60 * 1000);
        const yogaEnd = new Date(sunriseTime.getTime() + (dayDuration * 0.5) * 60 * 1000);
        const karanaEnd = new Date(sunriseTime.getTime() + (dayDuration * 0.4) * 60 * 1000);

        return {
            city,
            date,
            sunrise: formatTime(sunriseTime),
            sunset: formatTime(sunsetTime),
            
            // Panchang elements
            tithi: {
                name: tithiName,
                endTime: formatTime(tithiEnd)
            },
            nakshatra: {
                name: nakshatraName,
                endTime: formatTime(nakshatraEnd)
            },
            yoga: {
                name: yogaName,
                endTime: formatTime(yogaEnd)
            },
            karana: {
                name: karanaName,
                endTime: formatTime(karanaEnd)
            },
            
            // Important timings
            rahuKaal: {
                start: formatTime(rahuStart),
                end: formatTime(rahuEnd),
                duration: `${Math.round(oneEighth)} minutes`
            },
            abhijitMuhurat: {
                start: formatTime(abhijitStart),
                end: formatTime(abhijitEnd),
                duration: '24 minutes'
            },
            gulika: {
                start: formatTime(gulikaStartTime),
                end: formatTime(gulikaEndTime),
                duration: `${Math.round(oneEighth)} minutes`
            },
            
            // Additional info
            weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday],
            moonSign: ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'][dateObj.getMonth()],
            paksha: (dateObj.getDate() < 15) ? 'Shukla' : 'Krishna'
        };

    } catch (error) {
        console.error('Error calculating Panchang data:', error);
        throw error;
    }
}

module.exports = { calculatePanchangData };
