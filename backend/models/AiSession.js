const mongoose = require('mongoose');

const AiSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userProfile: {
    type: Object,
    default: {}
  },
  history: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-delete sessions older than 30 days
AiSessionSchema.index({ lastAccessed: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AiSession', AiSessionSchema);
