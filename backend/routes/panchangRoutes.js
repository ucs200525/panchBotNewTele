const express = require('express');
const router = express.Router(); // Use express.Router() instead of express()
const logger = require('../utils/logger.js');

const fetch = require('node-fetch'); // Make sure to install node-fetch if you haven't already
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const puppeteer = require('puppeteer');

// Function to fetch coordinates and time zone based on the city name
// Function to fetch coordinates and time zone based on the city name
async function fetchCoordinates(city) {
    logger.info({ message: 'fetchCoordinates called', city });
    const apiKey = '699522e909454a09b82d1c728fc79925'; // Your API key
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length > 0) {
            const { limit, remaining, reset } = data.rate;
            logger.info({ message: 'OpenCage Rate Limit', limit, remaining, reset });
            const { lat, lng } = data.results[0].geometry;
            const timeZone = data.results[0].annotations.timezone.name;
            logger.info({ message: 'Coordinates fetched', city, lat, lng, timeZone });
            return { lat, lng, timeZone, limit, remaining, reset }; // Return all required values
        } else {
            logger.warn({ message: 'City not found', city });
            throw new Error('City not found');
        }
    } catch (error) {
        logger.error({ message: 'Error fetching coordinates', error: error.message, city });
        return null;
    }
}

async function fetchCityName(lat, lng) {
    logger.info({ message: 'fetchCityName called', lat, lng });
    const apiKey = '699522e909454a09b82d1c728fc79925'; // Your API key
    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.results.length > 0) {

            const { limit, remaining, reset } = data.rate;
            logger.info({ message: 'OpenCage Rate Limit', limit, remaining, reset });
            const components = data.results[0].components;
            const city = components.city || components.town || components.village || 'Unknown city';
            const timeZone = data.results[0].annotations.timezone.name;
            logger.info({ message: 'City name fetched', city, timeZone });
            logger.info({ message: `fetchCityName called key ${city} and {}`, data });
            return { cityName: city, timeZone, limit, remaining, reset, data }; // Return city name and time zone
        } else {
            logger.warn({ message: 'Location not found', lat, lng });
            throw new Error('Location not found');
        }
    } catch (error) {
        logger.error({ message: 'Error fetching city name', error: error.message, lat, lng });
        return null;
    }
}


// Function to convert UTC time to local time based on time zone
const convertToLocalTime = (utcDate, timeZone) => {
    const date = new Date(utcDate);
    return date.toLocaleString('en-US', { timeZone, hour12: false }).split(' ')[1];
};

// Function to fetch sunrise and sunset times for a given date
// Function to fetch sunrise and sunset times for a given date
async function fetchSunTimes(lat, lng, date, timeZone) {
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

async function getSunTimesForCity(city, date) {
    logger.info({ message: 'getSunTimesForCity called', city, date });
    let coords = await fetchCoordinates(city);
    logger.info({ message: 'Coordinates fetched for sun times', coords });
    if (coords) {
        const sunTimes = await fetchSunTimes(coords.lat, coords.lng, date, coords.timeZone);
        return { sunTimes, coords };
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
const createBharagvTable = async (city, date, showNonBlue, is12HourFormat) => {
    logger.info({ message: 'createBharagvTable called', city, date, showNonBlue, is12HourFormat });
    const sun = await getSunTimesForCity(city, date);
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
                timeInterval2: "",
                weekday: row.weekday || "-",
                value1: row.value1 || "",
                value2: row.value2 || "",
                isColored: row.isColored || false,
                isWednesdayColored: row.isWednesdayColored || false,
            });
        }
    }

    // Process the next 30 rows for timeInterval2
    for (let i = 0; i < 30; i++) {
        const row = tableData[i];
        if (row) {
            const start2 = row.start2 ? row.start2.split(",")[0].trim() : "";
            dummyData.push({
                sNo: i + 1,
                start1: "",
                end1: "",
                start2: row.start2 || "",
                end2: row.end2 || "",
                timeInterval1: start2 && row.end2 ? `${row.start2} to ${row.end2}` : "",
                timeInterval2: "",
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
    const { city, date, showNonBlue, is12HourFormat } = req.query;
    logger.info({ message: 'Route /getBharagvTable called', query: req.query });

    if (!city || !date) {
        logger.warn('Route /getBharagvTable missing params');
        return res.status(400).send('City and date are required');
    }
    if (showNonBlue === undefined || is12HourFormat === undefined) {
        return res.status(400).send('showNonBlue and is12HourFormat are required');
    }

    try {
        const table = await createBharagvTable(city, date, showNonBlue === 'true', is12HourFormat === 'true');
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
const createDrikTable = async (city, date) => {
    logger.info({ message: 'createDrikTable called', city, date });
    // Fetch the muhurat data using the city and date
    const filteredData = await fetchmuhurat(city, date); // Assuming fetchmuhurat is an async function

    // Create the drikTable by mapping over filteredData
    const drikTable = filteredData.map((row) => {
        const [startTime, endTime] = row.time.split(" to ");

        let endTimeWithoutDate, endDatePart;

        if (endTime.includes(", ")) {
            [endTimeWithoutDate, endDatePart] = endTime.split(", ");
        } else {
            endTimeWithoutDate = endTime; // If no comma, the entire string is the time
            endDatePart = null;          // No date part available
        }

        // Use the provided date
        let adjustedStartTime = startTime.includes("PM")
            ? `${startTime}`
            : startTime.includes("AM") && endTime.includes(",")
                ? `${endDatePart} , ${startTime}`
                : startTime;

        let adjustedEndTime = endTime.includes("AM") && endTime.includes(",")
            ? `${endDatePart} , ${endTimeWithoutDate}`
            : endTime.includes("PM")
                ? `${endTimeWithoutDate}`
                : endTime;

        const timeIntervalFormatted = `${adjustedStartTime} to ${adjustedEndTime}`;

        return {
            category: row.category,
            muhurat: row.muhurat,
            time: timeIntervalFormatted,
        };
    });

    // Return the formatted table
    logger.info({ message: 'createDrikTable completed', rows: drikTable.length });
    return drikTable;
};
router.get('/getDrikTable', async (req, res) => {
    const { city, date, goodTimingsOnly } = req.query;
    logger.info({ message: 'Route /getDrikTable called', query: req.query });

    // If goodTimingsOnly is not provided, set it to true by default
    const isGoodTimingsOnly = goodTimingsOnly !== 'false'; // Defaults to true unless 'false' is explicitly passed

    if (!city || !date) {
        return res.status(400).send('City and date are required');
    }

    try {
        // Fetch the complete table
        const table = await createDrikTable(city, date);

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

    const [time, period] = timeStr.trim().split(" ");
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

    const [start, end] = interval.split(" to ");
    if (!start || !end) return [null, null];

    const isNextDayStart = start.includes(",");
    const startTime = start.replace(/.*?,/, "").trim();

    const isNextDayEnd = end.includes(",");
    const endTime = end.replace(/.*?,/, "").trim();

    return [
        parseTime(startTime, baseDate, isNextDayStart),
        parseTime(endTime, baseDate, isNextDayEnd),
    ];
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

    muhuratData.forEach((muhuratItem) => {
        const [muhuratStart, muhuratEnd] = splitInterval(muhuratItem.time, baseDate);
        if (muhuratStart && muhuratEnd && validateInterval(muhuratStart, muhuratEnd)) {
            const weekdaysArray = [];

            panchangamData.forEach((panchangamItem) => {
                const timeInterval = panchangamItem.timeInterval1;
                const [start, end] = splitInterval(timeInterval, baseDate);
                if (start && end && validateInterval(start, end)) {
                    if (start <= muhuratEnd && end >= muhuratStart) {
                        if (!weekdaysArray.find((item) => item.weekday === panchangamItem.weekday)) {
                            weekdaysArray.push({
                                weekday: panchangamItem.weekday,
                                time: `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`,
                            });
                        }
                    }
                }
            });

            mergedData.push({
                sno: i + 1,
                type: "Muhurat",
                description: `${muhuratItem.muhurat} - ${muhuratItem.category}`,
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
    let { city, date, showNonBlue, is12HourFormat } = req.body;

    if (!city || !date) {
        return res.status(400).json({ error: "City and Date are required" });
    }

    if (showNonBlue === undefined) showNonBlue = true;
    if (is12HourFormat === undefined) is12HourFormat = true;

    try {
        const dateDDMMYYYY = convertToDDMMYYYY(date);

        // 1. Fetch Drik Data (requires DD/MM/YYYY)
        const fullMuhuratData = await createDrikTable(city, dateDDMMYYYY);
        // Filter Drik Data based on showNonBlue (equivalent to goodTimingsOnly)
        const muhuratData = showNonBlue ? fullMuhuratData.filter(row => row.category === 'Good') : fullMuhuratData;

        // 2. Fetch Panchangam Data (requires YYYY-MM-DD)
        const panchangamData = await createBharagvTable(city, date, showNonBlue, is12HourFormat);

        const baseDate = new Date(date);
        const finalData = processMuhuratAndPanchangam(muhuratData, panchangamData, baseDate);

        // Generate HTML content with improved styling
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        background: #f8f9fa;
                        color: #333;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        padding: 30px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e9ecef;
                    }
                    .header h2 {
                        color: #2c3e50;
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .header h3 {
                        color: #6c757d;
                        font-size: 20px;
                        font-weight: normal;
                    }
                    table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin-bottom: 30px;
                        border-radius: 6px;
                        overflow: hidden;
                    }
                    th, td {
                        border: 1px solid #dee2e6;
                        padding: 15px;
                        text-align: left;
                        vertical-align: top;
                    }
                    th {
                        background-color: #4a90e2;
                        color: white;
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 14px;
                        letter-spacing: 0.5px;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    tr:hover {
                        background-color: #f2f4f6;
                    }
                    .weekday-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .weekday-item {
                        margin: 8px 0;
                        padding: 6px 10px;
                        background: #f8f9fa;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    .weekday-item:hover {
                        background: #e9ecef;
                    }
                    td:first-child {
                        font-weight: 600;
                        color: #495057;
                    }
                    td:nth-child(2) {
                        color: #6c757d;
                    }
                    td:nth-child(3) {
                        color: #2c3e50;
                    }
                    td:nth-child(4) {
                        color: #0056b3;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Combined Muhurat and Panchangam Data</h2>
                        <h3>${city} - ${date}</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Time Interval</th>
                                <th>Weekdays</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${finalData.map(item => `
                                <tr>
                                    <td>${item.sno}</td>
                                    <td>${item.type}</td>
                                    <td>${item.description}</td>
                                    <td>${item.timeInterval}</td>
                                    <td>
                                        <ul class="weekday-list">
                                            ${item.weekdays.map(day => `
                                                <li class="weekday-item">${day.weekday} ${day.time !== '-' ? `(${day.time})` : ''}</li>
                                            `).join('')}
                                        </ul>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set content and wait for it to load
        await page.setContent(htmlContent);
        await page.setViewport({ width: 1200, height: 800 });

        // Wait for any dynamic content to load
        await page.evaluate(() => {
            return new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
        });

        // Take screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
            encoding: 'binary'
        });

        // Close browser
        await browser.close();

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=combined-data-${city}-${date}.png`);

        // Send the image
        res.send(screenshot);

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

        // Generate HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        background: #f8f9fa;
                        color: #333;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        padding: 30px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e9ecef;
                    }
                    .header h2 {
                        color: #2c3e50;
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .header h3 {
                        color: #6c757d;
                        font-size: 20px;
                        font-weight: normal;
                    }
                    table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin-bottom: 30px;
                        border-radius: 6px;
                        overflow: hidden;
                    }
                    th, td {
                        border: 1px solid #dee2e6;
                        padding: 15px;
                        text-align: left;
                    }
                    th {
                        background-color: #4a90e2;
                        color: white;
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 14px;
                        letter-spacing: 0.5px;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    tr:hover {
                        background-color: #f2f4f6;
                    }
                    .good-timing {
                        color: #28a745;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Drik Panchang Muhurat Table</h2>
                        <h3>${city} - ${date}</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Muhurat</th>
                                <th>Category</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${finalData.map(item => `
                                <tr>
                                    <td>${item.muhurat}</td>
                                    <td>${item.category}</td>
                                    <td class="${item.category === 'Good' ? 'good-timing' : ''}">${item.time}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        // Launch puppeteer and generate image
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        await page.setViewport({ width: 1200, height: 800 });

        // Wait for content to load
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Take screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
            encoding: 'binary'
        });

        await browser.close();

        // Send response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=drik-table-${city}-${date}.png`);
        res.send(screenshot);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});



router.post("/getBharagvTable-image", async (req, res) => {
    logger.info({ message: 'Route /getBharagvTable-image called', body: req.body });
    const { city, date, showNonBlue, is12HourFormat } = req.body;

    if (!city || !date) {
        return res.status(400).send('City and date are required');
    }
    if (showNonBlue === undefined || is12HourFormat === undefined) {
        return res.status(400).send('showNonBlue and is12HourFormat are required');
    }
    try {

        const table = await createBharagvTable(city, date, showNonBlue === 'true', is12HourFormat);

        // Generate HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        padding: 40px;
                        background: #f8f9fa;
                        font-size: 22px;
                        color: #222;
                    }
                // In your style section, update these values:
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.13);
                    padding: 20px 30px;  // Reduced from 40px
                }


                .header {
                        text-align: center;
                        margin-bottom: 36px;
                    }
                    .header h2 {
                        font-size: 2.2em;
                        margin-bottom: 0.2em;
                        color: #2c3e50;
                    }
                    .header h3 {
                        font-size: 1.3em;
                        color: #4a90e2;
                        font-weight: 400;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                        font-size: 1.15em;
                        background: #fdfdfd;
                    }

                    th, td {
                        border: 2px solid #4a90e2;
                        padding: 12px 8px;   // Reduced from 18px
                        text-align: left;
                        vertical-align: middle;
                    }
                    th {
                        background-color: #4a90e2;
                        color: #fff;
                        font-size: 1.1em;
                        letter-spacing: 0.5px;
                        border-bottom: 4px solid #357abd;
                    }
                    tr {
                        transition: background 0.2s;
                    }
                    tr:nth-child(even) {
                        background-color: #f0f7ff;
                    }
                    tr:hover {
                        background-color: #e3f2fd;
                    }
                    .colored-row {
                        background-color: #d0eaff !important;
                    }
                    .time-interval {
                        font-family: 'Fira Mono', 'Consolas', monospace;
                        font-size: 1.08em;
                        color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Bhargava Panchangam Table</h2>
                        <h3>${city} - ${date}</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Time Interval</th>
                                <th>Weekday</th>
                                <th>Time Interval</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${table.slice(0, 30).map(item => `
                                <tr class="${item.isColored || item.isWednesdayColored ? 'colored-row' : ''}">
                                    <td>${item.sNo || ''}</td>
                                    <td class="time-interval">
                                        ${item.start1 || ''} to ${item.end1 || ''}
                                    </td>
                                    <td>${item.weekday || '-'}</td>
                                    <td class="time-interval">
                                        ${item.start2 || ''} to ${item.end2 || ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent);

        // Calculate optimal viewport height for 30 rows
        const rowCount = Math.min(table.length, 38); // Limit to max 30 rows
        await page.setViewport({
            width: 1400,
            height: 50 * rowCount + 250, // 50px per row + extra space for header/margins
            deviceScaleFactor: 2 // Increase resolution for sharper image
        });

        // Ensure fonts and content are fully loaded
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.evaluateHandle('document.fonts.ready');

        // Take screenshot with optimized settings
        const screenshot = await page.screenshot({
            fullPage: false, // Changed to false to use viewport dimensions
            type: 'png',
            encoding: 'binary',
            clip: {
                x: 0,
                y: 0,
                width: 1400,
                height: 50 * rowCount + 250
            }
        });

        await browser.close();

        // Send response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename=bhargav-table-${city}-${date}.png`);
        res.send(screenshot);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({
            error: "Failed to generate image",
            details: error.message
        });
    }
});















router.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// Function to fetch Muhurat data for a given city and date
// Function to fetch Muhurat data for a given city and date
const fetchmuhurat = async (city, date) => {
    logger.info({ message: 'fetchmuhurat called', city, date });
    try {
        // Get the GeoName ID for the provided city
        const geoNameId = await getGeoNameId(city);

        // Format the URL to include the date and GeoName ID
        const url = `https://www.drikpanchang.com/muhurat/panchaka-rahita-muhurat.html?geoname-id=${geoNameId}&date=${date}`;

        // Fetch the HTML content from the website
        const response = await axios.get(url);

        // Load the HTML content using cheerio
        const $ = cheerio.load(response.data);

        // Extract the required data from the table
        const muhuratData = [];

        // Loop through all the rows that contain the Muhurat information
        $('.dpMuhurtaRow').each((i, element) => {
            const muhurtaName = $(element).find('.dpMuhurtaName').text().trim();
            const muhurtaTime = $(element).find('.dpMuhurtaTime').text().trim();

            const [name, category] = muhurtaName.split(' - ');  // Split name and category

            muhuratData.push({
                muhurat: name,
                category: category || '',
                time: muhurtaTime
            });
        });

        logger.info({ message: 'fetchmuhurat completed', count: muhuratData.length });
        return muhuratData; // Return the muhurat data

    } catch (error) {
        logger.error({ message: "Error fetching Muhurat data", error: error.message, city, date });
        throw new Error('Error fetching data');
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
    logger.info({ message: 'Route /getSunTimesForCity called', city, date });
    const sunTimes = await getSunTimesForCity(city, date);
    if (sunTimes) {
        res.json(sunTimes);
    } else {
        res.status(404).json({ error: 'Sun times for city not found' });
    }
});

module.exports = router;
