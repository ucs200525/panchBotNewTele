const RASHIS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const RASHI_SYMBOLS = {
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋",
    "Leo": "♌", "Virgo": "♍", "Libra": "♎", "Scorpio": "♏",
    "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓"
};

/**
 * Calculates a specific divisional chart (Varga) sign for a given longitude.
 * @param {number} longitude - Planet or Lagna sidereal longitude (0 to 360)
 * @param {string} varga - The D-chart to calculate (e.g., 'D9')
 * @returns {object} { rashiIndex, name, symbol }
 */
function getDivisionalSign(longitude, varga) {
    const signIndex = Math.floor(longitude / 30);
    const degInSign = longitude % 30;
    
    // 0 = Aries (Odd), 1 = Taurus (Even), etc.
    const isOddSign = (signIndex % 2 === 0);
    const element = signIndex % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
    const modality = signIndex % 3; // 0=Movable, 1=Fixed, 2=Dual

    let s = signIndex;

    switch (varga) {
        case 'D1': // Rashi
            s = signIndex;
            break;
            
        case 'D2': // Hora (15°)
            if (isOddSign) {
                s = (degInSign < 15) ? 4 : 3; // Leo : Cancer
            } else {
                s = (degInSign < 15) ? 3 : 4; // Cancer : Leo
            }
            break;

        case 'D3': // Drekkana (10°)
            const d3Part = Math.floor(degInSign / 10);
            s = (signIndex + (d3Part * 4)) % 12;
            break;

        case 'D4': // Chaturthamsha (7.5°)
            const d4Part = Math.floor(degInSign / 7.5);
            s = (signIndex + (d4Part * 3)) % 12;
            break;

        case 'D7': // Saptamsha (4.2857°)
            const d7Part = Math.floor(degInSign / (30 / 7));
            s = isOddSign ? (signIndex + d7Part) % 12 : (signIndex + 6 + d7Part) % 12;
            break;

        case 'D9': // Navamsha (3°20')
            const d9Part = Math.floor(degInSign / (30 / 9));
            const startD9 = [0, 9, 6, 3][element]; // Fire->Aries, Earth->Cap, Air->Lib, Water->Can
            s = (startD9 + d9Part) % 12;
            break;

        case 'D10': // Dashamsha (3°)
            const d10Part = Math.floor(degInSign / 3);
            const startD10 = isOddSign ? signIndex : (signIndex + 8) % 12;
            s = (startD10 + d10Part) % 12;
            break;

        case 'D12': // Dwadashamsha (2.5°)
            const d12Part = Math.floor(degInSign / 2.5);
            s = (signIndex + d12Part) % 12;
            break;

        case 'D16': // Shodashamsha (1.875°)
            const d16Part = Math.floor(degInSign / 1.875);
            const startD16 = [0, 4, 8][modality]; // Mov->Ari, Fix->Leo, Dual->Sag
            s = (startD16 + d16Part) % 12;
            break;

        case 'D20': // Vimshamsha (1.5°)
            const d20Part = Math.floor(degInSign / 1.5);
            const startD20 = [0, 8, 4][modality]; // Mov->Ari, Fix->Sag, Dual->Leo
            s = (startD20 + d20Part) % 12;
            break;

        case 'D24': // Chaturvimshamsha (1.25°)
            const d24Part = Math.floor(degInSign / 1.25);
            const startD24 = isOddSign ? 4 : 3; // Leo or Cancer
            s = (startD24 + d24Part) % 12;
            break;

        case 'D27': // Saptavimshamsha (1.1111°)
            const d27Part = Math.floor(degInSign / (30 / 27));
            const startD27 = [0, 3, 6, 9][element]; // Fire->Ari, Earth->Can, Air->Lib, Water->Cap
            s = (startD27 + d27Part) % 12;
            break;

        case 'D30': // Trishiamsha (Parashari rules for unequal divisions)
            if (isOddSign) {
                if (degInSign <= 5) s = 0; // Aries
                else if (degInSign <= 10) s = 10; // Aquarius
                else if (degInSign <= 18) s = 8; // Sagittarius
                else if (degInSign <= 25) s = 2; // Gemini
                else s = 6; // Libra
            } else {
                if (degInSign <= 5) s = 1; // Taurus
                else if (degInSign <= 12) s = 5; // Virgo
                else if (degInSign <= 20) s = 11; // Pisces
                else if (degInSign <= 25) s = 9; // Capricorn
                else s = 7; // Scorpio
            }
            break;

        case 'D40': // Khavedamsha (0.75°)
            const d40Part = Math.floor(degInSign / 0.75);
            const startD40 = isOddSign ? 0 : 6; // Aries or Libra
            s = (startD40 + d40Part) % 12;
            break;

        case 'D45': // Akshavedamsha (0.6667°)
            const d45Part = Math.floor(degInSign / (30 / 45));
            const startD45 = [0, 4, 8][modality];
            s = (startD45 + d45Part) % 12;
            break;

        case 'D60': // Shashtiamsha (0.5°)
            const d60Part = Math.floor(degInSign / 0.5);
            s = (signIndex + d60Part) % 12;
            break;

        default:
            s = signIndex;
    }

    return {
        index: s,
        name: RASHIS[s],
        symbol: RASHI_SYMBOLS[RASHIS[s]]
    };
}

/**
 * Generates all major divisional charts for a given planet/Lagna longitude.
 */
function getAllDivisionalCharts(longitude) {
    const vargas = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    const result = {};
    for (let v of vargas) {
        result[v] = getDivisionalSign(longitude, v);
    }
    return result;
}

module.exports = {
    getDivisionalSign,
    getAllDivisionalCharts
};
