/**
 * AI Core — Intent Engine v2.0
 * Hybrid: High-confidence Regex patterns with weighted scoring.
 * Designed to gracefully call Python microservice when available (Phase 2).
 * Falls back to regex scoring if Python is offline.
 */

// Intent definitions with regex patterns and confidence weights
const INTENT_PATTERNS = [
  {
    intent: 'GET_LAGNA',
    patterns: [
      { rx: /\b(lagna|ascendant|rising\s*sign|rising\s*star|udaya\s*lagna)\b/i, weight: 0.9 },
      { rx: /\b(what\s+is\s+my\s+(lagna|ascendant|rising))\b/i, weight: 1.0 },
      { rx: /\b(tell\s+me\s+my\s+(lagna|ascendant|sign))\b/i, weight: 0.95 },
      { rx: /\b(which\s+sign\s+rises|which\s+rashi\s+is\s+my\s+ascendant)\b/i, weight: 0.95 },
    ]
  },
  {
    intent: 'GET_NAKSHATRA',
    patterns: [
      { rx: /\b(nakshatra|birth\s*star|janma\s*nakshatra|my\s+star|star\s+at\s+my\s+birth)\b/i, weight: 0.9 },
      { rx: /\b(which\s+star\s+was\s+i\s+born\s+in)\b/i, weight: 1.0 },
      { rx: /\b(what\s+is\s+my\s+(star|nakshatra|birth\s+star))\b/i, weight: 1.0 },
      { rx: /\b(tell\s+me\s+my\s+nakshatra)\b/i, weight: 0.95 },
      { rx: /\b(can\s+you\s+tell\s+my\s+(nakshatra|birth\s+star|star))\b/i, weight: 0.95 },
    ]
  },
  {
    intent: 'GET_TODAY_NAKSHATRA',
    patterns: [
      { rx: /\b(which|what)\s+(star|nakshatra)\s+is\s+(active|running|current)\s*(today|now|right\s*now)?\b/i, weight: 1.0 },
      { rx: /\b(current|today'?s?|today\s+)\s*(star|nakshatra|moon\s+star)\b/i, weight: 0.95 },
      { rx: /\b(tell\s+me\s+)(current|today'?s?)\s+(nakshatra|star)\b/i, weight: 0.95 },
      { rx: /\b(which\s+nakshatra\s+is\s+running)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'EVAL_GENERAL_DAY',
    patterns: [
      { rx: /\b(is\s+today\s+good|is\s+it\s+good\s+today|today\s+good|how\s+is\s+today\s+for\s+me)\b/i, weight: 1.0 },
      { rx: /\b(favorable|unfavorable|auspicious|day\s+good)\b/i, weight: 0.9 },
      { rx: /\b(is\s+today\s+good\s+for\s+(studying|study|learning|reading))\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'COMPARE_NAKSHATRA',
    patterns: [
      { rx: /\b(compare\s+my\s+nakshatra|compare\s+my\s+star)\b/i, weight: 1.0 },
      { rx: /\b(compatibility\s+with\s+today)\b/i, weight: 0.9 },
    ]
  },
  {
    intent: 'GET_HISTORY',
    patterns: [
      { rx: /\b(what\s+(did|have)\s+we\s+discuss(ed)?|what\s+was\s+discussed|our\s+discussion|summarize\s+history|what\s+did\s+i\s+ask|what\s+did\s+you\s+say)\b/i, weight: 1.0 },
      { rx: /\b(what\s+we\s+discussed\s+upto\s+now|what\s+have\s+we\s+discussed)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'EVAL_BUSINESS',
    patterns: [
      { rx: /\b(business|startup|company|work|office|deal|investment|trade|profit|finance)\b/i, weight: 0.7 },
      { rx: /\b(is\s+today\s+good\s+for\s+business)\b/i, weight: 1.0 },
      { rx: /\b(best\s+time\s+for\s+business)\b/i, weight: 0.95 },
      { rx: /\b(business\s+muhurat|muhurat\s+for\s+business)\b/i, weight: 1.0 },
      { rx: /\b(should\s+i\s+(sign|start|launch|open)\s+(deal|company|startup))\b/i, weight: 0.9 },
      { rx: /\b(find\s+best\s+time\s+for\s+business)\b/i, weight: 0.95 },
    ]
  },
  {
    intent: 'EVAL_TRAVEL',
    patterns: [
      { rx: /\b(travel|journey|trip|drive|fly|going\s+out|leave\s+home|depart)\b/i, weight: 0.75 },
      { rx: /\b(can\s+i\s+travel|is\s+it\s+safe\s+to\s+travel)\b/i, weight: 1.0 },
      { rx: /\b(best\s+time\s+(to|for)\s+travel)\b/i, weight: 0.95 },
      { rx: /\b(when\s+can\s+i\s+(go|leave|go\s+outside))\b/i, weight: 0.9 },
      { rx: /\b(travel\s+muhurat|good\s+time\s+for\s+journey)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'FIND_BEST_TIME',
    patterns: [
      { rx: /\b(best\s+time|auspicious\s+time|muhurat|shubh\s+muhurat|good\s+time|lucky\s+time)\b/i, weight: 0.8 },
      { rx: /\b(when\s+is\s+the\s+best\s+time)\b/i, weight: 1.0 },
      { rx: /\b(find\s+(me\s+)?(a\s+)?good\s+(time|slot|muhurat))\b/i, weight: 0.95 },
      { rx: /\b(abhijit|brahma\s*muhurat|pancha\s*rahita)\b/i, weight: 0.9 },
      { rx: /\b(what\s+is\s+(the\s+)?best\s+muhurat)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'GET_PLANET_INFO',
    patterns: [
      { rx: /\b(where\s+is\s+(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu))\b/i, weight: 1.0 },
      { rx: /\b((sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)\s+(transit|position|today|in\s+which\s+sign))\b/i, weight: 0.9 },
      { rx: /\b(planet\s+position|planetary\s+state)\b/i, weight: 0.85 },
    ]
  },
  {
    intent: 'GET_PANCHANG',
    patterns: [
      { rx: /\b(panchang|panchangam|tithi|vara|karana|yoga|today's\s+panchang)\b/i, weight: 0.85 },
      { rx: /\b(what\s+is\s+today'?s?\s+(tithi|nakshatra|yoga))\b/i, weight: 1.0 },
      { rx: /\b(which\s+tithi\s+is\s+running|what\s+is\s+the\s+tithi|lunar\s+day)\b/i, weight: 1.0 },
      { rx: /\b(rahu\s*kaal|gulika|yamaganda|abhijit)\b/i, weight: 0.9 },
      { rx: /\b(tell\s+me\s+(about\s+)?rahu\s*kaal)\b/i, weight: 1.0 },
      { rx: /\b(what\s+is\s+rahu\s*kaal)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'SUMMARY_ENGINE',
    patterns: [
      { rx: /\b(tell\s+me\s+(everything|all)\s+important(\s+about)?\s+today)\b/i, weight: 1.0 },
      { rx: /\b(summarize\s+today|today's\s+summary|quick\s+summary|summary\s+of\s+today|daily\s+summary)\b/i, weight: 1.0 },
      { rx: /\b(what('s|is)\s+important\s+today)\b/i, weight: 1.0 },
      { rx: /\b(today's\s+overview|overview\s+of\s+the\s+day)\b/i, weight: 0.95 },
      { rx: /\b(\bsummary\b.*\btoday\b|\btoday\b.*\bsummary\b)\b/i, weight: 0.9 },
      { rx: /\b(summary|overview)\b/i, weight: 0.7 },
    ]
  },
  {
    intent: 'GET_BIRTH_CHART',
    patterns: [
      { rx: /\b(birth\s+chart|kundali|horoscope|natal\s+chart|janma\s*kundali)\b/i, weight: 0.9 },
      { rx: /\b(show\s+(me\s+)?(my\s+)?(birth\s+chart|kundali|horoscope))\b/i, weight: 1.0 },
      { rx: /\b(calculate\s+(my\s+)?horoscope)\b/i, weight: 0.95 },
    ]
  },
  {
    intent: 'UPDATE_PROFILE',
    patterns: [
      { rx: /\b(my\s+(dob|birth\s*date|born\s*on|birth\s*details|time\s*of\s*birth|birth\s*place))\b/i, weight: 1.0 },
      { rx: /\b(i\s+was\s+born\s+on)\b/i, weight: 1.0 },
      { rx: /\b(save\s+my\s+details)\b/i, weight: 0.9 },
    ]
  },
  {
    intent: 'GREETING',
    patterns: [
      { rx: /\b(hi|hello|hey|namaste|greeting|greetings|good\s+morning|good\s+afternoon|good\s+evening|pranam|yo|sup|hola)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'FAREWELL',
    patterns: [
      { rx: /\b(bye|goodbye|tata|see\s+you|gn|goodnight|exit|quit|stop)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'ACKNOWLEDGE',
    patterns: [
      { rx: /\b(ok|okay|k|fine|sure|got\s+it|understood|yes|yep|yeah|correct)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'CHAT_STATUS',
    patterns: [
      { rx: /\b(discussing|talking|status|current\s+context|active\s+profile|who\s+is\s+this\s+for)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'HELP',
    patterns: [
      { rx: /\b(help|what\s+next|what\s+to\s+do|what\s+can\s+i\s+do|how\s+to\s+use|features|capabilities|commands|guide)\b/i, weight: 1.0 },
      { rx: /\b(what\s+can\s+you\s+do|tell\s+me\s+your\s+features)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'FUTURE_PREDICTION',
    patterns: [
      { rx: /\b(future|prediction|what\s+will\s+happen|tell\s+my\s+future|forecast|upcoming)\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'PERSONAL_GREETING',
    patterns: [
      { rx: /\b(hi|hello|hey)\s+(cutie|darling|dear|beauty|bot|ai|friend)\b/i, weight: 1.0 },
      { rx: /\b(how\s+are\s+you|hows\s+it\s+going|you\s+good)\b/i, weight: 0.9 },
      { rx: /\b(hi|hello|hey)\s+🕉️\b/i, weight: 1.0 },
    ]
  },
  {
    intent: 'SELF_QUERY',
    patterns: [
      { rx: /\b(who\s+am\s+i|how\s+am\s+i|what\s+about\s+me|tell\s+me\s+about\s+myself|my\s+nature|my\s+character|my\s+personality)\b/i, weight: 1.0 },
      { rx: /\b(what\s+me|tell\s+how\s+are\s+am\s+i)\b/i, weight: 1.0 },
    ]
  }
];

/**
 * Classify a query segment and return all matching high-confidence intents.
 * This solves the "Extreme Query Failure" by not short-circuiting.
 */
function classifyQuery(querySegment) {
  const q = querySegment.toLowerCase().trim();
  const matchedIntents = [];

  // Special Case: "star" alone refers to today's nakshatra
  const qTerm = q.replace(/[?]/g, '').trim();
  if (qTerm === 'star') {
    return [{ intent: 'GET_TODAY_NAKSHATRA', confidence: 1.0, isNatal: false }];
  }

  // Detect Natal Context modifier (per segment)
  const isNatal = /\b(my|birth|born|natal|janma|mine)\b/i.test(q);

  for (const intentDef of INTENT_PATTERNS) {
    let maxScore = 0;
    for (const pattern of intentDef.patterns) {
      if (pattern.rx.test(q)) {
        maxScore = Math.max(maxScore, pattern.weight);
      }
    }
    // If it's a solid match, include it
    if (maxScore >= 0.7) {
      matchedIntents.push({ 
        intent: intentDef.intent, 
        confidence: maxScore,
        isNatal: isNatal 
      });
    }
  }

  if (matchedIntents.length === 0) {
    return [{ intent: 'GENERAL_ASTROLOGY', confidence: 0.1, isNatal: false }];
  }

  // Sort by confidence
  return matchedIntents.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { classifyQuery, INTENT_PATTERNS };
