const travelRules = require('./travelRules');
const businessRules = require('./businessRules');
const lifeRules = require('./lifeRules');

module.exports = {
  calculateScore: (domain, context) => {
    let evaluation;
    switch (domain) {
      case 'TRAVEL':
        evaluation = travelRules.evaluate(context);
        break;
      case 'BUSINESS':
        evaluation = businessRules.evaluate(context);
        break;
      case 'LIFE':
        evaluation = lifeRules.evaluate(context);
        break;
      default:
        evaluation = { score: 0, reasons: [] };
    }

    let verdict = 'Neutral';
    if (evaluation.score > 3) verdict = 'Highly Auspicious';
    else if (evaluation.score > 0) verdict = 'Good';
    else if (evaluation.score < -2) verdict = 'Avoid';
    else if (evaluation.score < 0) verdict = 'Challenging';

    return { ...evaluation, verdict };
  }
};
