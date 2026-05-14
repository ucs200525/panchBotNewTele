const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String }, // YYYY-MM-DD
  time: { type: String }, // HH:mm
  city: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  nakshatra: { type: String },
  rashi: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema);
