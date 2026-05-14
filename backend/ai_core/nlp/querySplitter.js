/**
 * AI Core — Query Splitter v2.0
 * Splits compound user queries into individual intent segments.
 * e.g., "What is my Lagna AND is today good for business?"
 *       → ["What is my Lagna", "is today good for business"]
 */

// Conjunctions and phrases that separate multi-intent queries
const SPLIT_TOKENS = [
  /\s+and\s+(?:also\s+)?/gi,
  /\s*,\s*(?:and\s+)?/gi,
  /\s+also\s+/gi,
  /\s+plus\s+/gi,
  /\s+as\s+well\s+as\s+/gi,
  /\s*;\s*/gi,
  /\s+additionally\s+/gi,
  /\s*\?\s+/gi,    // separate on question mark followed by space
];

// Minimum segment length to be considered valid (avoid empty fragments)
const MIN_SEGMENT_LENGTH = 5;

const TIME_KEYWORDS = ["today", "tomorrow", "yesterday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/**
 * Split a query into distinct intent segments
 * @param {string} normalizedQuery - Pre-processed query text
 * @returns {string[]} - Array of individual query segments
 */
function splitQuery(normalizedQuery) {
  if (!normalizedQuery || typeof normalizedQuery !== 'string') return [];

  // 1. CONJUNCTION-BASED DECOMPOSITION (Logical Split)
  let logicalSegments = [normalizedQuery];
  for (const splitter of SPLIT_TOKENS) {
    const newSegments = [];
    for (const seg of logicalSegments) {
      const parts = seg.split(splitter).map(s => s.trim()).filter(s => s.length >= MIN_SEGMENT_LENGTH);
      newSegments.push(...parts);
    }
    logicalSegments = newSegments;
  }

  // 2. TIME-BASED EXPANSION (Per Segment)
  let finalSegments = [];
  const timeRegex = new RegExp(`\\b(${TIME_KEYWORDS.join('|')})\\b`, 'gi');

  for (const seg of logicalSegments) {
    const detectedTimes = TIME_KEYWORDS.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(seg));
    
    if (detectedTimes.length > 1) {
      // This segment describes multiple times (e.g. "travel today and tomorrow")
      // Duplicate this specific segment for each time
      for (const t of detectedTimes) {
        let expanded = seg.replace(timeRegex, t);
        // Cleanup redundant "and today and today" etc.
        expanded = expanded.replace(new RegExp(`\\b${t}\\s+and\\s+${t}\\b`, 'gi'), t);
        expanded = expanded.replace(new RegExp(`\\b${t}\\s*,\\s*${t}\\b`, 'gi'), t);
        finalSegments.push(expanded);
      }
    } else {
      finalSegments.push(seg);
    }
  }

  // 3. REMOVE DUPLICATES
  const seen = new Set();
  const unique = [];
  for (const seg of finalSegments) {
    const key = seg.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(seg);
    }
  }

  return unique.length > 0 ? unique : [normalizedQuery];
}

module.exports = { splitQuery };
