const dependencyResolver = require('./dependencyResolver');

module.exports = {
  createPlan: (parsedQuery) => {
    const { intents, entities } = parsedQuery;
    
    const executionPlan = dependencyResolver.resolve(intents);
    
    return {
      plan: executionPlan,
      context: entities
    };
  }
};
