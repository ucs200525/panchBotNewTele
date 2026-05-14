module.exports = {
  formatText: (responses) => {
    return responses.join('\n\n');
  },
  formatHtml: (responses) => {
    return `<div class="ai-response">${responses.map(r => `<p>${r}</p>`).join('')}</div>`;
  },
  formatMarkdown: (responses) => {
    return responses.map(r => `> ${r}`).join('\n\n');
  }
};
