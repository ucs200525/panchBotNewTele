const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.ADMIN_SECRET || 'vedicSecretKey123';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, dob, time, city, lat, lng } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let nakshatra = '';
    let rashi = '';
    if (dob && time && lat !== undefined && lng !== undefined) {
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
        logger.error({ message: 'Swiss calculation error in registration', error: swissErr.message });
      }
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
      dob,
      time,
      city,
      lat,
      lng,
      nakshatra: nakshatra || undefined,
      rashi: rashi || undefined
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nakshatra: user.nakshatra,
        rashi: user.rashi,
        dob: user.dob,
        time: user.time,
        city: user.city
      }
    });
  } catch (err) {
    logger.error({ message: 'Register error', error: err.message });
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nakshatra: user.nakshatra,
        rashi: user.rashi,
        dob: user.dob,
        time: user.time,
        city: user.city
      }
    });
  } catch (err) {
    logger.error({ message: 'Login error', error: err.message });
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
