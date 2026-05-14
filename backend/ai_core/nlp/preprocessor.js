/**
 * AI Core — Preprocessor v1.0
 * Cleans, normalizes, and prepares raw user input for NLP processing.
 * Handles: lowercase, typos, extra spaces, Vedic-specific vocabulary normalization.
 */

// Common typo corrections for Vedic astrological terms
const TYPO_MAP = {
  'lagan': 'lagna',
  'lagana': 'lagna',
  'ascendent': 'ascendant',
  'asendant': 'ascendant',
  'nakashtra': 'nakshatra',
  'naksatra': 'nakshatra',
  'nakshatr': 'nakshatra',
  'muhurtha': 'muhurat',
  'muhurta': 'muhurat',
  'rahu kala': 'rahu kaal',
  'rahukaal': 'rahu kaal',
  'rahukala': 'rahu kaal',
  'buisness': 'business',
  'busines': 'business',
  'bisuness': 'business',
  'toady': 'today',
  'todya': 'today',
  'tommorow': 'tomorrow',
  'tommorrow': 'tomorrow',
  'tomorow': 'tomorrow',
  'travle': 'travel',
  'traval': 'travel',
  'journy': 'journey',
  'plannet': 'planet',
  'planat': 'planet',
  'jupitar': 'jupiter',
  'jupitere': 'jupiter',
  'satrun': 'saturn',
  'satern': 'saturn',
  'venis': 'venus',
  'merucry': 'mercury',
  'mercery': 'mercury',
};

// Vedic synonym normalization — map alternate phrasings to canonical terms
const VEDIC_SYNONYMS = {
  // Lagna / Ascendant
  'rising sign': 'lagna',
  'rising star': 'lagna',
  'birth sign': 'lagna',
  'ascendant sign': 'lagna',
  'ascending sign': 'lagna',
  'ascending': 'lagna ascendant',
  'first house': 'lagna',
  'udaya lagna': 'lagna',
  // Nakshatra
  'janma rashi': 'moon sign',
  'janma nakshatra': 'nakshatra',
  'birth star': 'nakshatra',
  'star of birth': 'nakshatra',
  'which star': 'nakshatra',
  'my star': 'nakshatra',
  'birth nakshatra': 'nakshatra',
  // Muhurat / Good Time
  'good time': 'muhurat',
  'auspicious time': 'muhurat',
  'lucky time': 'muhurat',
  'shubh muhurat': 'muhurat',
  'shubha muhurta': 'muhurat',
  'favorable time': 'muhurat',
  'best time': 'muhurat',
  // Travel
  'trip': 'travel',
  'journey': 'travel',
  'go out': 'travel',
  'go outside': 'travel',
  'going out': 'travel',
  // Business
  'startup': 'business',
  'company': 'business',
  'venture': 'business',
  'sign contract': 'business deal',
  'trading': 'business',
  'important work': 'business',
  // Study / Learning
  'study': 'studying muhurat',
  'learning': 'studying muhurat',
  'exam': 'studying muhurat',
  // Avoid
  'avoid': 'rahu kaal avoid',
  'what to avoid': 'rahu kaal avoid',
  // Planets
  'north node': 'rahu',
  'south node': 'ketu',
  'dragon head': 'rahu',
  'dragon tail': 'ketu',
  // Time variations
  'both days': 'today and tomorrow',
  'now and later': 'today and tomorrow',
  'this weekend': 'saturday and sunday',
  'weekend': 'saturday and sunday'
};

/**
 * Fix common Vedic term typos
 */
function correctTypos(text) {
  let corrected = text.toLowerCase();
  for (const [typo, fix] of Object.entries(TYPO_MAP)) {
    corrected = corrected.replace(new RegExp(`\\b${typo}\\b`, 'gi'), fix);
  }
  return corrected;
}

/**
 * Normalize Vedic synonyms to canonical vocabulary
 */
function normalizeSynonyms(text) {
  let normalized = text.toLowerCase();
  // Sort by length descending to match longer phrases first
  const sorted = Object.entries(VEDIC_SYNONYMS).sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, canonical] of sorted) {
    normalized = normalized.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), canonical);
  }
  return normalized;
}

/**
 * Strip special characters while preserving meaningful punctuation
 */
function cleanText(text) {
  return text
    .replace(/[""''`]/g, '') // smart quotes
    .replace(/[^\w\s:?.!,-]/g, ' ') // strip non-alphanumeric except punctuation
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .trim();
}

/**
 * Full preprocessing pipeline
 * Input: raw user string
 * Output: cleaned, normalized string ready for NLP
 */
function preprocess(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = rawText;
  text = cleanText(text);
  text = correctTypos(text);
  text = normalizeSynonyms(text);
  text = text.trim();
  return text;
}

module.exports = { preprocess, correctTypos, normalizeSynonyms, cleanText };
