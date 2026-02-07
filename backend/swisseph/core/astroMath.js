/**
 * High-Accuracy Astronomical Algorithms (Jean Meeus / Duffett-Smith)
 * Scaled for professional Vedic calculations in JS
 */

const astroMath = {
    getT: (jd) => (jd - 2451545.0) / 36525.0,
    rev: (deg) => (deg % 360 + 360) % 360,
    rad: (deg) => deg * Math.PI / 180,
    deg: (rad) => rad * 180 / Math.PI,

    getObliquity: (jd) => {
        const T = astroMath.getT(jd);
        return 23.4392911 - (46.8150 / 3600) * T;
    },

    /**
     * Local Sidereal Time (Meeus Ch 12)
     */
    getLST: (jd, lng) => {
        const T = astroMath.getT(jd);
        let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
            + 0.000387933 * T * T - T * T * T / 38710000.0;
        return astroMath.rev(gmst + lng);
    },

    getSunPosition: (jd) => {
        const T = astroMath.getT(jd);
        const L = astroMath.rev(280.46646 + 36000.76983 * T);
        const M = astroMath.rev(357.52911 + 35999.05029 * T);
        const C = (1.914602 - 0.004817 * T) * Math.sin(astroMath.rad(M))
            + (0.019993 - 0.000101 * T) * Math.sin(astroMath.rad(2 * M));
        const trueLong = L + C;
        return { longitude: astroMath.rev(trueLong), speed: 0.9856 };
    },

    /**
     * Professional Moon Position (Meeus Ch 47 - Enhanced)
     */
    getMoonPosition: (jd) => {
        const T = astroMath.getT(jd);
        const Lprim = astroMath.rev(218.3164477 + 481267.88123421 * T); // Mean longitude
        const D = astroMath.rev(297.8501921 + 445267.1114034 * T);  // Mean elongation
        const M = astroMath.rev(357.5291092 + 35999.0502909 * T);   // Sun Mean Anomaly
        const Mprim = astroMath.rev(134.9633964 + 477198.8675055 * T); // Moon Mean Anomaly
        const F = astroMath.rev(93.2720950 + 483202.0175233 * T);   // Latitude argument

        let lon = Lprim;

        // Additive terms (Meeus Table 47.A)
        lon += 6.288774 * Math.sin(astroMath.rad(Mprim));
        lon += 1.274027 * Math.sin(astroMath.rad(2 * D - Mprim));
        lon += 0.658314 * Math.sin(astroMath.rad(2 * D));
        lon += 0.213618 * Math.sin(astroMath.rad(2 * Mprim));
        lon -= 0.185116 * Math.sin(astroMath.rad(M));
        lon -= 0.114332 * Math.sin(astroMath.rad(2 * F));
        lon += 0.058793 * Math.sin(astroMath.rad(2 * D - 2 * Mprim));
        lon += 0.057066 * Math.sin(astroMath.rad(2 * D - M - Mprim));
        lon += 0.053322 * Math.sin(astroMath.rad(2 * D + Mprim));
        lon += 0.045758 * Math.sin(astroMath.rad(2 * D - M));
        lon -= 0.040923 * Math.sin(astroMath.rad(M - Mprim));
        lon -= 0.034720 * Math.sin(astroMath.rad(D));
        lon -= 0.030383 * Math.sin(astroMath.rad(M + Mprim));
        lon += 0.015327 * Math.sin(astroMath.rad(2 * D - 2 * F));
        lon += 0.012528 * Math.sin(astroMath.rad(Mprim + 2 * F));
        lon += 0.010980 * Math.sin(astroMath.rad(Mprim - 2 * F));
        lon += 0.010675 * Math.sin(astroMath.rad(4 * D - Mprim));
        lon += 0.010034 * Math.sin(astroMath.rad(3 * Mprim));

        return { longitude: astroMath.rev(lon), speed: 13.1763 };
    },

    getPlanetPosition: (jd, planetId) => {
        const T = astroMath.getT(jd);
        const sun = astroMath.getSunPosition(jd);

        let elements;
        // Accurate mean longitudes and eq of center approximations
        switch (planetId) {
            case 2: elements = { L: 252.2508, n: 149472.674, e: 0.2056, a: 0.387 }; break; // Mer
            case 3: elements = { L: 181.9797, n: 58517.815, e: 0.0068, a: 0.723 }; break; // Ven
            case 4: elements = { L: 355.4533, n: 19140.303, e: 0.0934, a: 1.524 }; break; // Mar
            case 5: elements = { L: 34.4044, n: 3034.746, e: 0.0485, a: 5.203 }; break; // Jup
            case 6: elements = { L: 49.9443, n: 1222.1138, e: 0.0555, a: 9.555 }; break; // Sat
            case 10: return { longitude: astroMath.rev(125.0445 - 1934.1363 * T), speed: -0.053 }; // Rahu
            default: return sun;
        }

        const M = astroMath.rev(elements.L + elements.n * T);
        const C = 2 * elements.e * 57.2958 * Math.sin(astroMath.rad(M));
        const helio = astroMath.rev(M + C);

        // Geocentric Lambda correction
        const diff = astroMath.rad(helio - sun.longitude);
        const geo = astroMath.deg(Math.atan2(Math.sin(diff), elements.a + Math.cos(diff)));

        return { longitude: astroMath.rev(helio + geo), speed: elements.n / 36525.0 };
    },

    getAyanamsa: (jd) => {
        const T = astroMath.getT(jd);
        // Better Lahiri Epoch calculation
        return 23.85694 + (50.27 / 3600) * (T * 100);
    },

    /**
     * High-Accuracy Rise and Set Times
     * Returns UTC hours (0-24) for rise/set
     */
    calculateRiseSet: (jd, lat, lng, bodyId) => {
        const dayStart = Math.floor(jd + 0.5) - 0.5;

        // Find RA and Dec at current JD
        const bodyPos = bodyId === 1 ? astroMath.getMoonPosition(jd) : astroMath.getSunPosition(jd);
        const obl = astroMath.rad(astroMath.getObliquity(jd));
        const lambda = astroMath.rad(bodyPos.longitude);

        // Equatorial coordinates
        const ra = astroMath.rev(astroMath.deg(Math.atan2(Math.sin(lambda) * Math.cos(obl), Math.cos(lambda))));
        const dec = astroMath.deg(Math.asin(Math.sin(lambda) * Math.sin(obl)));

        // Hour angle H
        const h = -0.833; // Atmospheric refraction
        const phi = astroMath.rad(lat);
        const delta = astroMath.rad(dec);
        const cosH = (Math.sin(astroMath.rad(h)) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));

        if (Math.abs(cosH) > 1) return null; // Planet never rises or never sets

        const H = astroMath.deg(Math.acos(cosH));

        // GMST at 0h UTC for this day
        const gmst0 = astroMath.getLST(dayStart, 0);

        // Approx transit in degrees from 0h UTC
        let transitDeg = (ra - gmst0 - lng + 720) % 360;

        return {
            rise: (transitDeg - H + 720) % 360 / 15.041, // Adjusted for sidereal day
            set: (transitDeg + H + 720) % 360 / 15.041,
            transit: (transitDeg + 720) % 360 / 15.041
        };
    }
};

module.exports = astroMath;
