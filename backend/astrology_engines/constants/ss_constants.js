/**
 * Surya Siddhanta Constants
 * Based on Chapter 1: The Revolutions of the Planets in a Mahayuga (4,320,000 years)
 */

const SS_CONSTANTS = {
    // Number of solar years in a Mahayuga
    MAHAYUGA_YEARS: 4320000,

    // Civil Days (Savana) in a Mahayuga
    MAHAYUGA_DAYS: 1577917828,

    // Revolutions (Bhagana) of planets in a Mahayuga
    REVOLUTIONS: {
        SUN: 4320000,
        MOON: 57753336,
        MARS: 2296832,
        MERCURY_SIGHRA: 17937060,
        JUPITER: 364220,
        VENUS_SIGHRA: 7022376,
        SATURN: 146568,
        MOON_APOGEE: 488203, // Mandocca
        RAHU: 232226 // Node (Retrograde)
    },

    // Radius used for Sine (Jya) calculations
    RADIUS: 3438,

    // Epoch: Kali Yuga start (Midnight at Ujjain, Feb 18, 3102 BCE)
    // Julian Day Number for Kali Yuga start
    KALI_YUGA_JDN: 588465.5
};

module.exports = SS_CONSTANTS;
