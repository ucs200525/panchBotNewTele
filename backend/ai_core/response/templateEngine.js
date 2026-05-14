module.exports = {
  getTemplate: (intent) => {
    const templates = {
      'COMPUTE_LAGNA': 'Your Lagna (Ascendant) is **{{lagna.name}}** ({{lagna.degree}}°). \n\n{{lagnaInterpretation}}',
      'COMPUTE_NAKSHATRA': 'Your birth star is **{{nakshatra.name}}** (Pada {{nakshatra.pada}}). \n\n{{nakshatraInterpretation}}',
      'EVALUATE_BUSINESS': '💼 **Business Evaluation**: {{verdict}} \n\n**Score**: {{score}}/10 \n\n**Details**: {{reasons}}',
      'EVALUATE_TRAVEL': '🚗 **Travel Evaluation**: {{verdict}} \n\n**Score**: {{score}}/10 \n\n**Details**: {{reasons}}',
      'FIND_BEST_TIME': '⏱️ **Best Timings**: \n\n{{bestTime}}',
      'DEFAULT': 'Here are the details we computed: {{details}}'
    };
    return templates[intent] || templates['DEFAULT'];
  },
  fill: (template, data) => {
    let result = template;
    // Replace simple keys
    for (const key in data) {
      if (data.hasOwnProperty(key) && typeof data[key] !== 'object') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
        result = result.replace(regex, value || '');
      }
    }
    // Deep replace for lagna and nakshatra
    if (data.lagna) {
      result = result.replace(/{{lagna\.name}}/g, data.lagna.name || '');
      result = result.replace(/{{lagna\.degree}}/g, data.lagna.degree ? data.lagna.degree.toFixed(2) : '');
    }
    if (data.nakshatra) {
      result = result.replace(/{{nakshatra\.name}}/g, data.nakshatra.name || '');
      result = result.replace(/{{nakshatra\.pada}}/g, data.nakshatra.pada || '');
    }
    return result;
  }
};
