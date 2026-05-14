module.exports = {
  evaluate: (context) => {
    let score = 0;
    const reasons = [];

    if (context.panchang?.abhijit) {
      score += 3;
      reasons.push('Abhijit Muhurat is highly favorable for travel.');
    }
    if (context.panchang?.rahuKaal) {
      score -= 4;
      reasons.push('Rahu Kaal is malefic for starting a journey.');
    }

    return { score, reasons };
  }
};
