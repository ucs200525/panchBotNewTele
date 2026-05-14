module.exports = {
  synonyms: {
    'ascendant': 'lagna',
    'rising sign': 'lagna',
    'star': 'nakshatra',
    'birth star': 'nakshatra',
    'auspicious time': 'muhurat',
    'good time': 'muhurat',
    'trip': 'travel',
    'journey': 'travel',
    'startup': 'business',
    'company': 'business'
  },
  normalize: (text) => {
    let normalized = text.toLowerCase();
    for (const [key, value] of Object.entries(module.exports.synonyms)) {
      normalized = normalized.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
    }
    return normalized;
  }
};
