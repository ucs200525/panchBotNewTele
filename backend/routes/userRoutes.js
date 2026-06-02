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

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      updatedAt: Date.now()
    };
    if (name) updateData.name = name;
    if (dob) updateData.dob = dob;
    if (time) updateData.time = time;
    if (city) updateData.city = city;
    if (lat !== undefined) updateData.lat = lat;
    if (lng !== undefined) updateData.lng = lng;
    if (nakshatra) updateData.nakshatra = nakshatra;
    if (rashi) updateData.rashi = rashi;

    // Auto-calculate nakshatra & rashi if complete birth details are present/merged
    const resolvedDob = dob || existingUser.dob;
    const resolvedTime = time || existingUser.time;
    const resolvedLat = lat !== undefined ? lat : existingUser.lat;
    const resolvedLng = lng !== undefined ? lng : existingUser.lng;

    if (resolvedDob && resolvedTime && resolvedLat !== undefined && resolvedLng !== undefined) {
      try {
        const swissAdapter = require('../ai_core/executor/swissAdapter');
        const birthPanchang = swissAdapter.computeBirthPanchang({
          dob: resolvedDob,
          time: resolvedTime,
          lat: parseFloat(resolvedLat),
          lng: parseFloat(resolvedLng)
        });
        if (birthPanchang) {
          const nakName = typeof birthPanchang.nakshatra === 'object' ? birthPanchang.nakshatra?.name : birthPanchang.nakshatra;
          if (nakName) updateData.nakshatra = nakName;
          
          const rashiName = typeof birthPanchang.rashi === 'object' ? birthPanchang.rashi?.name : birthPanchang.rashi;
          if (rashiName) updateData.rashi = rashiName;
        }
      } catch (swissErr) {
        logger.error({ message: 'Swiss calculation error in profile update', error: swissErr.message });
      }
    }

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

const BirthProfile = require('../models/BirthProfile');

/**
 * @route   GET /api/user/birth-profiles
 * @desc    Get all birth profiles of the logged in user
 */
router.get('/birth-profiles', auth, async (req, res) => {
  try {
    const profiles = await BirthProfile.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    logger.error({ message: 'Error fetching birth profiles', error: err.message });
    res.status(500).json({ error: 'Failed to fetch birth profiles' });
  }
});

/**
 * @route   POST /api/user/birth-profiles
 * @desc    Create/add a birth profile
 */
router.post('/birth-profiles', auth, async (req, res) => {
  try {
    const { name, dob, time, city, lat, lng } = req.body;
    if (!name || !dob || !time || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Please provide all details: name, dob, time, city, lat, lng' });
    }

    let nakshatra = '';
    let rashi = '';
    try {
      const swissAdapter = require('../ai_core/executor/swissAdapter');
      const birthPanchang = swissAdapter.computeBirthPanchang({
        dob,
        time,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
      if (birthPanchang) {
        nakshatra = typeof birthPanchang.nakshatra === 'object' ? birthPanchang.nakshatra?.name : birthPanchang.nakshatra;
        rashi = typeof birthPanchang.rashi === 'object' ? birthPanchang.rashi?.name : birthPanchang.rashi;
      }
    } catch (swissErr) {
      logger.error({ message: 'Swiss calculation error in birth profile creation', error: swissErr.message });
    }

    // If this is the first profile, make it primary/default
    const count = await BirthProfile.countDocuments({ userId: req.user.id });
    const isPrimary = count === 0;

    const newProfile = new BirthProfile({
      userId: req.user.id,
      name,
      dob,
      time,
      city,
      lat,
      lng,
      nakshatra: nakshatra || undefined,
      rashi: rashi || undefined,
      isPrimary
    });

    await newProfile.save();
    res.status(201).json({ success: true, profile: newProfile });
  } catch (err) {
    logger.error({ message: 'Error creating birth profile', error: err.message });
    res.status(500).json({ error: 'Failed to create birth profile' });
  }
});

/**
 * @route   PUT /api/user/birth-profiles/:id
 * @desc    Update a birth profile
 */
router.put('/birth-profiles/:id', auth, async (req, res) => {
  try {
    const { name, dob, time, city, lat, lng, isPrimary } = req.body;
    const profile = await BirthProfile.findOne({ _id: req.params.id, userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Birth profile not found' });
    }

    if (name) profile.name = name;
    if (dob) profile.dob = dob;
    if (time) profile.time = time;
    if (city) profile.city = city;
    if (lat !== undefined) profile.lat = lat;
    if (lng !== undefined) profile.lng = lng;

    if (isPrimary !== undefined) {
      profile.isPrimary = isPrimary;
      if (isPrimary) {
        // Mark all other profiles as non-primary
        await BirthProfile.updateMany({ userId: req.user.id, _id: { $ne: profile._id } }, { $set: { isPrimary: false } });
      }
    }

    if (dob || time || lat !== undefined || lng !== undefined) {
      try {
        const swissAdapter = require('../ai_core/executor/swissAdapter');
        const birthPanchang = swissAdapter.computeBirthPanchang({
          dob: dob || profile.dob,
          time: time || profile.time,
          lat: parseFloat(lat !== undefined ? lat : profile.lat),
          lng: parseFloat(lng !== undefined ? lng : profile.lng)
        });
        if (birthPanchang) {
          const nakName = typeof birthPanchang.nakshatra === 'object' ? birthPanchang.nakshatra?.name : birthPanchang.nakshatra;
          if (nakName) profile.nakshatra = nakName;
          const rashiName = typeof birthPanchang.rashi === 'object' ? birthPanchang.rashi?.name : birthPanchang.rashi;
          if (rashiName) profile.rashi = rashiName;
        }
      } catch (swissErr) {
        logger.error({ message: 'Swiss calculation error in birth profile update', error: swissErr.message });
      }
    }

    profile.updatedAt = Date.now();
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    logger.error({ message: 'Error updating birth profile', error: err.message });
    res.status(500).json({ error: 'Failed to update birth profile' });
  }
});

/**
 * @route   DELETE /api/user/birth-profiles/:id
 * @desc    Delete a birth profile
 */
router.delete('/birth-profiles/:id', auth, async (req, res) => {
  try {
    const profile = await BirthProfile.findOne({ _id: req.params.id, userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Birth profile not found' });
    }

    const wasPrimary = profile.isPrimary;
    await BirthProfile.deleteOne({ _id: profile._id });

    // If deleted profile was primary, set another one as primary
    if (wasPrimary) {
      const another = await BirthProfile.findOne({ userId: req.user.id });
      if (another) {
        another.isPrimary = true;
        await another.save();
      }
    }

    res.json({ success: true, message: 'Birth profile deleted successfully' });
  } catch (err) {
    logger.error({ message: 'Error deleting birth profile', error: err.message });
    res.status(500).json({ error: 'Failed to delete birth profile' });
  }
});

module.exports = router;
