/**
 * Vedic Astro-Rule Advisory Engine
 * Written completely from scratch - 100% free, local, and offline-compatible.
 * Uses classical Vedic astrological rules (Sutras) to translate Swiss Ephemeris data
 * into personalized, natural-language advice and Activity Favorable Scores.
 */

// Classical Nakshatra lists and planetary lords
const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu", rashi: "Mesha" },
  { name: "Bharani", lord: "Shukra", rashi: "Mesha" },
  { name: "Krittika", lord: "Surya", rashi: "Mesha/Vrishabha" },
  { name: "Rohini", lord: "Chandra", rashi: "Vrishabha" },
  { name: "Mrigashirsha", lord: "Mangala", rashi: "Vrishabha/Mithuna" },
  { name: "Ardra", lord: "Rahu", rashi: "Mithuna" },
  { name: "Punarvasu", lord: "Guru", rashi: "Mithuna/Karka" },
  { name: "Pushya", lord: "Shani", rashi: "Karka" },
  { name: "Ashlesha", lord: "Budha", rashi: "Karka" },
  { name: "Magha", lord: "Ketu", rashi: "Simha" },
  { name: "Purva Phalguni", lord: "Shukra", rashi: "Simha" },
  { name: "Uttara Phalguni", lord: "Surya", rashi: "Simha/Kanya" },
  { name: "Hasta", lord: "Chandra", rashi: "Kanya" },
  { name: "Chitra", lord: "Mangala", rashi: "Kanya/Tula" },
  { name: "Svati", lord: "Rahu", rashi: "Tula" },
  { name: "Vishakha", lord: "Guru", rashi: "Tula/Vrishchika" },
  { name: "Anuradha", lord: "Shani", rashi: "Vrishchika" },
  { name: "Jyeshtha", lord: "Budha", rashi: "Vrishchika" },
  { name: "Mula", lord: "Ketu", rashi: "Dhanu" },
  { name: "Purva Ashadha", lord: "Shukra", rashi: "Dhanu" },
  { name: "Uttara Ashadha", lord: "Surya", rashi: "Dhanu/Makara" },
  { name: "Shravana", lord: "Chandra", rashi: "Makara" },
  { name: "Dhanishta", lord: "Mangala", rashi: "Makara/Kumbha" },
  { name: "Shatabhisha", lord: "Rahu", rashi: "Kumbha" },
  { name: "Purva Bhadrapada", lord: "Guru", rashi: "Kumbha/Meena" },
  { name: "Uttara Bhadrapada", lord: "Shani", rashi: "Meena" },
  { name: "Revati", lord: "Budha", rashi: "Meena" }
];

const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", 
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
];

const TARA_BALAS = [
  { name: "Janma Tara (Body Safety Alert)", rating: "Bad", score: 30, description: "Focus on rest. Avoid starting major new physical works." },
  { name: "Sampat Tara (Wealth and Success)", rating: "Excellent", score: 100, description: "Highly Auspicious! Ideal for financial investments, contracts, and new business starts." },
  { name: "Vipat Tara (Obstacle Warning)", rating: "Bad", score: 20, description: "Inauspicious. High risk of unexpected hurdles, financial delays, or minor losses." },
  { name: "Kshema Tara (Well-being and Safety)", rating: "Good", score: 85, description: "Auspicious! Favorable for household affairs, long journeys, and health recoveries." },
  { name: "Pratyak Tara (Friction and Opposition)", rating: "Bad", score: 25, description: "Inauspicious. Expect minor disputes, relationship misunderstandings, or work friction." },
  { name: "Sadhana Tara (Goal Fulfillment)", rating: "Excellent", score: 95, description: "Highly Auspicious! Excellent for focused efforts, deep research, and achieving milestones." },
  { name: "Naidhana Tara (Extreme Danger/Risk)", rating: "Danger", score: 10, description: "Critical Warning! Extreme caution advised. Strictly postpone high-risk initiatives." },
  { name: "Mitra Tara (Harmony and Assistance)", rating: "Good", score: 80, description: "Auspicious. Excellent for team collaborations, socializing, and seeking mentorship." },
  { name: "Parama Mitra Tara (Great Support)", rating: "Excellent", score: 90, description: "Extremely Favorable! Highly supportive for long-term agreements and joint ventures." }
];

const CHANDRA_BALAS = {
  1: { rating: "Good", score: 75, description: "Moon in your 1st House provides strong mental focus, self-confidence, and vitality." },
  2: { rating: "Bad", score: 40, description: "Moon in your 2nd House can bring emotional fluctuations regarding wealth and speech." },
  3: { rating: "Excellent", score: 95, description: "Moon in your 3rd House is highly auspicious, bringing courage, successful efforts, and gains." },
  4: { rating: "Bad", score: 35, description: "Moon in your 4th House can cause minor domestic distress or restlessness. Rest well." },
  5: { rating: "Good", score: 70, description: "Moon in your 5th House is favorable for analytical reasoning, education, and creative designs." },
  6: { rating: "Excellent", score: 90, description: "Moon in your 6th House gives high physical immunity and victory over professional challenges." },
  7: { rating: "Excellent", score: 95, description: "Moon in your 7th House is auspicious for partnerships, joint ventures, and customer dealings." },
  8: { rating: "Danger", score: 10, description: "Chandra Ashtama! Highly inauspicious. High risk of bad moods, anxiety, or accidental delays." },
  9: { rating: "Bad", score: 45, description: "Moon in your 9th House may create minor delays in fortune or spiritual confusion." },
  10: { rating: "Excellent", score: 95, description: "Moon in your 10th House brings strong professional status, career support, and recognition." },
  11: { rating: "Excellent", score: 100, description: "Moon in your 11th House is extremely auspicious, bringing cash gains and happiness." },
  12: { rating: "Danger", score: 15, description: "Moon in your 12th House can trigger heavy unneeded expenses, bodily exhaustion, or loss of sleep." }
};

/**
 * Find Nakshatra index by name
 */
function findNakshatraIndex(name) {
  if (!name) return -1;
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  return NAKSHATRAS.findIndex(n => n.name.toLowerCase().replace(/[^a-z]/g, '').includes(clean) || clean.includes(n.name.toLowerCase().replace(/[^a-z]/g, '')));
}

/**
 * Find Rashi index by name
 */
function findRashiIndex(name) {
  if (!name) return -1;
  const clean = name.toLowerCase().replace(/[^a-z]/g, '');
  return RASHIS.findIndex(r => r.toLowerCase().replace(/[^a-z]/g, '').includes(clean));
}

/**
 * Calculate Tara Bala
 * (Transit Nakshatra Num - Birth Nakshatra Num + 27) % 9 + 1
 */
function calculateTaraBala(birthNaksName, transitNaksName) {
  const birthIdx = findNakshatraIndex(birthNaksName);
  const transitIdx = findNakshatraIndex(transitNaksName);

  if (birthIdx === -1 || transitIdx === -1) {
    return { name: "Neutral (No birth details)", rating: "Neutral", score: 60, description: "Calculation requires specific birth star." };
  }

  // 1-indexed count
  const birthNum = birthIdx + 1;
  const transitNum = transitIdx + 1;

  const diff = (transitNum - birthNum + 27) % 9;
  return TARA_BALAS[diff];
}

/**
 * Calculate Chandra Bala
 * (Transit Rashi Num - Birth Rashi Num + 12) % 12 + 1
 */
function calculateChandraBala(birthRashiName, transitRashiName) {
  const birthIdx = findRashiIndex(birthRashiName);
  const transitIdx = findRashiIndex(transitRashiName);

  if (birthIdx === -1 || transitIdx === -1) {
    return { rating: "Neutral", score: 60, description: "Calculation requires specific birth Moon Sign." };
  }

  const birthNum = birthIdx + 1;
  const transitNum = transitIdx + 1;

  const house = (transitNum - birthNum + 12) % 12 + 1;
  return {
    house,
    ...CHANDRA_BALAS[house]
  };
}

/**
 * Evaluate Favorable Score for Specific Activities (Travel, Business, Marriage, General)
 */
function evaluateActivityAuspiciousness(activity, panchang, taraBala, chandraBala) {
  let score = 50; // Starting baseline
  const rulesMet = [];
  const rulesBroken = [];

  const tithiNum = panchang.tithi?.number || 1;
  const naksName = panchang.nakshatra?.name || "";
  const weekday = panchang.vara || "";

  // 1. General Tithi Auspiciousness (Rikta Tithis: 4th, 9th, 14th are generally avoided)
  const riktaTithis = [4, 9, 14, 19, 24, 29];
  if (riktaTithis.includes(tithiNum)) {
    score -= 15;
    rulesBroken.push("Occurs on a Rikta (Empty) Tithi, which generally dilutes productivity.");
  } else if ([5, 10, 15, 30].includes(tithiNum)) {
    score += 10;
    rulesMet.push("Occurs on a Purna (Full/Inuitive) Tithi, excellent for wholesome endings.");
  }

  // 2. Incorporate Tara Bala & Chandra Bala if present
  if (taraBala && taraBala.rating !== "Neutral") {
    if (taraBala.rating === "Excellent") {
      score += 20;
      rulesMet.push(`Personal Tara Bala is Excellent (${taraBala.name}).`);
    } else if (taraBala.rating === "Good") {
      score += 12;
      rulesMet.push(`Personal Tara Bala is Good (${taraBala.name}).`);
    } else if (taraBala.rating === "Bad" || taraBala.rating === "Danger") {
      score -= 20;
      rulesBroken.push(`Personal Tara Bala is Low (${taraBala.name}).`);
    }
  }

  if (chandraBala && chandraBala.rating) {
    if (chandraBala.rating === "Excellent") {
      score += 20;
      rulesMet.push("Your personal Chandra Bala is Highly Favorable.");
    } else if (chandraBala.rating === "Good") {
      score += 10;
      rulesMet.push("Your personal Chandra Bala is Supportive.");
    } else if (chandraBala.rating === "Danger" || chandraBala.rating === "Bad") {
      score -= 25;
      rulesBroken.push(`Your Moon transit is in house ${chandraBala.house} (${chandraBala.rating}), indicating potential emotional fatigue.`);
    }
  }

  // 3. Activity specific overrides
  switch (activity.toLowerCase()) {
    case 'travel':
      // Auspicious Nakshatras for travel: Ashwini, Anuradha, Mrigashirsha, Revati, Hasta, Pushya, Shravana
      const travelNaks = ["Ashwini", "Anuradha", "Mrigashirsha", "Revati", "Hasta", "Pushya", "Shravana"];
      if (travelNaks.includes(naksName)) {
        score += 15;
        rulesMet.push(`Transit Nakshatra (${naksName}) is historically auspicious for travel and movement.`);
      }
      if (weekday === "Tuesday" || weekday === "Saturday") {
        score -= 8;
        rulesBroken.push("Travelling on Tuesday or Saturday is generally less advised in classical charts.");
      }
      break;

    case 'business':
      // Auspicious: Pushya, Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Chitra, Hasta
      const bizNaks = ["Pushya", "Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Chitra", "Hasta", "Revati"];
      if (bizNaks.includes(naksName)) {
        score += 15;
        rulesMet.push(`Nakshatra (${naksName}) supports commerce, business signings, and contract executions.`);
      }
      if ([1, 6, 8, 11, 15].includes(tithiNum)) {
        score += 10;
        rulesMet.push("Excellent lunar day (Tithi) alignment for growth and financial foundations.");
      }
      if (weekday === "Thursday" || weekday === "Friday" || weekday === "Wednesday") {
        score += 10;
        rulesMet.push(`Weekday (${weekday}) is governed by expansionary planets, assisting deals.`);
      }
      break;

    case 'wellness':
    case 'health':
      // Auspicious: Ashwini, Rohini, Punarvasu, Pushya, Hasta, Anuradha, Shravana
      const healthNaks = ["Ashwini", "Rohini", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana"];
      if (healthNaks.includes(naksName)) {
        score += 15;
        rulesMet.push(`Ruling stellar energies (${naksName}) assist physical healing and medical consults.`);
      }
      if (weekday === "Sunday" || weekday === "Thursday") {
        score += 10;
        rulesMet.push(`Medical checkups and starting therapies is highly favorable on ${weekday}.`);
      }
      break;

    default:
      // General planning
      if (weekday === "Thursday" || weekday === "Friday") {
        score += 8;
        rulesMet.push("Benefic weekday rulers assist natural flow of daily work.");
      }
      break;
  }

  // Cap score between 0 and 100
  score = Math.max(5, Math.min(98, score));

  let summary = "";
  if (score >= 80) {
    summary = "Highly Recommended! High favorable alignment guarantees smooth execution and positive returns.";
  } else if (score >= 60) {
    summary = "Moderately Favorable. Safe to proceed with standard care; utilize Abhijit Muhurat if starting major components.";
  } else {
    summary = "Caution advised. High potential for hurdles, friction, or unexpected delays. Minimize risk exposure.";
  }

  return {
    score,
    summary,
    rulesMet,
    rulesBroken
  };
}

/**
 * Generate fully comprehensive local advisory text without any external AI APIs
 */
function generatePersonalizedAdvice(userInfo, panchang) {
  const { name = "Seeker", birthNakshatra, birthRashi } = userInfo || {};

  const taraBala = calculateTaraBala(birthNakshatra, panchang.nakshatra?.name);
  const chandraBala = calculateChandraBala(birthRashi, panchang.moonSign || "Mesha"); // Fallback to Mesha if not parsed

  // Evaluate scores for 3 core domains
  const travelEval = evaluateActivityAuspiciousness('travel', panchang, taraBala, chandraBala);
  const bizEval = evaluateActivityAuspiciousness('business', panchang, taraBala, chandraBala);
  const healthEval = evaluateActivityAuspiciousness('wellness', panchang, taraBala, chandraBala);

  // Synthesize dynamic paragraph
  let introParagraph = `Dear **${name}**, based on precise Swiss Ephemeris calculations for **${panchang.city}** on **${panchang.date}**, `;
  if (birthNakshatra && birthRashi) {
    introParagraph += `we have aligned the celestial transits with your birth star (**${birthNakshatra}**) and Moon Sign (**${birthRashi}**). `;
  } else {
    introParagraph += `we have generated a general alignment report. To unlock personalized analysis, configure your Birth Star in your profile dashboard! `;
  }

  let calculationsSummary = `### 🌌 Daily Transit Coordinates:
*   **Lunar Day (Tithi):** **${panchang.tithi?.name || 'N/A'}** (${panchang.tithi?.endTime ? 'ends at ' + panchang.tithi.endTime : 'Full day'})
*   **Stellar Constellation (Nakshatra):** **${panchang.nakshatra?.name || 'N/A'}** (ruled by **${panchang.nakshatra?.lord || 'N/A'}**)
*   **Vara (Weekday):** **${panchang.vara}** (Day of the Moon/Sun transitions)
*   **Auspicious Hour (Abhijit):** **${panchang.abhijitMuhurat?.start} - ${panchang.abhijitMuhurat?.end}**
*   **Avoid Period (Rahu Kaal):** **${panchang.rahuKaal?.start} - ${panchang.rahuKaal?.end}**`;

  let personalInfluenceSection = "";
  if (birthNakshatra && birthRashi) {
    personalInfluenceSection = `### 👤 Personal Astrological Strengths (Tara & Chandra Bala):
1.  **Tara Bala (Constellation Strength):** **${taraBala.name}** — *${taraBala.description}* (Power Score: **${taraBala.score}%**)
2.  **Chandra Bala (Mental Focus Strength):** **Chandra in house ${chandraBala.house}** — *${chandraBala.description}* (Power Score: **${chandraBala.score}%**)`;
  }

  let finalAdvisoryText = `### 🔮 Executive Vedic Decision Advice:
*   **Travel and Journeys:** **${travelEval.summary}** (Score: **${travelEval.score}%**)
    ${travelEval.rulesMet.length > 0 ? '✓ ' + travelEval.rulesMet.join('\n    ✓ ') : ''}
    ${travelEval.rulesBroken.length > 0 ? '✗ ' + travelEval.rulesBroken.join('\n    ✗ ') : ''}

*   **Business dealings & Investments:** **${bizEval.summary}** (Score: **${bizEval.score}%**)
    ${bizEval.rulesMet.length > 0 ? '✓ ' + bizEval.rulesMet.join('\n    ✓ ') : ''}
    ${bizEval.rulesBroken.length > 0 ? '✗ ' + bizEval.rulesBroken.join('\n    ✗ ') : ''}

*   **Wellness and Therapies:** **${healthEval.summary}** (Score: **${healthEval.score}%**)
    ${healthEval.rulesMet.length > 0 ? '✓ ' + healthEval.rulesMet.join('\n    ✓ ') : ''}
    ${healthEval.rulesBroken.length > 0 ? '✗ ' + healthEval.rulesBroken.join('\n    ✗ ') : ''}

---
### 💡 Best Actionable Strategy for Today:
`;

  if (travelEval.score >= 70 && bizEval.score >= 70) {
    finalAdvisoryText += `This is a highly dynamic day! Plan important meetings or sign agreements between **${panchang.abhijitMuhurat?.start} and ${panchang.abhijitMuhurat?.end}** (Abhijit Muhurat) to maximize planetary success. Make sure to **avoid any major initiations between ${panchang.rahuKaal?.start} and ${panchang.rahuKaal?.end}** (Rahu Kaal) to block out minor losses.`;
  } else if (bizEval.score >= 70) {
    finalAdvisoryText += `Focus heavily on administrative, business, and study affairs today. It is a highly productive mental day, although physical travel can be deferred or carried out with cautious awareness. Avoid scheduling important calls in the **${panchang.rahuKaal?.start} - ${panchang.rahuKaal?.end}** window.`;
  } else {
    finalAdvisoryText += `Today is best suited for administrative routine work, internal audits, relaxation, and wellness routines. Do not rush into heavy financial expenditures or launch major public events. The celestial currents favor quiet, internal strengthening.`;
  }

  return {
    success: true,
    taraBala,
    chandraBala,
    evaluations: {
      travel: travelEval,
      business: bizEval,
      wellness: healthEval
    },
    formattedAdviceMarkdown: `${introParagraph}\n\n${calculationsSummary}\n\n${personalInfluenceSection ? personalInfluenceSection + '\n\n' : ''}${finalAdvisoryText}`
  };
}

module.exports = {
  calculateTaraBala,
  calculateChandraBala,
  evaluateActivityAuspiciousness,
  generatePersonalizedAdvice,
  NAKSHATRAS,
  RASHIS
};
