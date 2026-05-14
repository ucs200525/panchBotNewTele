const planetMeanings = require('../../knowledge/planets.json');

module.exports = {
  interpret: (planet) => {
    return planetMeanings[planet] || 'Planet meaning not found.';
  }
};
