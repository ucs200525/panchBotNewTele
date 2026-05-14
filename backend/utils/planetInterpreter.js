const PLANET_MEANINGS = {
  Sun: "The core identity, vitality, and leadership.",
  Moon: "The mind, emotions, and nurturing nature.",
  Mars: "Energy, courage, and action.",
  Mercury: "Communication, intellect, and commerce.",
  Jupiter: "Wisdom, expansion, and fortune.",
  Venus: "Love, beauty, and harmony.",
  Saturn: "Discipline, structure, and karma.",
  Rahu: "Innovation, desire, and obsession.",
  Ketu: "Detachment, spirituality, and past life influences."
};

function interpret(planetName) {
  const name = planetName.split(' ')[0]; // Handle "Sun (Surya)"
  return PLANET_MEANINGS[name] || "A significant cosmic influence.";
}

module.exports = { interpret };
