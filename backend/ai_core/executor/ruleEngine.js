/**
 * AI Core — Rule Engine v2.0
 * Deterministic Vedic scoring engine for Travel, Business, and General Life activities.
 * Uses Swiss-computed Lagna, Moon, and Panchang data for 100% accurate evaluations.
 */

// ── Scoring Constants ────────────────────────────────────────────────────────
const SCORE = {
  RAHU_KAAL_PENALTY: -4,
  ABHIJIT_BONUS: 3,
  FIXED_SIGN_LAGNA_BONUS: 2,
  WATER_SIGN_TRAVEL_BONUS: 2,
  FIRE_SIGN_BUSINESS_BONUS: 1,
  BENEFIC_NAKSHATRA_BONUS: 2,
  MALEFIC_NAKSHATRA_PENALTY: -1,
  PANCHA_RAHITA_BONUS: 2,
  BASE: 5,
};

const FIXED_SIGNS = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];
const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];

// Nakshatras classified by nature for activity suitability
const BENEFIC_NAKSHATRAS_BUSINESS = ['Pushya', 'Rohini', 'Hasta', 'Ashwini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada'];
const BENEFIC_NAKSHATRAS_TRAVEL = ['Ashwini', 'Punarvasu', 'Hasta', 'Swati', 'Shravana', 'Revati'];
const MALEFIC_NAKSHATRAS = ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'];

// ── Verdict Mapping ──────────────────────────────────────────────────────────
function scoreToVerdict(score) {
  if (score <= 2) return 'Avoid';
  if (score <= 4) return 'Unfavorable';
  if (score <= 6) return 'Neutral';
  if (score <= 8) return 'Good';
  return 'Highly Auspicious';
}

// ── Business Evaluation ──────────────────────────────────────────────────────
function evaluateBusiness(lagna, moonSign, moonNakshatra, panchang) {
  let score = SCORE.BASE;
  const reasons = [];

  // Rahu Kaal check
  if (panchang.hasRahuKaal) {
    score += SCORE.RAHU_KAAL_PENALTY;
    const rk = panchang.rahuKaal;
    const rkStr = rk ? `(${rk.start || rk} - ${rk.end || ''})` : '';
    reasons.push(`⛔ **Rahu Kaal** ${rkStr} is active during this period. Avoid signing contracts or initiating financial deals.`);
  }

  // Abhijit Muhurat check
  if (panchang.hasAbhijit && panchang.abhijitMuhurat) {
    score += SCORE.ABHIJIT_BONUS;
    const am = panchang.abhijitMuhurat;
    const amStr = am ? `(${am.start || am} - ${am.end || ''})` : '';
    reasons.push(`✅ **Abhijit Muhurat** ${amStr} is a powerful time for business transactions and deal closures.`);
  }

  // Lagna sign bonus
  if (lagna && FIXED_SIGNS.includes(lagna.name)) {
    score += SCORE.FIXED_SIGN_LAGNA_BONUS;
    reasons.push(`✅ Your **${lagna.name} Ascendant** (fixed sign) grants determination, stability, and follow-through — excellent traits for business.`);
  } else if (lagna && EARTH_SIGNS.includes(lagna.name)) {
    score += SCORE.FIXED_SIGN_LAGNA_BONUS;
    reasons.push(`✅ Your **${lagna.name} Ascendant** (earth sign) gives practical, methodical energy — great for financial planning and structured deals.`);
  } else if (lagna && FIRE_SIGNS.includes(lagna.name)) {
    score += SCORE.FIRE_SIGN_BUSINESS_BONUS;
    reasons.push(`✅ Your **${lagna.name} Ascendant** (fire sign) gives initiative and leadership — favorable for launching ventures and negotiations.`);
  }

  // Moon nakshatra check for business
  if (moonNakshatra) {
    if (BENEFIC_NAKSHATRAS_BUSINESS.includes(moonNakshatra.name)) {
      score += SCORE.BENEFIC_NAKSHATRA_BONUS;
      reasons.push(`✅ Moon in **${moonNakshatra.name}** Nakshatra is highly favorable for wealth creation and business dealings.`);
    } else if (MALEFIC_NAKSHATRAS.includes(moonNakshatra.name)) {
      score += SCORE.MALEFIC_NAKSHATRA_PENALTY;
      reasons.push(`⚠️ Moon in **${moonNakshatra.name}** Nakshatra can bring uncertainty — proceed carefully with major decisions.`);
    }
  }

  // Pancha Rahita good slots
  if (panchang.panchaRahita && panchang.panchaRahita.length > 0) {
    const good = panchang.panchaRahita.filter(p => p.category?.toLowerCase().includes('good') || p.type?.toLowerCase().includes('good'));
    if (good.length > 0) {
      score += SCORE.PANCHA_RAHITA_BONUS;
      reasons.push(`✅ **Pancha Rahita** confirms ${good.length} excellent slot(s) free of all five doshas.`);
    }
  }

  const finalScore = Math.max(0, Math.min(10, score));
  return {
    score: finalScore,
    verdict: scoreToVerdict(finalScore),
    reasons,
  };
}

// ── Travel Evaluation ────────────────────────────────────────────────────────
function evaluateTravel(lagna, moonSign, moonNakshatra, panchang, timeConstraints = []) {
  let score = SCORE.BASE;
  const reasons = [];

  // Rahu Kaal
  if (panchang.hasRahuKaal) {
    score += SCORE.RAHU_KAAL_PENALTY;
    const rk = panchang.rahuKaal;
    const rkStr = rk ? `(${rk.start || rk} - ${rk.end || ''})` : '';
    reasons.push(`⛔ **Rahu Kaal** ${rkStr} is active. Never start a journey during Rahu Kaal — it is considered highly inauspicious for travel.`);
  }

  // Abhijit is good for travel too
  if (panchang.hasAbhijit && panchang.abhijitMuhurat) {
    score += SCORE.ABHIJIT_BONUS;
    const am = panchang.abhijitMuhurat;
    reasons.push(`✅ **Abhijit Muhurat** (${am.start || am} - ${am.end || ''}) is excellent for starting a journey.`);
  }

  // Moon sign
  if (moonSign && WATER_SIGNS.includes(moonSign.name)) {
    score += SCORE.WATER_SIGN_TRAVEL_BONUS;
    reasons.push(`✅ Today's Moon in **${moonSign.name}** (water sign) makes travel fluid and adaptable — good for journeys near water or by sea.`);
  }

  // Moon nakshatra for travel
  if (moonNakshatra) {
    if (BENEFIC_NAKSHATRAS_TRAVEL.includes(moonNakshatra.name)) {
      score += SCORE.BENEFIC_NAKSHATRA_BONUS;
      reasons.push(`✅ **${moonNakshatra.name}** Nakshatra is among the most auspicious for starting a journey.`);
    } else if (MALEFIC_NAKSHATRAS.includes(moonNakshatra.name)) {
      score += SCORE.MALEFIC_NAKSHATRA_PENALTY;
      reasons.push(`⚠️ **${moonNakshatra.name}** Nakshatra is classified as "Krura" (harsh) — avoid long-distance journeys if possible.`);
    }
  }

  // Pancha Rahita good slots
  if (panchang.panchaRahita && panchang.panchaRahita.length > 0) {
    const good = panchang.panchaRahita.filter(p => p.category?.toLowerCase().includes('good') || p.type?.toLowerCase().includes('good'));
    if (good.length > 0) {
      score += SCORE.PANCHA_RAHITA_BONUS;
      reasons.push(`✅ **Pancha Rahita** confirms ${good.length} dosha-free slot(s) safe for travel today.`);
    }
  }

  const finalScore = Math.max(0, Math.min(10, score));
  return {
    score: finalScore,
    verdict: scoreToVerdict(finalScore),
    reasons,
  };
}

// ── Best Time Finder ─────────────────────────────────────────────────────────
function findBestTime(panchang, timeFilter = null) {
  let slots = [];

  if (panchang.hasAbhijit && panchang.abhijitMuhurat) {
    const am = panchang.abhijitMuhurat;
    slots.push({
      name: 'Abhijit Muhurat',
      time: `${am.start || am} - ${am.end || ''}`,
      startTime: am.start || am,
      quality: 'Highly Auspicious',
      note: 'Most powerful muhurat of the day — universally beneficial.'
    });
  }

  if (panchang.panchaRahita && panchang.panchaRahita.length > 0) {
    const good = panchang.panchaRahita.filter(p => p.category?.toLowerCase().includes('good') || p.type?.toLowerCase().includes('good'));
    for (const slot of good) {
      slots.push({
        name: 'Pancha Rahita Good Slot',
        time: `${slot.start || slot.startTime} - ${slot.end || slot.endTime}`,
        startTime: slot.start || slot.startTime,
        quality: 'Auspicious',
        note: 'Free of all five major doshas per Bhargava Panchang.'
      });
    }
  }

  if (slots.length === 0) {
    slots.push({
      name: 'General',
      time: '6:00 am - 9:00 am',
      startTime: '06:00',
      quality: 'Favorable',
      note: 'No specific muhurat data available. Morning hours generally carry brahma muhurat energy.'
    });
  }

  // Apply time filter (e.g., "after 2 PM" -> "14:00")
  if (timeFilter) {
    const filterMinutes = timeToMinutes(timeFilter);
    slots = slots.filter(slot => {
      const slotMinutes = timeToMinutes(slot.startTime);
      return slotMinutes >= filterMinutes;
    });
  }

  return slots;
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  let s = timeStr.toLowerCase().replace(/\s+/g, '');
  const isPm = s.includes('pm');
  const isAm = s.includes('am');
  let [h, m] = s.replace(/[ap]m/g, '').split(':').map(Number);
  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;
  return (h || 0) * 60 + (m || 0);
}

function evaluateGeneralDay(lagna, moonSign, moonNakshatra, panchang) {
  const business = evaluateBusiness(lagna, moonSign, moonNakshatra, panchang);
  const travel = evaluateTravel(lagna, moonSign, moonNakshatra, panchang);
  
  const overallScore = Math.round((business.score + travel.score) / 2);
  const reasons = [...new Set([...business.reasons.slice(0,2), ...travel.reasons.slice(0,2)])];
  
  return {
    overallScore,
    businessScore: business.score,
    travelScore: travel.score,
    verdict: scoreToVerdict(overallScore),
    reasons
  };
}

module.exports = { 
  evaluateBusiness, 
  evaluateTravel, 
  evaluateGeneralDay, 
  findBestTime, 
  scoreToVerdict 
};
