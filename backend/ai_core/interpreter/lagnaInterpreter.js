const lagnaMeanings = require('../../knowledge/lagna.json');

const RASHI_MAP = {
  'Mesha': 'Aries',
  'Vrishabha': 'Taurus',
  'Mithuna': 'Gemini',
  'Karka': 'Cancer',
  'Simha': 'Leo',
  'Kanya': 'Virgo',
  'Tula': 'Libra',
  'Vrishchika': 'Scorpio',
  'Dhanu': 'Sagittarius',
  'Makara': 'Capricorn',
  'Kumbha': 'Aquarius',
  'Meena': 'Pisces'
};

module.exports = {
  interpret: (rashiName) => {
    const englishName = RASHI_MAP[rashiName] || rashiName;
    return lagnaMeanings[englishName] || 'Meaning not available for this Lagna.';
  }
};
