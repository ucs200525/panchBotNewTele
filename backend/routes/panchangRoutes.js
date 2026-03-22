const express = require('express');
const router = express.Router(); // Use express.Router() instead of express()
const logger = require('../utils/logger.js');
const { trackOpenCageRequest } = require('../utils/thirdPartyTracker');

const fetch = require('node-fetch'); // Make sure to install node-fetch if you haven't already
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { renderAstrologyTable } = require('../utils/canvasRenderer');

// In-memory cache for coordinates to avoid redundant OpenCage calls
const coordCache = new Map();

// Function to fetch coordinates and time zone based on the city name
async function fetchCoordinates(city) {
    const cityKey = city.toLowerCase().trim();
    if (coordCache.has(cityKey)) {
        logger.info({ message: 'Using cached coordinates', city: cityKey });
        return coordCache.get(cityKey);
    }

    logger.info({ message: 'fetchCoordinates (GeoNames) called', city });
    const username = 'ucs05';

    try {
        // 1. Search for the city
        const searchUrl = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(city)}&maxRows=1&username=${username}`;
        const searchResponse = await axios.get(searchUrl);

        if (searchResponse.data.geonames && searchResponse.data.geonames.length > 0) {
            const { lat, lng } = searchResponse.data.geonames[0];

            // 2. Get timezone for the coordinates
            const tzUrl = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${username}`;
            const tzResponse = await axios.get(tzUrl);

            const timeZone = tzResponse.data.timezoneId;

            if (!timeZone) {
                logger.warn({ message: 'Timezone not found via GeoNames', city });
                throw new Error('Timezone not found');
            }

            const result = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timeZone,
                source: 'geonames'
            };

            // Save to cache
            coordCache.set(cityKey, result);

            logger.info({ message: 'Coordinates fetched via GeoNames', city, lat, lng, timeZone });
            return result;
        } else {
            logger.warn({ message: 'City not found via GeoNames', city });
            throw new Error('City not found');
        }
    } catch (error) {
        logger.error({ message: 'Error fetching coordinates via GeoNames', error: error.message, city });
        return null;
    }
}

// In-memory cache for reverse geocoding (lat,lng to city)
const reverseCache = new Map();

async function fetchCityName(lat, lng) {
    const cacheKey = `${parseFloat(lat).toFixed(3)},${parseFloat(lng).toFixed(3)}`;
    if (reverseCache.has(cacheKey)) {
        logger.info({ message: 'Using cached city name', lat, lng });
        return reverseCache.get(cacheKey);
    }

    logger.info({ message: 'fetchCityName called', lat, lng });
    const apiKey = '699522e909454a09b82d1c728fc79925'; // OpenCage API key

    try {
        // Use OpenCage directly for high accuracy ( GeoNames was only nearby )
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        if (data.results.length > 0) {
            const { limit, remaining, reset } = data.rate;
            const components = data.results[0].components;
            // Strategy: Try to find the most specific city/town name first
            const city = components.city || components.town || components.village || components.suburb || components.neighbourhood || components.state_district || components.state;
            const timeZone = data.results[0].annotations.timezone.name;

            const result = { cityName: city, timeZone, limit, remaining, reset, source: 'opencage' };
            reverseCache.set(cacheKey, result);
            logger.info({ message: 'City name fetched via OpenCage', city });
            return result;
        }

        throw new Error('No location found for these coordinates');
    } catch (error) {
        logger.error({ message: 'Error in fetchCityName', error: error.message, lat, lng });
        return null;
    }
}


// Function to convert UTC time to local time based on time zone
const convertToLocalTime = (utcDate, timeZone) => {
    const date = new Date(utcDate);
    return date.toLocaleString('en-US', { timeZone, hour12: false }).split(' ')[1];
};

// Function to fetch sunrise and sunset times for a given date using High Accuracy Swiss Ephemeris
async function fetchSunTimes(lat, lng, date, timeZone) {
    logger.info({ message: 'fetchSunTimes (Swiss Priority) called', lat, lng, date, timeZone });
    try {
        const { getSunMoonTimesSwiss } = require('../utils/swissHelper');
        const results = await getSunMoonTimesSwiss(lat, lng, date, timeZone);

        if (results) {
            logger.info({ message: 'Sun times fetched using Swiss Ephemeris', results });
            return results;
        }

        logger.warn({ message: 'Swiss Ephemeris failed for sun times, falling back to external API' });
        return fetchSunTimesExternal(lat, lng, date, timeZone);
    } catch (error) {
        logger.error({ message: 'Error in fetchSunTimes wrapper', error: error.message });
        return fetchSunTimesExternal(lat, lng, date, timeZone);
    }
}

// Original external API function (now as fallback)
async function fetchSunTimesExternal(lat, lng, date, timeZone) {
    logger.info({ message: 'fetchSunTimes called', lat, lng, date, timeZone });
    try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${date}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const results = data.results;

        const sunriseToday = convertToLocalTime(results.sunrise, timeZone);
        const sunsetToday = convertToLocalTime(results.sunset, timeZone);

        // Log the sunrise and sunset for today
        logger.info({ message: 'Sunrise and Sunset for today', sunriseToday, sunsetToday });

        // Calculate tomorrow's date
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

        // Fetch sunrise and sunset for tomorrow
        const responseTomorrow = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${tomorrowDate}`);
        if (!responseTomorrow.ok) {
            throw new Error(`HTTP error! Status: ${responseTomorrow.status}`);
        }
        const dataTomorrow = await responseTomorrow.json();
        const resultsTomorrow = dataTomorrow.results;
        const sunriseTmrw = convertToLocalTime(resultsTomorrow.sunrise, timeZone);

        // Log the sunrise for tomorrow
        logger.info({ message: 'Sunrise for tomorrow', sunriseTmrw });

        // Return today's and tomorrow's sunrise and sunset times
        return {
            sunriseToday,
            sunsetToday,
            sunriseTmrw,
        };
    } catch (error) {
        logger.error({ message: 'Error fetching sun times', error: error.message });
        return null;
    }
}

async function getSunTimesForCity(city, date, lat, lng) {
    logger.info({ message: 'getSunTimesForCity called', city, date, lat, lng });

    let coords;
    if (lat && lng && lat !== 'null' && lng !== 'null') {
        // We have coordinates from frontend! Skip OpenCage.
        const { getTimezoneFromCoordinates } = require('../utils/panchangHelper');
        coords = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timeZone: getTimezoneFromCoordinates(parseFloat(lat), parseFloat(lng))
        };
        logger.info({ message: 'Using coordinates from request, skipping geocoding', coords });
    } else {
        // Only call OpenCage if we don't have coordinates at all
        coords = await fetchCoordinates(city);
    }

    if (coords) {
        const sunTimes = await fetchSunTimes(coords.lat, coords.lng, date, coords.timeZone);

        // Calculate weekday
        const [y, m, d] = date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        // Clean up response: remove OpenCage rate limit info
        const cleanCoords = {
            lat: coords.lat,
            lng: coords.lng,
            timeZone: coords.timeZone
        };

        return { sunTimes, coords: cleanCoords, weekday };
    }
    return null;
}
// Function to get the weekday name from a date
// Function to get the weekday name from a date
function getWeekday(dateString) {
    logger.debug({ message: 'getWeekday called', dateString });
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    const options = { weekday: 'long' };
    const weekday = date.toLocaleDateString('en-US', options);
    logger.debug({ message: 'Weekday calculated', weekday });
    return weekday;
}

function getCurrentDateInTimeZone(timeZone) {
    const options = {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const [{ value: day }, , { value: month }, , { value: year }] = formatter.formatToParts(new Date());
    const date = `${day}-${month}-${year}`;
    return date;
}



// Function to fetch GeoName ID based on city
// Function to fetch GeoName ID based on city
async function getGeoNameId(city) {
    logger.info({ message: 'getGeoNameId called', city });
    const geoNamesUrl = `http://api.geonames.org/searchJSON?q=${city}&maxRows=1&username=ucs05`;
    try {
        const response = await axios.get(geoNamesUrl);
        // console.log("Total Results Count:", response.data.totalResultsCount);
        if (response.data.geonames && response.data.geonames.length > 0) {
            const geoNameId = response.data.geonames[0].geonameId;
            logger.info({ message: "GeoName ID found", geoNameId, city });
            return geoNameId;
        } else {
            logger.warn({ message: 'GeoName City not found', city });
            throw new Error('City not found');
        }
    } catch (error) {
        logger.error({ message: "Error fetching GeoName ID", error: error.message, city });
        throw error;
    }
}









////////////////////////////////////////////////BHARGAV--PANCHAGAM///////////////////////////////////////////
// Function to convert time to seconds (assuming you have timeToSeconds and secondsToTime functions defined)
const timeToSeconds = (time) => {
    const [hrs, mins, secs] = time.split(':').map(Number);
    return hrs * 3600 + mins * 60 + (secs || 0);
};

const secondsToTime = (seconds, currentDate, is12HourFormat) => {
    const baseDate = new Date(currentDate); // Ensure currentDate is a valid Date object

    // If seconds exceed a day, calculate the date and time
    const daysPassed = Math.floor(seconds / 86400); // Calculate how many full days have passed
    seconds = seconds % 86400; // Ensure seconds are within a day
    seconds = Math.round(seconds * 100) / 100; // Round seconds to 2 decimal places

    let hrs = Math.floor(seconds / 3600); // Get hours
    const mins = Math.floor((seconds % 3600) / 60); // Get minutes
    const secs = Math.round(seconds % 60); // Get seconds, rounded to the nearest second

    let timeString;

    // Convert to 12-hour format if needed
    if (is12HourFormat) {
        const period = hrs >= 12 ? 'PM' : 'AM'; // Determine AM/PM
        hrs = hrs % 12 || 12; // Convert to 12-hour format, 0 becomes 12
        timeString = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    } else {
        timeString = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        // 24-hour format
    }

    // If more than 1 day has passed, append the date, else just return the time
    if (daysPassed > 0) {
        baseDate.setDate(baseDate.getDate() + 1); // Add 1 day to currentDate
        const formattedDate = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Format the date like "Nov 29"
        timeString = ` ${formattedDate} , ${timeString}`; // Append the formatted date to the time string
    }

    return timeString;
};


// // Helper function to find the closest day (you need to define your logic here)
// const findClosestDay = (weekday) => {
//   // Assuming weekday is passed as a string like 'Monday', 'Tuesday', etc.
//   return weekday; // Modify this based on your logic for finding the closest day
// };
// router.post('/update-table', (req, res) => {
//     const { sunriseToday, sunsetToday, sunriseTmrw, weekday, is12HourFormat, currentDate, showNonBlue } = req.body;
//     const totalSec = timeToSeconds('24:00:00');

//     const sunriseTodaySec = timeToSeconds(sunriseToday);
//     const sunsetTodaySec = timeToSeconds(sunsetToday);
//     const sunriseTmrwSec = timeToSeconds(sunriseTmrw);

//     const interval1 = (sunsetTodaySec - sunriseTodaySec) / 30;
//     const interval2 = ((totalSec + sunriseTmrwSec) - sunsetTodaySec) / 30;
//     const newTableData = [];
//     let sunrise = sunriseTodaySec;
//     let sunset = sunsetTodaySec;

//     const weekdayRows = {
//         "Monday": [0, 5, 12, 13, 21, 26, 29],
//         "Tuesday": [2, 3, 7, 8, 9, 11, 12, 13, 14, 15, 18, 20, 21, 22, 24],
//         "Wednesday": [0, 1, 4, 5, 6, 7, 9, 19, 27, 29],
//         "Thursday": [2, 5, 8, 11, 13, 14, 15, 16, 18, 19, 20, 23, 24, 27, 28],
//         "Friday": [1, 4, 6, 8, 14, 16, 18, 19, 22, 23, 24, 25, 26, 28],
//         "Saturday": [0, 8, 9, 11, 12, 17, 22, 23, 25],
//         "Sunday": [2, 3, 4, 5, 10, 14, 16, 19, 21, 23, 24, 25, 28]
//     };

//     const closestDay = weekday;

//        const weekdayValues = {
//         "Sunday": [
//             "ప్రయాణకార్యసిద్ధి", "విద్యాజయం", "ఉద్యోగ కష్టం", "శత్రువృద్ధి", "చోరభయం", "దుఃఖము", "అభీష్టసిద్ధి", "సౌఖ్యం-లాభం", 
//             "వివాహాదిశుభాని", "మిత్రవృద్ధి", "మృత్యుభయం", "ఆరోగ్యం", "శుభకార్యజయం", "ప్రయత్నఫలం", "విషభయం", "ఉద్యోగం", 
//             "జ్వరప్రాప్తి", "రాజసన్మానం", "ప్రయాణలాభము", "వివాదము", "మిత్రత్వము", "జ్వరభయము", "ధనలాభము", "బంధనం", 
//             "స్థానభ్రంశము", "విద్యాభంగము", "స్త్రీ భోగం", "ప్రయాణ జయం", "ప్రయాణ నాశము", "భూలాభము"
//         ],
//         "Monday": [
//             "కార్యహాని", "రాజపూజ్యత", "వాహన ప్రాప్తి", "స్త్రీ సౌఖ్యము", "భూలాభము", "స్థానభ్రంశము", "గుప్తధనలాభము", "వ్యవహారజయం", 
//             "ఉద్యోగము", "ప్రియభోజనం", "స్త్రీ లాభము", "రాజదర్శనం", "కార్యభంగం", "రోగపీడ", "కార్యసిద్ధి", "శత్రునాశము", 
//             "గో లాభము", "కార్యజయము", "ఆరోగ్యం", "మిత్రత్వము", "సౌఖ్యము", "కార్యభంగము", "వివాహజయం", "కార్యప్రాప్తి", 
//             "ధనలాభము", "విద్యాలాభము", "స్థిరకార్యనాశము", "ఉద్యోగజయం", "యాత్రా ప్రాప్తి", "రాజభయం"
//         ],
//         "Tuesday": [
//             "ధనలాభం", "ప్రయాణజయం", "దుఃఖము", "భూతభయము", "వాహనప్రాప్తి", "పరోపకారము", "వస్త్ర ప్రాప్తి", "ప్రయాణ నష్టం", 
//             "వివాదహాని", "శత్రుబాధ", "స్త్రీ లాభము", "కార్యనాశనము", "కష్టం", "జంతు భయం", "అగ్నిబాధ", "రోగపీడ", 
//             "పుత్రలాభము", "కార్యజయము", "చిక్కులు", "రాజ సన్మానం", "నమ్ము అగుట", "కార్యనష్టము", "అపజయం", "శత్రుజయం", 
//             "ఉద్యోగహాని", "జయప్రదము", "కార్యసిద్ధి", "కార్యలాభం", "సుఖసౌఖ్యం", "మిత్రత్వము"
//         ],
//         "Wednesday": [
//             "దుర్వార్తలు", "మనఃక్షోభం", "ధనలాభం", "యత్నకార్యసిద్ధి", "కార్యభంగము", "మహాభయము", "మనశ్చాంచల్యం", "ఉపద్రవములు", 
//             "జయప్రదము", "ప్రయాణభయము", "రాజసన్మానము", "ధనధాన్యవృద్ధి", "ఉద్యోగజయం", "లాభము", "ప్రయత్నజయం", "వస్త్ర లాభం", 
//             "సంతోషం", "క్షేమం", "స్వల్పలాభం", "కలహము", "ఇష్టసిద్ధి", "పుత్రలాభము", "ఉద్యోగజయం", "ప్రయాణజయం", 
//             "వ్యవహారజయం", "వివాహశుభం", "కార్యజయం", "మనఃక్లేశము", "బంధుసమాగము", "వాహనప్రమాదం"
//         ],
//         "Thursday": [
//             "ధనలాభం", "మనోభీష్టసిద్ధి", "అనారోగ్యం", "వాహన ప్రాప్తి", "వివాహశుభం", "సుఖనాశనం", "ఉద్యోగజయం", "స్వామిదర్శనం", 
//             "ప్రయాణభంగం", "కార్యసిద్ధి", "వ్యాపారజయం", "శత్రునాశం", "వివాహజయం", "రోగనాశం", "కలహప్రదం", "ఉద్యోగ నష్టం", "కోపతీవ్రత",
//             "కార్యజయం", "స్థాననాశం", "చోరభయం", "వివాహకలహం", "వివాదజయం", "యాత్రాశుభం", "ధైర్యహాని", "కార్యభంగం", 
//             "ప్రయాణక్షేమం", "వివాహ శుభం", "కలహప్రదం", "జ్వరశస్త్రబాధ", "విద్యాభివృద్ధి"
//         ],
//         "Friday": [
//             "కార్యసిద్ధి", "కార్యనాశము", "ధనలాభము", "రాజానుగ్రహం", "అపజయం", "కార్యజయం", "దుఃఖం-భయం","ధైర్యం", "కష్టం-నష్టం", 
//             "సౌఖ్యము", "అనుకూలము", "వస్తువాహనప్రాప్తి", "క్షేమం-లాభం", "కార్యవిజయం", "శస్త్ర భయం", "శత్రునాశం", "అతిభయము", 
//             "విద్యాసిద్ధి","రోగ బాధలు", "దుఃఖము", "వాహనప్రాప్తి", "స్త్రీ లాభము", "స్పోటకపీడ", "విషజంతుభయం", "ప్రయాణకష్టం", "శత్రుభయం", 
//             "కార్యనష్టం", "ప్రయాణసౌఖ్యం", "దుఃఖము", "రాజసన్మానం"  ],
//         "Saturday": [
//             "కార్యహాని", "సౌఖ్యము", "వివాహసిద్ధి", "మిత్రత్వం", "ప్రయాణజయం", "వాహనలాభం", "కార్యజయం", "రాజసన్మానం", 
//             "కార్యనష్టం", "ప్రయాణహాని", "వస్త్ర-స్త్రీలాభాలు", "మనశ్చాంచల్యం", "మిత్రనష్టం", "మిత్రప్రాప్తి", "స్త్రీ లాభం", 
//             "ధనలాభము", "ప్రయాణజయం", "ప్రయాణ నష్టం", "క్షేమం", "వాహనయోగం", "జ్ఞానవృద్ధి", "వినోదము", "కలహము", 
//             "ఉద్యోగనష్టం", "ప్రయత్నజయం", "మనస్తాపం", "శత్రునాశం", "విరోధనాశనం", "ప్రయాణ లాభం","ప్రియవార్తలు"
//         ]
//     };

//     for (let i = 0; i < 30; i++) {
//         const start1 = secondsToTime(sunrise, currentDate, is12HourFormat);
//         sunrise += interval1;
//         const end1 = secondsToTime(sunrise, currentDate, is12HourFormat);

//         const start2 = secondsToTime(sunset, currentDate, is12HourFormat);
//         sunset += interval2;
//         const end2 = secondsToTime(sunset, currentDate, is12HourFormat);

//         const isColored = weekdayRows[closestDay]?.includes(i);
//         const isWednesdayColored = closestDay === 'Wednesday' && i === 28;

//         newTableData.push({
//             start1,
//             end1,
//             start2,
//             end2,
//             sNo: i + 1,
//             value1: i === 0 ? secondsToTime(interval1, currentDate, is12HourFormat) 
//                 : i === 1 ? secondsToTime(interval2, currentDate, is12HourFormat) 
//                 : i === 2 ? secondsToTime(totalSec, currentDate, is12HourFormat) 
//                 : i === 3 ? 'sunriseToday' 
//                 : i === 4 ? 'sunsetToday' 
//                 : i === 5 ? 'sunriseTmrw' : '',
//             value2: i === 3 ? sunriseToday 
//                 : i === 4 ? sunsetToday 
//                 : i === 5 ? sunriseTmrw : '',
//             isColored,
//             isWednesdayColored,
//             weekday: weekdayValues[closestDay][i]
//         });
//     }

//     newTableData.push({
//         start1: sunsetToday,
//         end1: '',
//         weekday: '',
//         start2: sunriseTmrw,
//         end2: '',
//         sNo: '',
//         value1: '',
//         value2: '',
//         isColored: false
//     });

// if (showNonBlue) {
//     const filteredTableData = newTableData.filter(row => {
//         return !row.isColored && !row.isWednesdayColored;
//     });
//     res.json({ newTableData: filteredTableData });
// } else {
//     res.json({ newTableData });
// }

// });

// Levenshtein distance function
function levenshtein(a, b) {
    let tmp;
    let i, j;
    const alen = a.length;
    const blen = b.length;
    const arr = [];

    if (alen === 0) { return blen; }
    if (blen === 0) { return alen; }

    for (i = 0; i <= blen; i++) { arr[i] = [i]; }
    for (j = 0; j <= alen; j++) { arr[0][j] = j; }

    for (i = 1; i <= blen; i++) {
        for (j = 1; j <= alen; j++) {
            tmp = a[j - 1] === b[i - 1] ? 0 : 1;
            arr[i][j] = Math.min(arr[i - 1][j] + 1, arr[i][j - 1] + 1, arr[i - 1][j - 1] + tmp);
        }
    }

    return arr[blen][alen];
}

// Possible correct day names
const dayNames = {
    "Monday": ["monday", "mon", "mondy", "moday"],
    "Tuesday": ["tuesday", "tues", "tuesd", "tueday"],
    "Wednesday": ["wednesday", "wed", "wednes", "wensday"],
    "Thursday": ["thursday", "thur", "thurs", "thurday"],
    "Friday": ["friday", "fri", "frid", "fryday"],
    "Saturday": ["saturday", "sat", "satur", "saterday"],
    "Sunday": ["sunday", "sun", "sund", "sundey"]
};

// Find the closest match for a given input
// Find the closest match for a given input
const findClosestDay = (input) => {
    logger.debug({ message: 'findClosestDay called', input });
    let minDistance = Infinity;
    let closestDay = "";

    const normalizedInput = input.toLowerCase();

    for (const [day, variants] of Object.entries(dayNames)) {
        for (const variant of variants) {
            const distance = levenshtein(normalizedInput, variant.toLowerCase());
            if (distance < minDistance) {
                minDistance = distance;
                closestDay = day;
            }
        }
    }
    logger.debug({ message: 'Closest day found', closestDay });
    return closestDay;
}

const generateTableData = (sunriseToday, sunsetToday, sunriseTmrw, weekday, is12HourFormat, currentDate, showNonBlue) => {
    const totalSec = timeToSeconds('24:00:00');

    const sunriseTodaySec = timeToSeconds(sunriseToday);
    const sunsetTodaySec = timeToSeconds(sunsetToday);
    const sunriseTmrwSec = timeToSeconds(sunriseTmrw);

    const interval1 = (sunsetTodaySec - sunriseTodaySec) / 30;
    const interval2 = ((totalSec + sunriseTmrwSec) - sunsetTodaySec) / 30;
    const newTableData = [];
    let sunrise = sunriseTodaySec;
    let sunset = sunsetTodaySec;

    const weekdayRows = {
        "Monday": [0, 5, 12, 13, 21, 26, 29],
        "Tuesday": [2, 3, 7, 8, 9, 11, 12, 13, 14, 15, 18, 20, 21, 22, 24],
        "Wednesday": [0, 1, 4, 5, 6, 7, 9, 19, 27, 29],
        "Thursday": [2, 5, 8, 14, 15, 16, 18, 19, 20, 23, 24, 27, 28],
        "Friday": [1, 4, 6, 8, 14, 16, 18, 19, 22, 23, 24, 25, 26, 28],
        "Saturday": [0, 8, 9, 11, 12, 17, 22, 23, 25],
        "Sunday": [2, 3, 4, 5, 10, 14, 16, 19, 21, 23, 24, 25, 28]
    };
    logger.debug({ message: 'generateTableData called for weekday', weekday });
    const closestDay = findClosestDay(weekday);
    logger.debug({ message: 'generateTableData resolved closestDay', closestDay });
    const weekdayValues = {
        "Sunday": [
            "ప్రయాణకార్యసిద్ధి", "విద్యాజయం", "ఉద్యోగ కష్టం", "శత్రువృద్ధి", "చోరభయం", "దుఃఖము", "అభీష్టసిద్ధి", "సౌఖ్యం-లాభం",
            "వివాహాదిశుభాని", "మిత్రవృద్ధి", "మృత్యుభయం", "ఆరోగ్యం", "శుభకార్యజయం", "ప్రయత్నఫలం", "విషభయం", "ఉద్యోగం",
            "జ్వరప్రాప్తి", "రాజసన్మానం", "ప్రయాణలాభము", "వివాదము", "మిత్రత్వము", "జ్వరభయము", "ధనలాభము", "బంధనం",
            "స్థానభ్రంశము", "విద్యాభంగము", "స్త్రీ భోగం", "ప్రయాణ జయం", "ప్రయాణ నాశము", "భూలాభము"
        ],
        "Monday": [
            "కార్యహాని", "రాజపూజ్యత", "వాహన ప్రాప్తి", "స్త్రీ సౌఖ్యము", "భూలాభము", "స్థానభ్రంశము", "గుప్తధనలాభము", "వ్యవహారజయం",
            "ఉద్యోగము", "ప్రియభోజనం", "స్త్రీ లాభము", "రాజదర్శనం", "కార్యభంగం", "రోగపీడ", "కార్యసిద్ధి", "శత్రునాశము",
            "గో లాభము", "కార్యజయము", "ఆరోగ్యం", "మిత్రత్వము", "సౌఖ్యము", "కార్యభంగము", "వివాహజయం", "కార్యప్రాప్తి",
            "ధనలాభము", "విద్యాలాభము", "స్థిరకార్యనాశము", "ఉద్యోగజయం", "యాత్రా ప్రాప్తి", "రాజభయం"
        ],
        "Tuesday": [
            "ధనలాభం", "ప్రయాణజయం", "దుఃఖము", "భూతభయము", "వాహనప్రాప్తి", "పరోపకారము", "వస్త్ర ప్రాప్తి", "ప్రయాణ నష్టం",
            "వివాదహాని", "శత్రుబాధ", "స్త్రీ లాభము", "కార్యనాశనము", "కష్టం", "జంతు భయం", "అగ్నిబాధ", "రోగపీడ",
            "పుత్రలాభము", "కార్యజయము", "చిక్కులు", "రాజ సన్మానం", "నమ్ము అగుట", "కార్యనష్టము", "అపజయం", "శత్రుజయం",
            "ఉద్యోగహాని", "జయప్రదము", "కార్యసిద్ధి", "కార్యలాభం", "సుఖసౌఖ్యం", "మిత్రత్వము"
        ],
        "Wednesday": [
            "దుర్వార్తలు", "మనఃక్షోభం", "ధనలాభం", "యత్నకార్యసిద్ధి", "కార్యభంగము", "మహాభయము", "మనశ్చాంచల్యం", "ఉపద్రవములు",
            "జయప్రదము", "ప్రయాణభయము", "రాజసన్మానము", "ధనధాన్యవృద్ధి", "ఉద్యోగజయం", "లాభము", "ప్రయత్నజయం", "వస్త్ర లాభం",
            "సంతోషం", "క్షేమం", "స్వల్పలాభం", "కలహము", "ఇష్టసిద్ధి", "పుత్రలాభము", "ఉద్యోగజయం", "ప్రయాణజయం",
            "వ్యవహారజయం", "వివాహశుభం", "కార్యజయం", "మనఃక్లేశము", "బంధుసమాగము", "వాహనప్రమాదం"
        ],
        "Thursday": [
            "ధనలాభం", "మనోభీష్టసిద్ధి", "అనారోగ్యం", "వాహన ప్రాప్తి", "వివాహశుభం", "సుఖనాశనం", "ఉద్యోగజయం", "స్వామిదర్శనం",
            "ప్రయాణభంగం", "కార్యసిద్ధి", "వ్యాపారజయం", "శత్రునాశం", "వివాహజయం", "రోగనాశం", "కలహప్రదం", "ఉద్యోగ నష్టం", "కోపతీవ్రత",
            "కార్యజయం", "స్థాననాశం", "చోరభయం", "వివాహకలహం", "వివాదజయం", "యాత్రాశుభం", "ధైర్యహాని", "కార్యభంగం",
            "ప్రయాణక్షేమం", "వివాహ శుభం", "కలహప్రదం", "జ్వరశస్త్రబాధ", "విద్యాభివృద్ధి"
        ],
        "Friday": [
            "కార్యసిద్ధి", "కార్యనాశము", "ధనలాభము", "రాజానుగ్రహం", "అపజయం", "కార్యజయం", "దుఃఖం-భయం", "ధైర్యం", "కష్టం-నష్టం",
            "సౌఖ్యము", "అనుకూలము", "వస్తువాహనప్రాప్తి", "క్షేమం-లాభం", "కార్యవిజయం", "శస్త్ర భయం", "శత్రునాశం", "అతిభయము",
            "విద్యాసిద్ధి", "రోగ బాధలు", "దుఃఖము", "వాహనప్రాప్తి", "స్త్రీ లాభము", "స్పోటకపీడ", "విషజంతుభయం", "ప్రయాణకష్టం", "శత్రుభయం",
            "కార్యనష్టం", "ప్రయాణసౌఖ్యం", "దుఃఖము", "రాజసన్మానం"
        ],
        "Saturday": [
            "కార్యహాని", "సౌఖ్యము", "వివాహసిద్ధి", "మిత్రత్వం", "ప్రయాణజయం", "వాహనలాభం", "కార్యజయం", "రాజసన్మానం",
            "కార్యనష్టం", "ప్రయాణహాని", "వస్త్ర-స్త్రీలాభాలు", "మనశ్చాంచల్యం", "మిత్రనష్టం", "మిత్రప్రాప్తి", "స్త్రీ లాభం",
            "ధనలాభము", "ప్రయాణజయం", "ప్రయాణ నష్టం", "క్షేమం", "వాహనయోగం", "జ్ఞానవృద్ధి", "వినోదము", "కలహము",
            "ఉద్యోగనష్టం", "ప్రయత్నజయం", "మనస్తాపం", "శత్రునాశం", "విరోధనాశనం", "ప్రయాణ లాభం", "ప్రియవార్తలు"
        ]
    };

    for (let i = 0; i < 30; i++) {
        const start1 = secondsToTime(sunrise, currentDate, is12HourFormat);
        sunrise += interval1;
        const end1 = secondsToTime(sunrise, currentDate, is12HourFormat);

        const start2 = secondsToTime(sunset, currentDate, is12HourFormat);
        sunset += interval2;
        const end2 = secondsToTime(sunset, currentDate, is12HourFormat);

        const isColored = weekdayRows[closestDay]?.includes(i);
        const isWednesdayColored = closestDay === 'Wednesday' && i === 28;

        newTableData.push({
            start1,
            end1,
            start2,
            end2,
            sNo: i + 1,
            value1: i === 0 ? secondsToTime(interval1, currentDate, is12HourFormat)
                : i === 1 ? secondsToTime(interval2, currentDate, is12HourFormat)
                    : i === 2 ? secondsToTime(totalSec, currentDate, is12HourFormat)
                        : i === 3 ? 'sunriseToday'
                            : i === 4 ? 'sunsetToday'
                                : i === 5 ? 'sunriseTmrw' : '',
            value2: i === 3 ? sunriseToday
                : i === 4 ? sunsetToday
                    : i === 5 ? sunriseTmrw : '',
            isColored,
            isWednesdayColored,
            weekday: weekdayValues[closestDay][i]
        });
    }

    newTableData.push({
        start1: sunsetToday,
        end1: '',
        weekday: '',
        start2: sunriseTmrw,
        end2: '',
        sNo: '',
        value1: '',
        value2: '',
        isColored: false
    });

    let filteredTableData = newTableData;
    if (showNonBlue) {
        filteredTableData = newTableData.filter(row => !row.isColored && !row.isWednesdayColored);
    }

    return filteredTableData;
};

router.post('/update-table', (req, res) => {
    logger.info({ message: 'Route /update-table called', bodySummary: { ...req.body, sunriseToday: '...' } }); // summarizing to avoid spam
    const { sunriseToday, sunsetToday, sunriseTmrw, weekday, is12HourFormat, currentDate, showNonBlue } = req.body;
    const filteredTableData = generateTableData(sunriseToday, sunsetToday, sunriseTmrw, weekday, is12HourFormat, currentDate, showNonBlue);
    /* logger.info({ message: 'Route /update-table completed', rows: filteredTableData.length }); */
    res.json({ newTableData: filteredTableData });
});

// const createBharagvTable = async (city, date, showNonBlue, is12HourFormat) => { 
//     const sun = await getSunTimesForCity(city, date);
//     if (!sun) return [];  // Ensure sunTimes is available
//     const weekday = getWeekday(date);
//     const tableData = generateTableData(
//         sun.sunTimes.sunriseToday, 
//         sun.sunTimes.sunsetToday, 
//         sun.sunTimes.sunriseTmrw, 
//         weekday, 
//         is12HourFormat, 
//         date, 
//         showNonBlue
//     );

//     return tableData;
// };
const createBharagvTable = async (city, date, showNonBlue, is12HourFormat, lat, lng, timeZone) => {
    logger.info({ message: 'createBharagvTable called', city, date, showNonBlue, is12HourFormat, lat, lng, timeZone });
    const sun = await getSunTimesForCity(city, date, lat, lng); // getSunTimesForCity already handles lat/lng logic but we might need to update it to use timeZone if passed.
    // Actually getSunTimesForCity calls getTimezoneFromCoordinates if lat/lng are passed. 
    // If we have timeZone, we should pass it too? 
    // getSunTimesForCity definition at line 174: async function getSunTimesForCity(city, date, lat, lng)
    // Inside it (line 184): timeZone: getTimezoneFromCoordinates(parseFloat(lat), parseFloat(lng))
    // It ignores passed timeZone. But that's okay for now as getTimezoneFromCoordinates is local/fast?
    // Wait, getTimezoneFromCoordinates uses geo-tz (local library). So it is fast.

    if (!sun) {
        logger.warn({ message: 'Sun times not available', city, date });
        return [];
    }

    const weekday = getWeekday(date);
    // console.log("weekday const ",weekday);
    // Generate tableData with the sun times and other parameters
    const tableData = generateTableData(
        sun.sunTimes.sunriseToday,
        sun.sunTimes.sunsetToday,
        sun.sunTimes.sunriseTmrw,
        weekday,
        is12HourFormat,
        date,
        showNonBlue
    );

    logger.info({ message: 'generateTableData result size', count: tableData.length });

    // Format the table data by processing the first and second time intervals
    const dummyData = [];

    // Process the first 30 rows for timeInterval1
    for (let i = 0; i < 30; i++) {
        // ... loop content unchanged logig ...
        const row = tableData[i];
        if (row) {
            dummyData.push({
                sNo: i + 1,
                start1: row.start1 || "",
                end1: row.end1 || "",
                start2: row.start2 || "",
                end2: row.end2 || "",
                timeInterval1: row.start1 && row.end1 ? `${row.start1} to ${row.end1}` : "",
                timeInterval2: row.start2 && row.end2 ? `${row.start2} to ${row.end2}` : "",
                weekday: row.weekday || "-",
                value1: row.value1 || "",
                value2: row.value2 || "",
                isColored: row.isColored || false,
                isWednesdayColored: row.isWednesdayColored || false,
            });
        }
    }



    // Set the formatted data to BharagavaPanchagamData
    const BharagavaPanchagamData = dummyData;
    logger.info({ message: 'createBharagvTable completed', rows: BharagavaPanchagamData.length });

    return BharagavaPanchagamData;  // Return the formatted data if needed
};


// API endpoint to get the Bharagv table based on city, date, showNonBlue, and is12HourFormat
router.get('/getBharagvTable', async (req, res) => {
    const { city, date, showNonBlue, is12HourFormat, lat, lng, timeZone } = req.query;
    logger.info({ message: 'Route /getBharagvTable called', query: req.query });

    if (!city || !date) {
        logger.warn('Route /getBharagvTable missing params');
        return res.status(400).send('City and date are required');
    }
    if (showNonBlue === undefined || is12HourFormat === undefined) {
        return res.status(400).send('showNonBlue and is12HourFormat are required');
    }

    try {
        const table = await createBharagvTable(city, date, showNonBlue === 'true', is12HourFormat === 'true', lat, lng, timeZone);
        res.json(table); // Send the table data as a JSON response
    } catch (error) {
        logger.error({ message: 'Route /getBharagvTable error', error: error.message });
        console.error(error);
        res.status(500).send('Error generating table');
    }
});
////////////////////////////////////////////////END----BHARGAV--PANCHAGAM//////////////////////////////////

// Function to create the dummy table with formatted time intervals
// Function to create the dummy table with formatted time intervals
const createDrikTable = async (city, date, lat, lng, timeZone) => {
    logger.info({ message: 'createDrikTable called (sync with main)', city, date, lat, lng });
    // Fetch the muhurat data using the scraper (fetchmuhurat_old) as per user request
    const filteredData = await fetchmuhurat_old(city, date); 

    const baseDate = new Date(date);

    // Create the drikTable by mapping over filteredData
    const drikTable = filteredData.map((row) => {
        const [startTimeStr, endTimeStr] = row.time.split(" to ");

        let endTimeWithoutDate, endDatePart;

        if (endTimeStr && endTimeStr.includes(", ")) {
            [endTimeWithoutDate, endDatePart] = endTimeStr.split(", ");
        } else {
            endTimeWithoutDate = endTimeStr || "";
            endDatePart = null;
        }

        const start = startTimeStr.trim();
        const end = endTimeWithoutDate.trim();
        
        // Calculate duration if possible
        let duration = "";
        try {
            const startDate = parseTime(start, baseDate, false);
            const endDate = parseTime(end, baseDate, !!endDatePart);
            if (startDate && endDate) {
                const diffMs = endDate - startDate;
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                duration = `${hours}h ${minutes}m`;
            }
        } catch (e) {
            logger.warn({ message: 'Error calculating duration', error: e.message });
        }

        const formatWithDate = (timeStr, datePart) => {
            if (!datePart) return timeStr;
            return `${datePart}, ${timeStr}`;
        };

        const timeIntervalFormatted = endDatePart 
            ? `${formatWithDate(start, endDatePart)} to ${formatWithDate(end, endDatePart)}`
            : `${start} to ${end}`;

        return {
            category: row.category,
            muhurat: row.muhurat,
            time: timeIntervalFormatted,
            start: start,
            end: end,
            nextDay: !!endDatePart,
            duration: duration
        };
    });

    logger.info({ message: 'createDrikTable completed', rows: drikTable.length });
    return drikTable;
};
router.get('/getDrikTable', async (req, res) => {
    const { city, date, goodTimingsOnly, lat, lng, timeZone } = req.query;
    logger.info({ message: 'Route /getDrikTable called', query: req.query });

    // If goodTimingsOnly is not provided, set it to true by default
    const isGoodTimingsOnly = goodTimingsOnly !== 'false'; // Defaults to true unless 'false' is explicitly passed

    if (!city || !date) {
        return res.status(400).send('City and date are required');
    }

    try {
        // Fetch the complete table
        const table = await createDrikTable(city, date, lat, lng, timeZone);

        // If goodTimingsOnly is true, filter the table to include only "Good" category
        if (isGoodTimingsOnly) {
            const filteredTable = table.filter(row => row.category === 'Good');
            return res.json(filteredTable); // Send the filtered table
        }

        // If goodTimingsOnly is false, return the full table
        res.json(table); // Send the complete table as a JSON response
    } catch (error) {
        logger.error({ message: 'Route /getDrikTable error', error: error.message });
        console.error(error);
        res.status(500).send('Error generating table');
    }
});



////////////////////////////////////////////////COMBINE--PANCHAGAM//////////////////////////////////


// Helper function to parse time strings (without seconds)
const parseTime = (timeStr, baseDate, isNextDay = false) => {
    if (!timeStr) return null;

    const parts = timeStr.trim().split(" ");
    if (parts.length < 2) return null;
    
    const time = parts[0];
    const period = parts[1].replace(",", "").toUpperCase(); // Clean the period part
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(baseDate);

    date.setHours(
        period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours,
        minutes || 0,
        0
    );

    if (isNextDay) date.setDate(date.getDate() + 1);

    return date;
};

// Function to split intervals and handle incomplete intervals
const splitInterval = (interval, baseDate) => {
    if (!interval || interval.trim() === "") return [null, null];

    const [startRaw, endRaw] = interval.split(" to ");
    if (!startRaw || !endRaw) return [null, null];

    const parsePart = (raw) => {
        let clean = raw.trim();
        let nextDay = false;
        
        // Handle format: "Mar 19 , 12:04 AM" or "Mar 19, 12:04 AM"
        if (clean.includes(",")) {
            const parts = clean.split(",");
            // If the comma is in the middle, the time might be second part
            if (parts[0].trim().match(/^[A-Za-z]+ [0-9]+$/)) {
                 clean = parts[1].trim(); 
            } else {
                 clean = parts[0].trim();
            }
            nextDay = true;
        } 
        
        // Handle format: "02:28 AM (Mar 19)"
        if (clean.includes("(")) {
            clean = clean.split("(")[0].trim();
            nextDay = true;
        }

        return parseTime(clean, baseDate, nextDay);
    };

    return [parsePart(startRaw), parsePart(endRaw)];
};

// Function to validate time interval
const validateInterval = (start, end) => {
    if (!start || !end) {
        //   console.log("Invalid Interval:", start, end);
        return false;
    }
    // console.log("Valid Interval:", start, end);
    return true;
};

// Function to process Muhurat and Panchangam data
const processMuhuratAndPanchangam = (muhuratData, panchangamData, baseDate) => {
    logger.info({ message: 'processMuhuratAndPanchangam called', muhuratRows: muhuratData.length, panchangamRows: panchangamData.length });
    const mergedData = [];
    let i = 0;

    const formatTimeForUI = (dateObj, baseDate) => {
        if (!dateObj) return "";
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        const timePart = dateObj.toLocaleTimeString('en-US', options);
        if (dateObj.getDate() !== baseDate.getDate()) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()} , ${timePart}`;
        }
        return timePart;
    };

    muhuratData.forEach((muhuratItem) => {
        // Use normalized time from Muhurat item if available (start/end we created in createDrikTable)
        const [muhuratStart, muhuratEnd] = splitInterval(muhuratItem.time, baseDate);
        if (muhuratStart && muhuratEnd && validateInterval(muhuratStart, muhuratEnd)) {
            const weekdaysArray = [];

            panchangamData.forEach((panchangamItem) => {
                // Check both timeInterval1 and timeInterval2
                const intervals = [panchangamItem.timeInterval1, panchangamItem.timeInterval2].filter(t => t);
                
                intervals.forEach(timeInterval => {
                    const [start, end] = splitInterval(timeInterval, baseDate);
                    if (start && end && validateInterval(start, end)) {
                        if (start < muhuratEnd && end > muhuratStart) {
                            if (!weekdaysArray.find((item) => item.weekday === panchangamItem.weekday && item.time === `${formatTimeForUI(start, baseDate)} - ${formatTimeForUI(end, baseDate)}`)) {
                                weekdaysArray.push({
                                    weekday: panchangamItem.weekday,
                                    time: `${formatTimeForUI(start, baseDate)} - ${formatTimeForUI(end, baseDate)}`,
                                });
                            }
                        }
                    }
                });
            });

            mergedData.push({
                sno: i + 1,
                type: "Muhurat",
                description: `${muhuratItem.muhurat} (${muhuratItem.category})`,
                timeInterval: muhuratItem.time,
                weekdays: weekdaysArray.length > 0 ? weekdaysArray : [{ weekday: "-", time: "-" }],
            });
            i++;
        }
    });

    logger.info({ message: 'processMuhuratAndPanchangam completed', mergedRows: mergedData.length });
    return mergedData;
};

// API endpoint to fetch combined data
// API endpoint to fetch combined data
router.post("/combine", (req, res) => {
    logger.info({ message: 'Route /combine called', city: req.body.city, date: req.body.date });
    const { muhuratData, panchangamData, city, date } = req.body;

    if (!muhuratData || !panchangamData || !city || !date) {
        logger.warn('Route /combine missing data');
        return res.status(400).json({ error: "Invalid input data" });
    }

    const baseDate = new Date(date);
    const finalData = processMuhuratAndPanchangam(muhuratData, panchangamData, baseDate);

    res.json(finalData);
});



// Helper to convert YYYY-MM-DD to DD/MM/YYYY
function convertToDDMMYYYY(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

router.post("/combine-image", async (req, res) => {
    logger.info({ message: 'Route /combine-image called', body: req.body });
    let { city, date, showNonBlue, is12HourFormat, lat, lng, timeZone } = req.body;

    if (!city || !date) {
        return res.status(400).json({ error: "City and Date are required" });
    }

    if (showNonBlue === undefined) showNonBlue = true;
    if (is12HourFormat === undefined) is12HourFormat = true;

    try {
        const dateDDMMYYYY = convertToDDMMYYYY(date);

        // 1. Fetch Drik Data (requires DD/MM/YYYY)
        const fullMuhuratData = await createDrikTable(city, dateDDMMYYYY, lat, lng, timeZone);
        // Filter Drik Data based on showNonBlue (equivalent to goodTimingsOnly)
        const muhuratData = showNonBlue ? fullMuhuratData.filter(row => row.category === 'Good') : fullMuhuratData;

        // 2. Fetch Panchangam Data (requires YYYY-MM-DD)
        const panchangamData = await createBharagvTable(city, date, showNonBlue, is12HourFormat, lat, lng, timeZone);

        const baseDate = new Date(date);
        const finalData = processMuhuratAndPanchangam(muhuratData, panchangamData, baseDate);

        // Generate Image using Canvas instead of Puppeteer
        const buffer = await renderAstrologyTable(
            "Combined Muhurat & Panchanga",
            city,
            date,
            ["No.", "Type", "Description", "Time Interval", "Weekdays"],
            finalData,
            'combined'
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=combined-${city}-${date}.png`);
        res.send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});
// Add these new endpoints after your existing /combine-image endpoint

router.post("/getDrikTable-image", async (req, res) => {
    logger.info({ message: 'Route /getDrikTable-image called', body: req.body });
    const { city, date, goodTimingsOnly } = req.body;

    if (!city || !date) {
        return res.status(400).json({ error: "Invalid input data" });
    }

    try {
        // Fetch the table data
        const tableData = await createDrikTable(city, date);
        if (!tableData || tableData.length === 0) {
            throw new Error('No table data available');
        }

        const finalData = goodTimingsOnly ? tableData.filter(row => row.category === 'Good') : tableData;

        // Generate Image using Canvas instead of Puppeteer
        const buffer = await renderAstrologyTable(
            "Drik Panchang Muhuruts",
            city,
            date,
            ["Muhurat", "Category", "Time"],
            finalData
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=muhuruts-${city}-${date}.png`);
        res.send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});



router.post("/getBharagvTable-image", async (req, res) => {
    logger.info({ message: 'Route /getBharagvTable-image called', body: req.body });
    const { city, date, showNonBlue, is12HourFormat, lat, lng, timeZone } = req.body;

    if (!city || !date) {
        return res.status(400).send('City and date are required');
    }
    try {
        const table = await createBharagvTable(city, date, showNonBlue === 'true', is12HourFormat, lat, lng, timeZone);

        // Generate Image using Canvas instead of Puppeteer
        const buffer = await renderAstrologyTable(
            "Bhargava Panchangam",
            city,
            date,
            ["Start-End 1", "Weekday", "Start-End 2", "S.No"],
            table,
            'bhargava'
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=bhargava-${city}-${date}.png`);
        res.send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

router.post("/getSwissTable-image", async (req, res) => {
    logger.info({ message: 'Route /getSwissTable-image called', body: req.body });
    const { city, date, lat, lng, timeZone } = req.body;

    if (!city || !date) return res.status(400).send('City and date are required');

    try {
        const table = await fetchmuhurat(city, date, lat, lng, timeZone);

        // Generate Image using Canvas instead of Puppeteer
        const buffer = await renderAstrologyTable(
            "Swiss Panchaka Muhurats",
            city,
            date,
            ["Muhurat & Status", "Timing"],
            table.map(item => ({
                muhurat: item.muhurat,
                time: `${item.start} - ${item.end}`,
                category: item.category
            }))
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=swiss-${city}-${date}.png`);
        res.send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});















router.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// Function to fetch Muhurat data for a given city and date
// Function to fetch Muhurat data for a given city and date
// Original scraper function (Old Tool)
const fetchmuhurat_old = async (city, date) => {
    logger.info({ message: 'fetchmuhurat_old (Scraper) called', city, date });
    try {
        let formattedDate = date;
        if (date.includes('-')) {
            const [y, m, d] = date.split('-');
            formattedDate = `${d}/${m}/${y}`;
        }
        const geoNameId = await getGeoNameId(city);
        const url = `https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html?geoname-id=${geoNameId}&date=${formattedDate}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const muhuratData = [];
        $('.dpMuhurtaRow').each((i, element) => {
            const muhurtaName = $(element).find('.dpMuhurtaName').text().trim();
            const muhurtaTime = $(element).find('.dpMuhurtaTime').text().trim();
            const [name, category] = muhurtaName.split(' - ');
            muhuratData.push({
                muhurat: name,
                category: category || '',
                time: muhurtaTime
            });
        });
        logger.info({ message: 'fetchmuhurat_old completed', count: muhuratData.length });
        return muhuratData;
    } catch (error) {
        logger.error({ message: "Error in old fetchmuhurat scraper", error: error.message, city, date });
        throw new Error('Error fetching data from external source');
    }
};

const fetchmuhurat = async (city, date, lat, lng, timeZone) => {
    logger.info({ message: 'fetchmuhurat (Swiss) called', city, date, lat, lng, timeZone });
    try {
        let year, month, day;
        if (date.includes('/')) {
            [day, month, year] = date.split('/');
        } else if (date.includes('-')) {
            [year, month, day] = date.split('-');
        } else {
            throw new Error('Invalid date format');
        }

        const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        let coords;
        if (lat && lng) {
            const { getTimezoneFromCoordinates } = require('../utils/panchangHelper');
            coords = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timeZone: timeZone || getTimezoneFromCoordinates(parseFloat(lat), parseFloat(lng))
            };
        } else {
            // 1. Get coordinates
            coords = await fetchCoordinates(city);
        }

        if (!coords) throw new Error('City not found');

        // 2. Get sun times (we need sunrise today and tomorrow for the Vedic day)
        const sunTimesData = await fetchSunTimes(coords.lat, coords.lng, isoDate, coords.timeZone);
        if (!sunTimesData) throw new Error('Could not calculate sun times');

        // 3. Use Swiss calculation from our helper
        const { calculateSwissPanchakaRahita } = require('../utils/panchangHelper');
        const dateObj = new Date(year, month - 1, day, 12, 0, 0);

        const muhuratData = await calculateSwissPanchakaRahita(
            dateObj,
            coords.lat,
            coords.lng,
            coords.timeZone,
            sunTimesData.sunriseToday,
            sunTimesData.sunsetToday,
            sunTimesData.sunriseTmrw
        );

        logger.info({ message: 'fetchmuhurat Swiss completed', count: muhuratData.length });
        return muhuratData;

    } catch (error) {
        logger.error({ message: "Error in Swiss fetchmuhurat", error: error.message, city, date });
        throw new Error('Error calculating muhurat data');
    }
};





// Route to fetch Muhurat data with dynamic city and date input
router.post('/fetch_muhurat', async (req, res) => {
    const { city, date } = req.body;  // Get city and date from the request body
    logger.info({ message: 'Route /fetch_muhurat called', city, date });

    try {
        // Call the fetchmuhurat function with city and date
        const muhuratData = await fetchmuhurat(city, date);

        // Return the data as JSON response
        res.json(muhuratData);
    } catch (error) {
        logger.error({ message: "Error in route fetching Muhurat data", error: error.message });
        console.error("Error in route fetching Muhurat data:", error);
        res.status(500).send('Error fetching data');
    }
});

// Old Scraper Route
router.post('/fetch_muhurat_old', async (req, res) => {
    const { city, date } = req.body;
    logger.info({ message: 'Route /fetch_muhurat_old called', city, date });
    try {
        // Handle date formats (DD/MM/YYYY or YYYY-MM-DD)
        let normalizedDate = date;
        if (date.includes('/')) {
            const [d, m, y] = date.split('/');
            normalizedDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        }
        
        // Use the improved createDrikTable with duration logic
        const muhuratData = await createDrikTable(city, normalizedDate);
        res.json(muhuratData);
    } catch (error) {
        logger.error({ message: "Error in /fetch_muhurat_old route", error: error.message });
        res.status(500).send('Error fetching old data');
    }
});



router.post('/fetch_muhurat_table', async (req, res) => {
    logger.info({ message: 'Route /fetch_muhurat_table called', body: req.body });
    const { city, date } = req.body;

    try {
        const muhuratData = await fetchmuhurat(city, date);

        let htmlContent = `
            <html>
            <head>
                <style>
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid black; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Muhurat Table for ${city} on ${date}</h2>
                <table>
                    <tr>
                        <th>Muhurat</th>
                        <th>Category</th>
                        <th>Time</th>
                    </tr>`;

        muhuratData.forEach(muhurat => {
            htmlContent += `
                    <tr>
                        <td>${muhurat.muhurat}</td>
                        <td>${muhurat.category}</td>
                        <td>${muhurat.time}</td>
                    </tr>`;
        });

        htmlContent += `</table></body></html>`;

        res.send(htmlContent);  // Send HTML response
    } catch (error) {
        console.error("Error generating HTML table:", error);
        res.status(500).json({ error: "Failed to generate HTML" });
    }
});










// Define routes
router.get('/fetchCoordinates/:city', async (req, res) => {
    const city = req.params.city;
    logger.info({ message: 'Route /fetchCoordinates called', city });
    const coordinates = await fetchCoordinates(city);
    if (coordinates) {
        res.json(coordinates);
    }
    else {
        res.status(404).json({ error: 'Coordinates not found' });
    }
});

router.get('/fetchCityName/:lat/:lng', async (req, res) => {
    const { lat, lng } = req.params;
    logger.info({ message: 'Route /fetchCityName called', lat, lng });
    const cityInfo = await fetchCityName(lat, lng);
    if (cityInfo) {
        // logger2.info("City Name Found: "+cityInfo);
        res.json(cityInfo);
    } else {
        res.status(404).json({ error: 'City name not found' });
    }
});

router.get('/convertToLocalTime', (req, res) => {
    const { utcDate, timeZone } = req.query;
    logger.info({ message: 'Route /convertToLocalTime called', utcDate, timeZone });
    const localTime = convertToLocalTime(utcDate, timeZone);
    res.json({ localTime });
});

router.get('/fetchSunTimes/:lat/:lng/:date', async (req, res) => {
    const { lat, lng, date } = req.params;
    const timeZone = req.query.timeZone; // Pass timeZone as a query parameter
    logger.info({ message: 'Route /fetchSunTimes called', lat, lng, date, timeZone });
    const sunTimes = await fetchSunTimes(lat, lng, date, timeZone);
    if (sunTimes) {
        res.json(sunTimes);
    } else {
        res.status(404).json({ error: 'Sun times not found' });
    }
});

router.get('/getWeekday/:dateString', (req, res) => {
    const { dateString } = req.params;
    logger.info({ message: 'Route /getWeekday called', dateString });
    const weekday = getWeekday(dateString);
    res.json({ weekday });
});

router.get('/currentdateByTimeZone/:timezone', (req, res) => {
    const { timezone } = req.params;
    logger.info({ message: 'Route /currentdateByTimeZone called', timezone });
    const datetoday = getCurrentDateInTimeZone(timezone);
    res.json({ datetoday });
});


router.get('/getSunTimesForCity/:city/:date', async (req, res) => {
    const { city, date } = req.params;
    const { lat, lng } = req.query;
    logger.info({ message: 'Route /getSunTimesForCity called', city, date, lat, lng });
    const sunTimes = await getSunTimesForCity(city, date, lat, lng);
    if (sunTimes) {
        res.json(sunTimes);
    } else {
        res.status(404).json({ error: 'Sun times for city not found' });
    }
});

// New endpoint for comprehensive Panchang data
router.get('/getPanchangData', async (req, res) => {
    logger.info({ message: 'Route /getPanchangData called', query: req.query });
    const { city, date, lat, lng, system } = req.query;

    if (!city || !date) {
        return res.status(400).json({ error: 'City and date are required' });
    }

    try {
        let coords;
        if (lat && lng && lat !== 'null' && lng !== 'null') {
            const { getTimezoneFromCoordinates } = require('../utils/panchangHelper');
            coords = {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                timeZone: getTimezoneFromCoordinates(parseFloat(lat), parseFloat(lng))
            };
            logger.info({ message: 'Using coordinates from query for /getPanchangData', coords });
        } else {
            // Get coordinates for the city
            coords = await fetchCoordinates(city);
        }

        if (!coords) {
            return res.status(404).json({ error: 'City not found' });
        }

        // Get sun times first
        const sunTimesData = await fetchSunTimes(coords.lat, coords.lng, date, coords.timeZone);
        if (!sunTimesData) {
            return res.status(500).json({ error: 'Failed to fetch sun times' });
        }

        // Handle Ancient Astrology Systems if requested (skip if SWISS or empty)
        if (system && system.toUpperCase() !== 'SWISS' && ['VAKYA', 'KP'].includes(system.toUpperCase())) {
            const AstrologyAPI = require('../astrology_engines/astrology_api');
            let ancientResults;

            try {
                const engine = AstrologyAPI.getEngine(system);

                // Use comprehensive panchanga calculation if available
                if (engine.calculateCompletePanchanga) {
                    ancientResults = engine.calculateCompletePanchanga(new Date(date), coords.lat);
                } else if (engine.calculatePositions) {
                    ancientResults = engine.calculatePositions(new Date(date));
                } else {
                    ancientResults = AstrologyAPI.getFullReport(new Date(date), coords.lat, coords.lng);
                }
            } catch (error) {
                logger.error({ message: `Error calculating ${system} data`, error: error.message, stack: error.stack });
                ancientResults = null;
            }

            logger.info({ message: `Calculated ${system} data for /getPanchangData`, hasData: !!ancientResults });

            // Get the standard panchang data
            const { calculatePanchangData } = require('../utils/panchangHelper');
            const standardPanchang = await calculatePanchangData(
                city, date, coords.lat, coords.lng,
                sunTimesData.sunriseToday, sunTimesData.sunsetToday,
                sunTimesData.moonriseToday, sunTimesData.moonsetToday,
                sunTimesData.sunriseTmrw, true
            );

            return res.json({
                ...standardPanchang,
                ancientSystem: system.toUpperCase(),
                ancientData: ancientResults
            });
        }

        // Calculate comprehensive Panchang data WITH SWISS EPHEMERIS
        const { calculatePanchangData } = require('../utils/panchangHelper');
        const panchangData = await calculatePanchangData(
            city,
            date,
            coords.lat,
            coords.lng,
            sunTimesData.sunriseToday,
            sunTimesData.sunsetToday,
            sunTimesData.moonriseToday,
            sunTimesData.moonsetToday,
            sunTimesData.sunriseTmrw,
            true  // includeTransitions - Enable Swiss Ephemeris calculations!
        );

        logger.info({ message: 'Panchang data calculated successfully', city, date });
        res.json(panchangData);
    } catch (error) {
        logger.error({ message: 'Route /getPanchangData error', error: error.message });
        res.status(500).json({ error: 'Failed to calculate Panchang data', details: error.message });
    }
});

// New POST route for design system frontend
router.post('/panchang', async (req, res) => {
    try {
        const { city, date, lat, lng } = req.body;
        logger.info({ message: 'POST /panchang called', city, date, lat, lng });

        if (!city || !date) {
            return res.status(400).json({ error: 'City and date are required' });
        }

        // Use provided coordinates or fetch them
        let coords;
        if (lat && lng) {
            logger.info({ message: 'Using provided coordinates', lat, lng });
            // If coordinates are provided, we still need timezone
            const coordsData = await fetchCoordinates(city);
            if (!coordsData) {
                return res.status(404).json({ error: 'Could not determine timezone for city' });
            }
            coords = { lat: parseFloat(lat), lng: parseFloat(lng), timeZone: coordsData.timeZone };
        } else {
            // Get coordinates for the city
            coords = await fetchCoordinates(city);
            if (!coords) {
                return res.status(404).json({ error: 'City not found' });
            }
        }

        // Get sun times first
        const sunTimesData = await fetchSunTimes(coords.lat, coords.lng, date, coords.timeZone);
        if (!sunTimesData) {
            return res.status(500).json({ error: 'Could not calculate sunrise/sunset times' });
        }

        // Calculate comprehensive Panchang data WITH SWISS EPHEMERIS
        const { calculatePanchangData } = require('../utils/panchangHelper');
        const panchangData = await calculatePanchangData(
            city,
            date,
            coords.lat,
            coords.lng,
            sunTimesData.sunriseToday,
            sunTimesData.sunsetToday,
            sunTimesData.moonriseToday,
            sunTimesData.moonsetToday,
            sunTimesData.sunriseTmrw,
            true  // includeTransitions - Enable Swiss Ephemeris calculations!
        );

        logger.info({ message: 'Panchang data calculated successfully', city, date });
        res.json(panchangData);
    } catch (error) {
        logger.error({ message: 'POST /panchang error', error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Failed to calculate Panchang data', details: error.message });
    }
});

// GET: Sun and Moon times using Swiss Ephemeris
router.get('/getSunMoonTimesSwiss/:city/:date', async (req, res) => {
    const { city, date } = req.params;
    logger.info({ message: 'Route /getSunMoonTimesSwiss called', city, date });

    try {
        const coords = await fetchCoordinates(city);
        if (!coords) {
            return res.status(404).json({ error: 'City not found' });
        }

        const { getSunMoonTimesSwiss } = require('../utils/swissHelper');
        const results = await getSunMoonTimesSwiss(coords.lat, coords.lng, date, coords.timeZone);

        if (!results) {
            return res.status(500).json({ error: 'Failed to calculate times using Swiss Ephemeris' });
        }

        res.json({
            success: true,
            city,
            date,
            coords,
            ...results
        });
    } catch (error) {
        logger.error({ message: 'Route /getSunMoonTimesSwiss error', error: error.message });
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.post("/getOldSwissTable-image", async (req, res) => {
    logger.info({ message: 'Route /getOldSwissTable-image called', body: req.body });
    const { city, date } = req.body;

    if (!city || !date) return res.status(400).send('City and date are required');

    try {
        const table = await fetchmuhurat_old(city, date);

        // Generate Image using Canvas instead of Puppeteer
        const buffer = await renderAstrologyTable(
            "Panchaka Muhurth",
            city,
            date,
            ["Muhurat & Status", "Timing"],
            table
        );

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=panchaka-old-${city}-${date}.png`);
        res.send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

module.exports = { 
    router, 
    createDrikTable, 
    createBharagvTable,
    processMuhuratAndPanchangam,
    convertToDDMMYYYY
};
