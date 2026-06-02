const mongoose = require('mongoose');

const SiteStatsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_stats' },
  totalVisits: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SiteStats', SiteStatsSchema);
