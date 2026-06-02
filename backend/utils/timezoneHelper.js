/**
 * Timezone Helper Utilities for Vedic Astrology calculations
 * Ensures timezone independence across local development and Vercel/cloud deployments
 */

/**
 * Get date and time components formatted in a target timezone
 * @param {Date} date - JS Date object
 * @param {string} timezone - Target timezone (e.g. 'Asia/Kolkata')
 * @returns {Object} { year, month, day, hour, minute, second }
 */
function getPartsInTimezone(date, timezone = 'Asia/Kolkata') {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(date);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    
    let hour = parseInt(map.hour);
    if (hour === 24) hour = 0; // Handle Node.js/V8 quirk where hour is 24 instead of 0
    
    return {
        year: parseInt(map.year),
        month: parseInt(map.month), // 1-12
        day: parseInt(map.day),
        hour: hour,
        minute: parseInt(map.minute),
        second: parseInt(map.second)
    };
}

/**
 * Construct a UTC Date representing a specific local date and time in a target timezone
 * @param {number} year 
 * @param {number} month - 1-12
 * @param {number} day 
 * @param {number} hour 
 * @param {number} minute 
 * @param {number} second 
 * @param {string} timezone 
 * @returns {Date} UTC Date object
 */
function getUtcDateForLocalTime(year, month, day, hour, minute, second, timezone = 'Asia/Kolkata') {
    // Initial estimate in UTC
    let estimate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    
    // Iteratively adjust estimate based on the actual timezone offset at that time
    for (let i = 0; i < 3; i++) {
        const parts = getPartsInTimezone(estimate, timezone);
        const partsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
        const targetUtc = Date.UTC(year, month - 1, day, hour, minute, second);
        const diff = targetUtc - partsUtc;
        if (diff === 0) break;
        estimate = new Date(estimate.getTime() + diff);
    }
    return estimate;
}

/**
 * Get start of day (00:00:00 local time) in target timezone as a UTC Date
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @param {string} timezone 
 */
function getStartOfDay(date, timezone = 'Asia/Kolkata') {
    let d;
    if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number);
        return getUtcDateForLocalTime(year, month, day, 0, 0, 0, timezone);
    } else {
        d = date;
    }
    const parts = getPartsInTimezone(d, timezone);
    return getUtcDateForLocalTime(parts.year, parts.month, parts.day, 0, 0, 0, timezone);
}

/**
 * Get end of day (23:59:59.999 local time) in target timezone as a UTC Date
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @param {string} timezone 
 */
function getEndOfDay(date, timezone = 'Asia/Kolkata') {
    const start = getStartOfDay(date, timezone);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

/**
 * Parse a time string (e.g. "05:45 am" or "17:30:00") and a date in a timezone to a UTC Date
 * @param {Date|string} date - Date object or YYYY-MM-DD string
 * @param {string} timeStr - Time string
 * @param {string} timezone 
 */
function getUtcDateFromLocalTimeStr(date, timeStr, timezone = 'Asia/Kolkata') {
    let year, month, day;
    if (typeof date === 'string') {
        const parts = date.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
    } else {
        const parts = getPartsInTimezone(date, timezone);
        year = parts.year;
        month = parts.month;
        day = parts.day;
    }
    
    let hours = 0, minutes = 0, seconds = 0;
    const match12 = timeStr.match(/(\d+):(\d+)(?::(\d+))?\s*(am|pm)/i);
    if (match12) {
        hours = parseInt(match12[1]);
        minutes = parseInt(match12[2]);
        seconds = parseInt(match12[3] || 0);
        const period = match12[4].toLowerCase();
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
    } else {
        const parts = timeStr.split(':').map(Number);
        hours = parts[0];
        minutes = parts[1] || 0;
        seconds = parts[2] || 0;
    }
    
    return getUtcDateForLocalTime(year, month, day, hours, minutes, seconds, timezone);
}

module.exports = {
    getPartsInTimezone,
    getUtcDateForLocalTime,
    getStartOfDay,
    getEndOfDay,
    getUtcDateFromLocalTimeStr
};
