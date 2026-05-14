/**
 * AI Core — Entity Engine v2.0
 * Extracts structured entities from normalized Vedic astrological queries.
 * Handles: times, dates, cities, planets, zodiac signs, nakshatras.
 */

// ── Time Patterns ────────────────────────────────────────────────────────────
const TIME_PATTERNS = [
  // "before 2pm", "after 5:30 AM", "before noon"
  { rx: /\b(before|after|around|by|until|from)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?|noon|midnight|morning|evening|afternoon|night)\b/gi, type: 'time_constraint' },
  // "5:30 PM", "14:00", "8 am", "10:30"
  { rx: /\b(\d{1,2}:\d{2}(?:\s*[ap]m)?|\d{1,2}\s*[ap]m)\b/gi, type: 'exact_time' },
  // "morning", "afternoon" etc.
  { rx: /\b(morning|afternoon|evening|night|noon|midnight)\b/gi, type: 'time_period' },
];

// ── Date Patterns ────────────────────────────────────────────────────────────
const DATE_PATTERNS = [
  { rx: /\btoday\b/gi, value: 'today' },
  { rx: /\btomorrow\b/gi, value: 'tomorrow' },
  { rx: /\byesterday\b/gi, value: 'yesterday' },
  // "12 Aug 2004", "Aug 12 2004", "12-08-2004", "2004-08-12"
  { rx: /\b(\d{1,2}(?:\s+|-)(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+|-)\d{2,4})\b/gi, type: 'natural_date' },
  { rx: /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:\s+|,)\d{2,4})\b/gi, type: 'natural_date' },
  { rx: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g, type: 'specific_date' },
  { rx: /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g, type: 'specific_date' },
  { rx: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, type: 'weekday' },
];

// ── Planet Names ─────────────────────────────────────────────────────────────
const PLANETS = ['sun', 'surya', 'moon', 'chandra', 'mars', 'mangal', 'mercury', 'budha', 'jupiter', 'guru', 'brihaspati', 'venus', 'shukra', 'saturn', 'shani', 'rahu', 'ketu'];
const PLANET_CANONICAL = {
  surya: 'Sun', chandra: 'Moon', mangal: 'Mars', budha: 'Mercury',
  guru: 'Jupiter', brihaspati: 'Jupiter', shukra: 'Venus', shani: 'Saturn',
};

// ── Zodiac Signs ─────────────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  'mesha', 'vrishabha', 'mithuna', 'karka', 'simha', 'kanya',
  'tula', 'vrishchika', 'dhanu', 'makara', 'kumbha', 'meena'
];

// ── Nakshatras ────────────────────────────────────────────────────────────────
const NAKSHATRAS = [
  'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashirsha', 'ardra',
  'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva phalguni', 'uttara phalguni',
  'hasta', 'chitra', 'swati', 'vishakha', 'anuradha', 'jyeshtha',
  'mula', 'purva ashadha', 'uttara ashadha', 'shravana', 'dhanishta',
  'shatabhisha', 'purva bhadrapada', 'uttara bhadrapada', 'revati'
];

// ── Common Indian Cities ──────────────────────────────────────────────────────
const CITIES = [
  'hyderabad', 'bangalore', 'bengaluru', 'mumbai', 'bombay', 'delhi', 'new delhi',
  'chennai', 'madras', 'kolkata', 'calcutta', 'pune', 'ahmedabad', 'jaipur',
  'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'visakhapatnam',
  'coimbatore', 'vadodara', 'kochi', 'cochin', 'guwahati', 'chandigarh',
  'patna', 'ranchi', 'bhubaneswar', 'varanasi', 'agra', 'amritsar',
  'thiruvananthapuram', 'mysuru', 'mysore'
];

/**
 * Extract all entities from a normalized query string
 * @param {string} query - Preprocessed, normalized text
 * @returns {object} - Extracted entities object
 */
function extractEntities(query) {
  const q = query.toLowerCase();
  const entities = {
    times: [],
    date: null,
    planets: [],
    zodiacSigns: [],
    nakshatras: [],
    city: null,
    rawConstraints: []
  };

  // ── Extract Times ─────────────────────────────────────────────────────────
  for (const pattern of TIME_PATTERNS) {
    const matches = [...q.matchAll(pattern.rx)];
    for (const m of matches) {
      entities.times.push({ raw: m[0], type: pattern.type, full: m[0] });
    }
  }

  // ── Extract Dates ──────────────────────────────────────────────────────────
  entities.dates = [];
  for (const dp of DATE_PATTERNS) {
    const matches = [...q.matchAll(dp.rx)];
    for (const m of matches) {
      entities.dates.push({ 
        raw: m[0], 
        value: dp.value || m[0],
        type: dp.type || 'relative'
      });
    }
  }
  if (entities.dates.length > 0) {
    // legacy support
    entities.date = entities.dates[0].value;
  }

  // ── Extract Planets ───────────────────────────────────────────────────────
  for (const planet of PLANETS) {
    if (new RegExp(`\\b${planet}\\b`).test(q)) {
      const canonical = PLANET_CANONICAL[planet] || (planet.charAt(0).toUpperCase() + planet.slice(1));
      if (!entities.planets.includes(canonical)) entities.planets.push(canonical);
    }
  }

  // ── Extract Zodiac Signs ──────────────────────────────────────────────────
  for (const sign of ZODIAC_SIGNS) {
    if (new RegExp(`\\b${sign}\\b`).test(q)) {
      const canonical = sign.charAt(0).toUpperCase() + sign.slice(1);
      if (!entities.zodiacSigns.includes(canonical)) entities.zodiacSigns.push(canonical);
    }
  }

  // ── Extract Nakshatras ────────────────────────────────────────────────────
  for (const nak of NAKSHATRAS) {
    if (new RegExp(`\\b${nak}\\b`).test(q)) {
      const canonical = nak.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (!entities.nakshatras.includes(canonical)) entities.nakshatras.push(canonical);
    }
  }

  // ── Extract City ──────────────────────────────────────────────────────────
  for (const city of CITIES) {
    if (new RegExp(`\\b${city}\\b`).test(q)) {
      entities.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  entities.is_providing_dob = /\b(born|dob|birth\s*date|birth\s*time)\b/i.test(q);
  entities.raw = query;

  return entities;
}

module.exports = { extractEntities };
