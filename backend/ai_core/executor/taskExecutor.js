const parallelExecutor = require('./parallelExecutor');
const { calculatePlanetaryState } = require('../../ai_astrologer/astrology/planets');
const { calculateLagnaAndHouses, mapPlanetsToHouses } = require('../../ai_astrologer/astrology/lagna');

module.exports = {
  execute: async (planData, userParams) => {
    const { plan, context } = planData;
    const results = {};

    // Base Calculation Data
    let dt = null, lat = 17.385, lng = 78.4867;
    if (userParams.userProfile?.dob && userParams.userProfile?.time) {
      const dtStr = `${userParams.userProfile.dob}T${userParams.userProfile.time}:00`;
      dt = new Date(dtStr);
      if (userParams.userProfile.lat) lat = parseFloat(userParams.userProfile.lat);
      if (userParams.userProfile.lng) lng = parseFloat(userParams.userProfile.lng);
    }

    for (const step of plan) {
      if (step.action === 'COMPUTE_LAGNA') {
        if (dt && !isNaN(dt.getTime())) {
             const lagnaState = calculateLagnaAndHouses(dt, lat, lng);
             results['LAGNA'] = lagnaState.lagna;
             results['CUSPS'] = lagnaState.placidusCusps;
        } else {
             results['LAGNA'] = null;
        }
      } else if (step.action === 'COMPUTE_NAKSHATRA') {
         if (dt && !isNaN(dt.getTime())) {
             const planets = calculatePlanetaryState(dt);
             const moon = planets.planets.find(p => p.id === 1); // 1 is Moon (Chandra)
             if (moon) {
                 results['NAKSHATRA'] = moon.nakshatra;
                 results['MOON_SIGN'] = moon.rashi;
             }
         } else if (userParams.userProfile?.nakshatra) {
             results['NAKSHATRA'] = { name: userParams.userProfile.nakshatra, pada: 1 };
         }
      } else if (step.action === 'EVALUATE_BUSINESS') {
        // Advanced logic based on Lagna & Moon if available
        let score = 5; let reasons = "Average day for business."; let verdict = "Neutral";
        if (results['LAGNA'] && ['Leo', 'Taurus', 'Scorpio', 'Aquarius'].includes(results['LAGNA'].name)) {
            score += 3; reasons = `Your ${results['LAGNA'].name} Ascendant gives you fixed determination and stability for business.`; verdict = "Good";
        }
        if (userParams.panchang?.abhijitMuhurat) {
            score += 2; reasons += " Abhijit Muhurat is active today, further supporting financial deals."; verdict = "Highly Auspicious";
        }
        results['BUSINESS_SCORE'] = { score, verdict, reasons };
        
      } else if (step.action === 'EVALUATE_TRAVEL') {
        let score = 5; let reasons = "Favorable for standard travel."; let verdict = "Good";
        if (userParams.panchang?.rahuKaal) {
            score -= 4; reasons = `Caution: Rahu Kaal (${userParams.panchang.rahuKaal.start} - ${userParams.panchang.rahuKaal.end}) is active today. Avoid starting journeys during this time.`; verdict = "Avoid";
        }
        if (results['MOON_SIGN'] && ['Cancer', 'Pisces', 'Scorpio'].includes(results['MOON_SIGN'].name)) {
            score += 2; reasons += ` Your Moon in ${results['MOON_SIGN'].name} (Water sign) makes travel smooth and adaptable.`;
        }
        results['TRAVEL_SCORE'] = { score, verdict, reasons };

      } else if (step.action === 'FIND_BEST_TIME') {
        let bestTime = "No exceptionally auspicious time found today.";
        if (userParams.panchang?.abhijitMuhurat) {
            bestTime = `The most auspicious Muhurat (Abhijit) is between ${userParams.panchang.abhijitMuhurat.start} and ${userParams.panchang.abhijitMuhurat.end}.`;
        }
        // Use Pancha Rahita Good slots if available
        if (userParams.panchang?.panchaRahitaMuhurat) {
             const goodSlots = userParams.panchang.panchaRahitaMuhurat.filter(p => p.category?.toLowerCase().includes('good'));
             if (goodSlots.length > 0) {
                 bestTime += `\nAdditionally, Pancha Rahita confirms these flawless slots: ${goodSlots.map(s => s.start + '-' + s.end).join(', ')}.`;
             }
        }
        results['BEST_TIME'] = bestTime;
      }
    }

    return results;
  }
};
