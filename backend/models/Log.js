const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
  },
  message: {
    type: mongoose.Schema.Types.Mixed, // Adapts to string or object messages
    required: true,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed, // For any additional metadata stored by winston
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { 
    collection: 'logs', // Explicitly targeting the 'logs' collection
    strict: false // Allow other fields if Winston adds them
});

module.exports = mongoose.model('Log', LogSchema);
