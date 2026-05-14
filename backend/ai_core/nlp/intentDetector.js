const synonymMap = require('./synonymMap');

module.exports = {
  detectIntent: (querySegment) => {
    const lowerQuery = querySegment.toLowerCase();
    
    if (lowerQuery.includes('lagna') || lowerQuery.includes('ascendant') || lowerQuery.includes('rising')) {
      return 'COMPUTE_LAGNA';
    }
    if (lowerQuery.includes('nakshatra') || lowerQuery.includes('star')) {
      return 'COMPUTE_NAKSHATRA';
    }
    if (lowerQuery.includes('business') || lowerQuery.includes('startup') || lowerQuery.includes('company')) {
      return 'EVALUATE_BUSINESS';
    }
    if (lowerQuery.includes('travel') || lowerQuery.includes('journey') || lowerQuery.includes('trip')) {
      return 'EVALUATE_TRAVEL';
    }
    if (lowerQuery.includes('time') || lowerQuery.includes('muhurat') || lowerQuery.includes('auspicious')) {
      return 'FIND_BEST_TIME';
    }
    if (lowerQuery.includes('compare')) {
      return 'COMPARE_TIME';
    }
    
    return 'GENERAL_ASTROLOGY';
  }
};
