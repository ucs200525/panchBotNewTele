module.exports = {
  extract: (text) => {
    const entities = { dates: [], locations: [], topics: [] };
    // Basic extraction logic, could be expanded with NLP libraries
    if (text.match(/\b(today|tomorrow)\b/i)) {
      entities.dates.push(text.match(/\b(today|tomorrow)\b/i)[0].toLowerCase());
    }
    return entities;
  }
};
