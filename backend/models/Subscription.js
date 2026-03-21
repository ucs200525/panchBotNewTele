const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  imageTypes: {
    type: [String],
    default: ['Drik']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'subscriptions'
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
