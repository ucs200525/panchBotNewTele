module.exports = {
  evaluate: (context) => {
    let score = 0;
    const reasons = [];

    if (context.moonSign === context.lagna?.rashi) {
      score += 4;
      reasons.push('Moon in Lagna gives mental clarity and emotional strength.');
    }

    return { score, reasons };
  }
};
