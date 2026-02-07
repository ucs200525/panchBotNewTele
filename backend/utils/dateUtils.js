/**
 * Date Utilities for Astrological Calculations
 */

/**
 * Helper to get UTC date from local date strings and timezone
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:mm
 * @param {string} tzone - Timezone name (e.g. Asia/Kolkata)
 * @returns {Date} UTC Date object
 */
function getUTCFromLocal(date, time, tzone) {
    // Treat as UTC initially
    const dateObj = new Date(`${date}T${time}:00Z`);

    if (!tzone) return dateObj; // Fallback to UTC if no tzone

    try {
        // Calculate offset for the target timezone at that specific time
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tzone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(dateObj);
        const p = {};
        parts.forEach(part => { p[part.type] = part.value; });

        // This is the date as it WOULD be in the local timezone if the UTC was dateObj
        // Note: formatted parts use month/day/year order normally in en-US, 
        // but we can construct safely.
        const localInTZ = new Date(Date.UTC(
            parseInt(p.year),
            parseInt(p.month) - 1,
            parseInt(p.day),
            parseInt(p.hour),
            parseInt(p.minute),
            parseInt(p.second)
        ));

        // The difference is the offset
        const offset = localInTZ.getTime() - dateObj.getTime();

        // Correct the dateObj to be the actual UTC moment
        return new Date(dateObj.getTime() - offset);
    } catch (e) {
        console.error('getUTCFromLocal error:', e);
        return dateObj;
    }
}

module.exports = {
    getUTCFromLocal
};
