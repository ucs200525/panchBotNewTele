const mongoose = require('mongoose');

const BirthProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dob: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  city: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  nakshatra: { type: String },
  rashi: { type: String },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BirthProfile', BirthProfileSchema);
