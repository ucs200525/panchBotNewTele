const lagnaInterpreter = require('../interpreter/lagnaInterpreter');
const nakshatraInterpreter = require('../interpreter/nakshatraInterpreter');
const planetInterpreter = require('../interpreter/planetInterpreter');
const templateEngine = require('./templateEngine');
const formatter = require('./formatter');

module.exports = {
  build: (plan, executionResults) => {
    const responses = [];

    for (const step of plan) {
      const intent = step.action;
      const data = {};

      if (intent === 'COMPUTE_LAGNA' && executionResults['LAGNA']) {
        data.lagna = executionResults['LAGNA'];
        data.lagnaInterpretation = lagnaInterpreter.interpret(data.lagna.name);
      } else if (intent === 'COMPUTE_NAKSHATRA' && executionResults['NAKSHATRA']) {
        data.nakshatra = executionResults['NAKSHATRA'];
        data.nakshatraInterpretation = nakshatraInterpreter.interpret(data.nakshatra.name);
      } else if (intent === 'EVALUATE_BUSINESS') {
        const evalResult = executionResults['BUSINESS_SCORE'] || { verdict: 'Unknown', score: 0, reasons: [] };
        data.verdict = evalResult.verdict || evalResult;
        data.score = evalResult.score || evalResult;
        data.reasons = evalResult.reasons || '';
      } else if (intent === 'EVALUATE_TRAVEL') {
        const evalResult = executionResults['TRAVEL_SCORE'] || { verdict: 'Unknown', score: 0, reasons: [] };
        data.verdict = evalResult.verdict || evalResult;
        data.score = evalResult.score || evalResult;
        data.reasons = evalResult.reasons || '';
      } else if (intent === 'FIND_BEST_TIME') {
        data.bestTime = executionResults['BEST_TIME'];
      } else {
        data.details = JSON.stringify(executionResults);
      }

      if (Object.keys(data).length > 0) {
        const template = templateEngine.getTemplate(intent);
        const filled = templateEngine.fill(template, data);
        responses.push(filled);
      }
    }

    return {
      text: formatter.formatText(responses),
      html: formatter.formatHtml(responses),
      markdown: formatter.formatMarkdown(responses)
    };
  }
};
