const nakshatraMeanings = require('../../knowledge/nakshatra.json');

const NAKSHATRA_MAP = {
  'Mrigashirsha': 'Mrigashira',
  'Shatataraka': 'Shatabhisha',
  'Poorva Phalguni': 'Purva Phalguni',
  'Poorva Ashadha': 'Purva Ashadha',
  'Poorva Bhadrapada': 'Purva Bhadrapada'
};

module.exports = {
  interpret: (nakshatra) => {
    const key = NAKSHATRA_MAP[nakshatra] || nakshatra;
    return nakshatraMeanings[key] || 'Nakshatra meaning not found.';
  }
};
