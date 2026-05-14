const { NAKSHATRAS } = require('../ai_astrologer/astrology/nakshatra');

function interpret(nakName) {
  const nak = NAKSHATRAS.find(n => n.name.toLowerCase() === nakName.toLowerCase());
  if (!nak) return "A unique celestial energy pattern.";
  
  return `**Nature:** ${nak.quality}\n**Ruling Planet:** ${nak.lord}\n**Deity:** ${nak.deity}\n**Auspicious for:** ${nak.activity}`;
}

module.exports = { interpret };
