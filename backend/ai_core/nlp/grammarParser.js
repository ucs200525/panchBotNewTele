const splitter = require('./splitter');
const intentDetector = require('./intentDetector');
const entityExtractor = require('./entityExtractor');
const synonymMap = require('./synonymMap');

module.exports = {
  parse: (userQuery) => {
    const normalized = synonymMap.normalize(userQuery);
    const segments = splitter.split(normalized);
    const entities = entityExtractor.extract(normalized);
    
    const intents = segments.map(seg => ({
      segment: seg,
      intent: intentDetector.detectIntent(seg)
    }));

    return {
      originalQuery: userQuery,
      normalizedQuery: normalized,
      intents: intents,
      entities: entities
    };
  }
};
