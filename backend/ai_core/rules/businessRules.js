module.exports = {
  evaluate: (context) => {
    let score = 0;
    const reasons = [];

    if (context.lagna?.rashi === 'Leo' || context.lagna?.rashi === 'Taurus') {
      score += 5;
      reasons.push('Fixed and authoritative signs are excellent for business foundation.');
    } else if (context.lagna?.rashi === 'Aries') {
      score += 3;
      reasons.push('Aries gives strong initiative for startups.');
    }

    // Additional rules can be added here
    return { score, reasons };
  }
};
