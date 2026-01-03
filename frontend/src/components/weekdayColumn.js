import React from 'react';

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
const findClosestDay = (input ) => {
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

    return closestDay;
}


// const WeekdayColumn = ({isColored }) => {

//     return (
//         <>
//             <td style={isColored ? { backgroundColor: '#002060', color: 'white' } : {}}>
//             </td>
//         </>
//     );
// };




// Exporting the component and the findClosestDay function
export {  findClosestDay };
