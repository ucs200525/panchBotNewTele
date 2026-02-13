/**
 * Planetary Interpretation Engine for Divisional Charts
 * Analyzes planetary placements in houses and signs for each varga
 */

const { VARGA_HOUSE_SIGNIFICANCE } = require('./vargaHouseData');

// Planetary significations
const PLANET_SIGNIFICATIONS = {
    Sun: { nature: "Fiery", represents: ["Soul", "Father", "Authority", "Government", "Self-esteem", "Vitality"], strengths: ["Leadership", "Confidence"], weaknesses: ["Ego", "Arrogance"] },
    Moon: { nature: "Watery", represents: ["Mind", "Mother", "Emotions", "Public", "Nourishment", "Comfort"], strengths: ["Empathy", "Intuition"], weaknesses: ["Moodiness", "Instability"] },
    Mars: { nature: "Fiery", represents: ["Energy", "Courage", "Siblings", "Property", "Anger", "War"], strengths: ["Bravery", "Action"], weaknesses: ["Aggression", "Conflicts"] },
    Mercury: { nature: "Earthy", represents: ["Intelligence", "Communication", "Business", "Learning", "Wit"], strengths: ["Analytical", "Versatile"], weaknesses: ["Nervous", "Restless"] },
    Jupiter: { nature: "Airy", represents: ["Wisdom", "Children", "Fortune", "Guru", "Dharma", "Expansion"], strengths: ["Optimism", "Knowledge"], weaknesses: ["Over-expansion", "Excess"] },
    Venus: { nature: "Watery", represents: ["Love", "Luxury", "Arts", "Beauty", "Spouse", "Comforts"], strengths: ["Harmony", "Creativity"], weaknesses: ["Indulgence", "Laziness"] },
    Saturn: { nature: "Airy", represents: ["Discipline", "Service", "Delays", "Longevity", "Karma", "Hard work"], strengths: ["Patience", "Persistence"], weaknesses: ["Restriction", "Depression"] },
    Rahu: { nature: "Airy", represents: ["Obsession", "Foreign", "Technology", "Illusion", "Material desires"], strengths: ["Innovation", "Fame"], weaknesses: ["Confusion", "Addiction"] },
    Ketu: { nature: "Fiery", represents: ["Moksha", "Spirituality", "Detachment", "Past life", "Occult"], strengths: ["Wisdom", "Liberation"], weaknesses: ["Isolation", "Confusion"] }
};

// Rashi (Sign) characteristics
const RASHI_CHARACTERISTICS = {
    "Mesha": { element: "Fire", lord: "Mars", nature: "Movable", quality: "Initiating", keywords: ["Active", "Pioneering", "Impulsive"] },
    "Vrishabha": { element: "Earth", lord: "Venus", nature: "Fixed", quality: "Stable", keywords: ["Grounded", "Sensual", "Stubborn"] },
    "Mithuna": { element: "Air", lord: "Mercury", nature: "Dual", quality: "Communicative", keywords: ["Versatile", "Curious", "Restless"] },
    "Kataka": { element: "Water", lord: "Moon", nature: "Movable", quality: "Nurturing", keywords: ["Emotional", "Protective", "Intuitive"] },
    "Simha": { element: "Fire", lord: "Sun", nature: "Fixed", quality: "Authoritative", keywords: ["Confident", "Regal", "Proud"] },
    "Kanya": { element: "Earth", lord: "Mercury", nature: "Dual", quality: "Analytical", keywords: ["Precise", "Practical", "Critical"] },
    "Tula": { element: "Air", lord: "Venus", nature: "Movable", quality: "Balancing", keywords: ["Diplomatic", "Harmonious", "Indecisive"] },
    "Vrischika": { element: "Water", lord: "Mars", nature: "Fixed", quality: "Intense", keywords: ["Deep", "Transformative", "Secretive"] },
    "Dhanu": { element: "Fire", lord: "Jupiter", nature: "Dual", quality: "Philosophical", keywords: ["Optimistic", "Adventurous", "Expansive"] },
    "Makara": { element: "Earth", lord: "Saturn", nature: "Movable", quality: "Ambitious", keywords: ["Disciplined", "Practical", "Reserved"] },
    "Kumbha": { element: "Air", lord: "Saturn", nature: "Fixed", quality: "Humanitarian", keywords: ["Innovative", "Detached", "Eccentric"] },
    "Meena": { element: "Water", lord: "Jupiter", nature: "Dual", quality: "Mystical", keywords: ["Compassionate", "Spiritual", "Dreamy"] }
};

/**
 * Get planetary dignity (strength) in a sign
 */
function getPlanetaryDignity(planetName, rashiName) {
    const dignities = {
        Sun: { exalted: "Mesha", debilitated: "Tula", own: ["Simha"], friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
        Moon: { exalted: "Vrishabha", debilitated: "Vrischika", own: ["Kataka"], friends: ["Sun", "Mercury"], enemies: ["None"] },
        Mars: { exalted: "Makara", debilitated: "Kataka", own: ["Mesha", "Vrischika"], friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
        Mercury: { exalted: "Kanya", debilitated: "Meena", own: ["Mithuna", "Kanya"], friends: ["Sun", "Venus"], enemies: ["Moon"] },
        Jupiter: { exalted: "Kataka", debilitated: "Makara", own: ["Dhanu", "Meena"], friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
        Venus: { exalted: "Meena", debilitated: "Kanya", own: ["Vrishabha", "Tula"], friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
        Saturn: { exalted: "Tula", debilitated: "Mesha", own: ["Makara", "Kumbha"], friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
        Rahu: { exalted: "Vrishabha", debilitated: "Vrischika", own: [], friends: ["Mercury", "Venus", "Saturn"], enemies: ["Sun", "Moon", "Mars"] },
        Ketu: { exalted: "Vrischika", debilitated: "Vrishabha", own: [], friends: ["Mars", "Venus", "Saturn"], enemies: ["Sun", "Moon"] }
    };

    const planetDig = dignities[planetName];
    if (!planetDig) return { status: "Neutral", strength: 50, description: "Normal strength" };

    if (planetDig.exalted === rashiName) {
        return { status: "Exalted", strength: 100, description: "Maximum strength, excellent results" };
    }
    if (planetDig.debilitated === rashiName) {
        return { status: "Debilitated", strength: 0, description: "Weakest position, challenges and struggles" };
    }
    if (planetDig.own.includes(rashiName)) {
        return { status: "Own Sign", strength: 85, description: "Very strong, comfortable and expressive" };
    }

    // Check if sign lord is friend/enemy
    const signLord = RASHI_CHARACTERISTICS[rashiName]?.lord;
    if (planetDig.friends.includes(signLord)) {
        return { status: "Friend's Sign", strength: 70, description: "Good strength, favorable results" };
    }
    if (planetDig.enemies.includes(signLord)) {
        return { status: "Enemy's Sign", strength: 30, description: "Reduced strength, some difficulties" };
    }

    return { status: "Neutral", strength: 50, description: "Normal strength, moderate results" };
}

/**
 * Interpret a planet in a specific house for a given varga
 */
function interpretPlanetInHouseForVarga(planetName, houseNum, rashiName, varga) {
    const vargaData = VARGA_HOUSE_SIGNIFICANCE[varga];
    if (!vargaData) return null;

    const houseSignificance = vargaData.houses[houseNum];
    if (!houseSignificance) return null;

    const planetData = PLANET_SIGNIFICATIONS[planetName];
    const rashiData = RASHI_CHARACTERISTICS[rashiName];

    // Add defensive check for planetData
    if (!planetData) {
        console.warn(`Planet data not found for: ${planetName}`);
        return {
            planet: planetName,
            house: houseNum,
            rashi: rashiName,
            houseTitle: houseSignificance.title,
            houseAreas: houseSignificance.areas,
            dignity: "Unknown",
            strength: 50,
            interpretation: `${planetName} in ${rashiName} (${houseNum}th house - ${houseSignificance.title}).\n\nInfluences matters of ${houseSignificance.areas[0]}.`,
            keywords: rashiData?.keywords || []
        };
    }

    const dignity = getPlanetaryDignity(planetName, rashiName);

    // Generate interpretation based on varga type, house, planet, and sign
    const interpretation = generateContextualInterpretation(planetName, houseNum, rashiName, varga, dignity, houseSignificance, planetData, rashiData);

    return {
        planet: planetName,
        house: houseNum,
        rashi: rashiName,
        houseTitle: houseSignificance.title,
        houseAreas: houseSignificance.areas,
        dignity: dignity.status,
        strength: dignity.strength,
        interpretation: interpretation,
        keywords: rashiData?.keywords || []
    };
}

/**
 * Generate contextual interpretation based on varga-specific logic
 */
function generateContextualInterpretation(planetName, houseNum, rashiName, varga, dignity, houseSignificance, planetData, rashiData) {
    let interpretation = "";

    // Start with dignity impact
    const strengthDesc = dignity.strength >= 85 ? "very strong" : dignity.strength >= 70 ? "strong" : dignity.strength >= 50 ? "moderate" : dignity.strength >= 30 ? "weak" : "very weak";

    interpretation += `**${planetName} in ${rashiName} (${houseNum}th house - ${houseSignificance.title})** - ${dignity.status} (${strengthDesc}).\n\n`;

    // Varga-specific interpretations
    switch (varga) {
        case 1: // D1 - Rasi
            interpretation += generateD1Interpretation(planetName, houseNum, rashiName, dignity, planetData);
            break;
        case 2: // D2 - Wealth
            interpretation += generateD2Interpretation(planetName, houseNum, rashiName, dignity, houseSignificance);
            break;
        case 7: // D7 - Children
            interpretation += generateD7Interpretation(planetName, houseNum, rashiName, dignity);
            break;
        case 9: // D9 - Marriage
            interpretation += generateD9Interpretation(planetName, houseNum, rashiName, dignity, planetData);
            break;
        case 10: // D10 - Career
            interpretation += generateD10Interpretation(planetName, houseNum, rashiName, dignity, planetData);
            break;
        case 60: // D60 - Karma
            interpretation += generateD60Interpretation(planetName, houseNum, rashiName, dignity);
            break;
        default:
            interpretation += generateGenericInterpretation(planetName, houseNum, rashiName, dignity, houseSignificance, planetData);
    }

    return interpretation.trim();
}

// D1 specific interpretations
function generateD1Interpretation(planetName, houseNum, rashiName, dignity, planetData) {
    let result = "";

    if (dignity.status === "Exalted") {
        result += `This is an excellent placement! ${planetName} shines brilliantly here, bringing abundance in matters of the ${houseNum}th house. `;
    } else if (dignity.status === "Debilitated") {
        result += `This placement requires attention. ${planetName} faces challenges here, and efforts may be needed to strengthen ${houseNum}th house matters. `;
    }

    // Safe access to planetData.represents
    const represents = planetData?.represents || [];

    // House-specific insights
    if (houseNum === 1) {
        result += `Shapes personality with ${represents.slice(0, 3).join(', ')} energy. `;
    } else if (houseNum === 10) {
        result += `Influences career through ${represents.slice(0, 3).join(', ')}. `;
    } else if (houseNum === 7) {
        result += `Affects partnerships and spouse with ${represents.slice(0, 3).join(', ')} qualities. `;
    }

    return result;
}

// D2 (Wealth) specific interpretations
function generateD2Interpretation(planetName, houseNum, rashiName, dignity, houseSignificance) {
    let result = "**Wealth Analysis:** ";

    if (dignity.strength >= 70) {
        result += `Strong wealth potential through ${houseSignificance.areas[0]}. `;
        result += `${planetName} brings prosperity and financial growth in this area. `;
    } else if (dignity.strength < 40) {
        result += `Challenges in wealth generation through ${houseSignificance.areas[0]}. `;
        result += `Extra effort required for financial stability. `;
    } else {
        result += `Moderate wealth through ${houseSignificance.areas[0]}. `;
    }

    if (houseNum === 2 || houseNum === 11) {
        result += `Favorable for accumulation and savings. `;
    }

    return result;
}

// D7 (Children) specific interpretations
function generateD7Interpretation(planetName, houseNum, rashiName, dignity) {
    let result = "**Children & Progeny:** ";

    const benefics = ["Jupiter", "Venus", "Mercury", "Moon"];
    const isBenefic = benefics.includes(planetName);

    if (houseNum === 5) {
        if (isBenefic && dignity.strength >= 60) {
            result += `Excellent for children! ${planetName} promises healthy, intelligent progeny. `;
            result += `Relationship with children will be harmonious and rewarding. `;
        } else if (!isBenefic && dignity.strength < 40) {
            result += `May indicate delays or challenges regarding children. `;
            result += `Patience and care needed in raising offspring. `;
        } else {
            result += `Moderate indications for children. Normal relationship with progeny. `;
        }
    } else if (houseNum === 9) {
        result += `Grandchildren and fortune through progeny indicated. `;
    }

    return result;
}

// D9 (Marriage/Navamsa) specific interpretations
function generateD9Interpretation(planetName, houseNum, rashiName, dignity, planetData) {
    let result = "**Marriage & Dharma:** ";
    const represents = planetData?.represents || [planetName];

    if (houseNum === 7) {
        result += `**Primary spouse indicator!** ${planetName} in ${rashiName} describes spouse's nature: `;
        result += `Spouse will embody ${represents.slice(0, 3).join(', ')} qualities. `;
        if (dignity.strength >= 70) {
            result += `Harmonious marriage, supportive partner. `;
        } else if (dignity.strength < 40) {
            result += `Challenges in marriage possible, understanding needed. `;
        }
    } else if (houseNum === 1) {
        result += `Inner self after marriage. Spiritual growth through partnership. `;
    } else if (houseNum === 4) {
        result += `Marital happiness and emotional satisfaction indicated. `;
    }

    return result;
}

// D10 (Career) specific interpretations
function generateD10Interpretation(planetName, houseNum, rashiName, dignity, planetData) {
    let result = "**Career & Profession:** ";
    const represents = planetData?.represents || [planetName];

    if (houseNum === 10) {
        result += `**Primary career indicator!** `;
        result += `Profession related to ${represents.join(', ')}. `;

        if (planetName === "Sun") result += `Government, administration, leadership roles. `;
        else if (planetName === "Moon") result += `Public dealing, nurturing professions, hospitality. `;
        else if (planetName === "Mars") result += `Technical, engineering, military, sports. `;
        else if (planetName === "Mercury") result += `Communication, business, teaching, writing. `;
        else if (planetName === "Jupiter") result += `Teaching, counseling, finance, law. `;
        else if (planetName === "Venus") result += `Arts, beauty, luxury items, entertainment. `;
        else if (planetName === "Saturn") result += `Service, labor, long-term projects, discipline. `;

        if (dignity.strength >= 70) {
            result += `High success and recognition in career. `;
        }
    }

    return result;
}

// D60 (Karma) specific interpretations
function generateD60Interpretation(planetName, houseNum, rashiName, dignity) {
    let result = "**Past Life Karma:** ";

    result += `${planetName} carries karmic lessons related to ${houseNum}th house matters. `;

    if (dignity.status === "Exalted") {
        result += `Excellent karma from past lives! Positive results without much effort. `;
    } else if (dignity.status === "Debilitated") {
        result += `Karmic debts need to be cleared. This area requires conscious effort and patience. `;
    } else {
        result += `Balanced karmic situation. Results based on current life actions. `;
    }

    return result;
}

// Generic interpretation for other vargas
function generateGenericInterpretation(planetName, houseNum, rashiName, dignity, houseSignificance, planetData) {
    const represents = planetData?.represents || [planetName];
    let result = `Influences ${houseSignificance.title.toLowerCase()} through ${represents.slice(0, 2).join(' and ')}. `;

    if (dignity.strength >= 70) {
        result += `Strong positive results in ${houseSignificance.areas[0]}. `;
    } else if (dignity.strength < 40) {
        result += `Challenges may arise in ${houseSignificance.areas[0]}. `;
    }

    return result;
}

/**
 * Analyze complete chart for a varga
 */
function analyzeVargaChart(varga, houses) {
    const vargaData = VARGA_HOUSE_SIGNIFICANCE[varga];
    if (!vargaData) return null;

    const houseAnalysis = [];

    for (let houseNum = 1; houseNum <= 12; houseNum++) {
        const house = houses.find(h => h.number === houseNum);
        if (!house) continue;

        const houseSignificance = vargaData.houses[houseNum];
        const planetInterpretations = [];

        if (house.planets && house.planets.length > 0) {
            house.planets.forEach(planet => {
                const interpretation = interpretPlanetInHouseForVarga(
                    planet.name,
                    houseNum,
                    planet.rashi,
                    varga
                );
                if (interpretation) {
                    planetInterpretations.push(interpretation);
                }
            });
        }

        houseAnalysis.push({
            houseNumber: houseNum,
            title: houseSignificance.title,
            areas: houseSignificance.areas,
            rashi: house.rashi,
            planets: house.planets || [],
            interpretations: planetInterpretations,
            hasplanets: planetInterpretations.length > 0
        });
    }

    return {
        varga,
        vargaName: vargaData.name,
        purpose: vargaData.purpose,
        houseAnalysis
    };
}

module.exports = {
    interpretPlanetInHouseForVarga,
    analyzeVargaChart,
    getPlanetaryDignity,
    PLANET_SIGNIFICATIONS,
    RASHI_CHARACTERISTICS
};
