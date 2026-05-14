module.exports = {
  split: (text) => {
    // Simple regex to split by 'and', commas, 'also', etc.
    return text.split(/\s+and\s+|,|\s+also\s+/i).map(s => s.trim()).filter(s => s.length > 0);
  }
};
