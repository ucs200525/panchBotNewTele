/**
 * Objective 1: Advanced Muhurat Evaluator
 * Part of the ai_astrologer modular engine
 * Computes, scores, and rates all daily time slots
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// Load dynamic rule values
let rules = {
  weights: {
    isAbhijit: 25,
    isAmritKaal: 35,
    isRahu: -50,
    isGulika: -15,
    isYamaGanda: -25,
    sadhanaTara: 20,
    chandraAshtama: -40
  },
  thresholds: {
    good: 30,
    neutral: 0,
    bad: -15
  }
};

try {
  const rulesPath = path.join(__dirname, 'rules.json');
  if (fs.existsSync(rulesPath)) {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  }
} catch (err) {
  logger.error('Error loading Muhurat rules.json, falling back to default values.', err);
}

/**
 * Converts a time string (e.g. "09:30 AM" or "14:15") to minutes since midnight
 */
function timeToMin(timeStr) {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const parts = clean.split(':');
  if (parts.length < 2) return null;

  let hour = parseInt(parts[0]);
  let minute = parseInt(parts[1].split(' ')[0]);
  let isPM = clean.includes('PM');
  let isAM = clean.includes('AM');

  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return hour * 60 + minute;
}

/**
 * Formats minutes since midnight into a standard 12-hour AM/PM string
 */
function minToTimeStr(minutes) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Scores an individual time interval based on transit factors and birth alignments
 */
function scoreInterval(startMin, endMin, dailyPoints, birthDetails) {
  let score = 0;
  let explanations = [];

  // Check overlap with Abhijit Muhurat
  if (dailyPoints.abhijit) {
    if (startMin >= dailyPoints.abhijit.start && endMin <= dailyPoints.abhijit.end) {
      score += rules.weights.isAbhijit;
      explanations.push("☀️ Overlaps with Abhijit Muhurat (highly protective).");
    }
  }

  // Check overlap with Rahu Kaal
  if (dailyPoints.rahu) {
    if (!(endMin <= dailyPoints.rahu.start || startMin >= dailyPoints.rahu.end)) {
      score += rules.weights.isRahu;
      explanations.push("💀 Overlaps with Rahu Kaal (major toxic obstruction).");
    }
  }

  // Check overlap with Gulika Kalam
  if (dailyPoints.gulika) {
    if (!(endMin <= dailyPoints.gulika.start || startMin >= dailyPoints.gulika.end)) {
      score += rules.weights.isGulika;
      explanations.push("⏳ Overlaps with Gulika period (causes delays).");
    }
  }

  // Add birth-specific alignments if provided
  if (birthDetails) {
    if (birthDetails.taraBalaRating === 'Good' || birthDetails.taraBalaRating === 'Excellent') {
      score += rules.weights.sadhanaTara;
      explanations.push("🌌 Personal Tara Bala is highly supportive today.");
    }
    if (birthDetails.chandraBalaRating === 'Bad') {
      score += rules.weights.chandraAshtama;
      explanations.push("🧠 Personal Chandra Bala is restricted today (rest suggested).");
    }
  }

  // Determine qualitative rating
  let rating = "Moderate";
  if (score >= rules.thresholds.good) {
    rating = "Good";
  } else if (score <= rules.thresholds.bad) {
    rating = "Avoid";
  }

  return {
    score,
    rating,
    reasons: explanations
  };
}

/**
 * Aggregates all daily transits into a structured list of Muhurat periods
 */
function compileDailyMuhuratTimeline(panchangData, swissMuhurats, bhargavaTable, birthDetails) {
  const dailyPoints = {
    abhijit: panchangData.abhijitMuhurat ? {
      start: timeToMin(panchangData.abhijitMuhurat.start),
      end: timeToMin(panchangData.abhijitMuhurat.end)
    } : null,
    rahu: panchangData.rahuKaal ? {
      start: timeToMin(panchangData.rahuKaal.start),
      end: timeToMin(panchangData.rahuKaal.end)
    } : null,
    gulika: panchangData.gulikaKalam ? {
      start: timeToMin(panchangData.gulikaKalam.start),
      end: timeToMin(panchangData.gulikaKalam.end)
    } : null
  };

  const timeline = [];

  // 1. Process all calculated Swiss Muhurats
  if (Array.isArray(swissMuhurats)) {
    swissMuhurats.forEach(m => {
      const sMin = timeToMin(m.start);
      const eMin = timeToMin(m.end);
      if (sMin === null || eMin === null) return;

      const evaluation = scoreInterval(sMin, eMin, dailyPoints, birthDetails);
      timeline.push({
        interval: `${m.start} to ${m.end}`,
        startMin: sMin,
        endMin: eMin,
        source: 'Swiss Ephemeris',
        name: m.muhurat,
        category: m.category,
        score: evaluation.score,
        rating: evaluation.rating,
        reasons: [
          `Custom Swiss transit: ${m.muhurat} (${m.category})`,
          ...evaluation.reasons
        ]
      });
    });
  }

  // 2. Fallback / Augment with Bhargava intervals if Swiss Muhurats are empty
  if (timeline.length === 0 && Array.isArray(bhargavaTable)) {
    bhargavaTable.forEach(row => {
      const processRowInterval = (intervalStr, colName) => {
        if (!intervalStr) return;
        const [startRaw, endRaw] = intervalStr.split(" to ");
        const sMin = timeToMin(startRaw);
        const eMin = timeToMin(endRaw);

        if (sMin !== null && eMin !== null) {
          const evaluation = scoreInterval(sMin, eMin, dailyPoints, birthDetails);
          timeline.push({
            interval: intervalStr,
            startMin: sMin,
            endMin: eMin,
            source: 'Bhargava Panchangam',
            name: `${colName} Interval`,
            category: 'Standard Row',
            score: evaluation.score,
            rating: evaluation.rating,
            reasons: [
              `Daily Bhargava line interval`,
              ...evaluation.reasons
            ]
          });
        }
      };

      processRowInterval(row.timeInterval1, "Column 1");
      processRowInterval(row.timeInterval2, "Column 2");
    });
  }

  // Sort timeline sequentially
  timeline.sort((a, b) => a.startMin - b.startMin);

  return {
    success: true,
    totalCount: timeline.length,
    timeline
  };
}

module.exports = {
  scoreInterval,
  compileDailyMuhuratTimeline,
  timeToMin,
  minToTimeStr
};
