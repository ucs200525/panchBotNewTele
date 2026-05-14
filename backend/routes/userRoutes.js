const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   GET /api/user/profile
 * @desc    Get the logged in user's profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    logger.error({ message: 'Error fetching user profile', error: err.message });
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @route   POST /api/user/profile
 * @desc    Update the logged in user's profile
 */
router.post('/profile', auth, async (req, res) => {
  try {
    const { name, dob, time, city, lat, lng, nakshatra, rashi } = req.body;

    const updateData = {
      updatedAt: Date.now()
    };
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (time) updateData.time = time;
    if (city) updateData.city = city;
    if (lat) updateData.lat = lat;
    if (lng) updateData.lng = lng;
    if (nakshatra) updateData.nakshatra = nakshatra;
    if (rashi) updateData.rashi = rashi;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ success: true, profile: user });
  } catch (err) {
    logger.error({ message: 'Error updating user profile', error: err.message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
