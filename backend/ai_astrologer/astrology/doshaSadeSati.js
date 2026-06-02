/**
 * Logic to calculate planetary doshas and Sade Sati periods.
 */

/**
 * Checks for Sade Sati (Saturn Transit relative to Natal Moon)
 * @param {number} natalMoonRashiIndex (0-11)
 * @param {number} transitSaturnRashiIndex (0-11)
 * @returns {object} Sade Sati status
 */
function checkSadeSati(natalMoonRashiIndex, transitSaturnRashiIndex) {
    if (natalMoonRashiIndex === undefined || transitSaturnRashiIndex === undefined) return { isActive: false, phase: null };

    // Sade Sati spans 3 signs: 12th from Moon, 1st from Moon, 2nd from Moon
    const houseFromMoon = (transitSaturnRashiIndex - natalMoonRashiIndex + 12) % 12 + 1;
    
    if (houseFromMoon === 12) {
        return { isActive: true, phase: "Rising Phase (1st cycle)", description: "Transit Saturn is in the 12th house from natal Moon." };
    } else if (houseFromMoon === 1) {
        return { isActive: true, phase: "Peak Phase (2nd cycle)", description: "Transit Saturn is conjunct the natal Moon." };
    } else if (houseFromMoon === 2) {
        return { isActive: true, phase: "Setting Phase (3rd cycle)", description: "Transit Saturn is in the 2nd house from natal Moon." };
    } else if (houseFromMoon === 4) {
        return { isActive: true, phase: "Dhaiya (Ashtama Shani's lesser cousin)", description: "Transit Saturn is 4th from Moon." };
    } else if (houseFromMoon === 8) {
        return { isActive: true, phase: "Ashtama Shani (Dhaiya)", description: "Transit Saturn is 8th from Moon. Can bring sudden changes." };
    }

    return { isActive: false, phase: "None", description: "Saturn is in a neutral/benefic transit relative to the Moon." };
}

/**
 * Checks for Mangal (Kuja) Dosha based on Lagna.
 * Mars in 1, 2, 4, 7, 8, 12 from Lagna creates Manglik Dosha.
 * @param {number} lagnaRashiIndex 
 * @param {number} marsRashiIndex 
 * @returns {object} Mangal Dosha status
 */
function checkMangalDosha(lagnaRashiIndex, marsRashiIndex) {
    const houseOfMars = (marsRashiIndex - lagnaRashiIndex + 12) % 12 + 1;
    const mangalikHouses = [1, 2, 4, 7, 8, 12];
    
    const isMangalik = mangalikHouses.includes(houseOfMars);
    
    return {
        isActive: isMangalik,
        house: houseOfMars,
        description: isMangalik ? `Mars is in house ${houseOfMars}, forming Mangal Dosha (Kuja Dosha).` : "No Mangal Dosha present from Lagna."
    };
}

/**
 * Checks for Kala Sarpa Dosha
 * Occurs when all 7 traditional planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn) 
 * are bound between Rahu and Ketu.
 * @param {Array} planets - Array of planetary objects with 'longitude' and 'id'
 * @returns {object}
 */
function checkKalaSarpaDosha(planets) {
    const rahu = planets.find(p => p.id === 10); // Rahu
    const ketu = planets.find(p => p.id === 11); // Ketu
    
    if (!rahu || !ketu) return { isActive: false, description: "Nodes not found." };
    
    let rahuLong = rahu.longitude;
    let ketuLong = ketu.longitude;
    
    // Normalize to check if all planets fall in one half of the zodiac
    // The half is either [rahuLong to ketuLong] or [ketuLong to rahuLong]
    
    // Convert all planet longitudes to relative position from Rahu (0 to 360)
    const sevenPlanets = planets.filter(p => p.id >= 0 && p.id <= 6); // Sun to Saturn
    
    let allBetweenRahuKetu = true;
    let allBetweenKetuRahu = true;
    
    for (let p of sevenPlanets) {
        const relRahu = (p.longitude - rahuLong + 360) % 360;
        if (relRahu > 180) allBetweenRahuKetu = false; // Falls outside Rahu->Ketu (which is 180 deg)
        if (relRahu < 180) allBetweenKetuRahu = false; // Falls outside Ketu->Rahu
    }
    
    const isActive = allBetweenRahuKetu || allBetweenKetuRahu;
    
    return {
        isActive,
        type: allBetweenRahuKetu ? "Anuloma Kala Sarpa" : (allBetweenKetuRahu ? "Viloma Kala Sarpa" : "None"),
        description: isActive ? "All 7 major planets are hemmed between Rahu and Ketu." : "No Kala Sarpa Dosha."
    };
}

/**
 * Checks for Kemdruma Dosha.
 * Occurs when there are no planets (except Sun, Rahu, Ketu) in the 12th and 2nd house from the Moon.
 * @param {Array} planets 
 * @returns {object}
 */
function checkKemdrumaDosha(planets) {
    const moon = planets.find(p => p.id === 1);
    if (!moon) return { isActive: false };
    
    const moonSign = Math.floor(moon.longitude / 30);
    const house2 = (moonSign + 1) % 12;
    const house12 = (moonSign + 11) % 12;
    
    // Planets to check: Mars(4), Mercury(2), Jupiter(5), Venus(3), Saturn(6)
    const activePlanets = planets.filter(p => [2, 3, 4, 5, 6].includes(p.id));
    
    let hasPlanetIn2 = false;
    let hasPlanetIn12 = false;
    
    for (let p of activePlanets) {
        const sign = Math.floor(p.longitude / 30);
        if (sign === house2) hasPlanetIn2 = true;
        if (sign === house12) hasPlanetIn12 = true;
    }
    
    // Kemdruma if both 2nd and 12th from Moon are empty of these planets
    const isActive = !hasPlanetIn2 && !hasPlanetIn12;
    // Note: Conjunction with other planets cancels it, but we strictly check 2nd/12th here.
    // Further cancellation (e.g. Kendra from Lagna) can be evaluated by LLM.
    
    return {
        isActive,
        description: isActive ? "No planets in 2nd and 12th from Moon (Kemdruma condition)." : "Moon is supported by flanking planets."
    };
}

function analyzeAllDoshas(lagna, natalPlanets, transitPlanets) {
    if (!lagna || !natalPlanets || natalPlanets.length === 0) return {};

    const natalMoon = natalPlanets.find(p => p.id === 1);
    const transitSaturn = transitPlanets ? transitPlanets.find(p => p.id === 6) : null;
    const natalMars = natalPlanets.find(p => p.id === 4);

    return {
        sadeSati: transitSaturn && natalMoon ? checkSadeSati(natalMoon.rashi.index, transitSaturn.rashi.index) : { isActive: false },
        mangalDosha: natalMars ? checkMangalDosha(lagna.rashiIndex, natalMars.rashi.index) : { isActive: false },
        kalaSarpa: checkKalaSarpaDosha(natalPlanets),
        kemdruma: checkKemdrumaDosha(natalPlanets)
    };
}

module.exports = {
    checkSadeSati,
    checkMangalDosha,
    checkKalaSarpaDosha,
    checkKemdrumaDosha,
    analyzeAllDoshas
};
