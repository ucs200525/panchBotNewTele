const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * @route   POST /api/subscribe
 * @desc    Create or Update a user subscription
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { chatId, city, time, imageType } = req.body;

    if (!chatId || !city || !time) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId, city, and time are required' 
      });
    }

    // Upsert subscription (update if exists, create if not)
    const subscription = await Subscription.findOneAndUpdate(
      { chatId },
      { city, time, imageType: imageType || 'Drik' },
      { new: true, upsert: true }
    );

    logger.info({ 
      message: 'Subscription updated', 
      chatId, 
      city, 
      time, 
      imageType: subscription.imageType 
    });

    res.json({
      success: true,
      message: 'Subscription successful',
      data: subscription
    });

  } catch (error) {
    logger.error({ 
      message: 'POST /api/subscribe error', 
      error: error.message 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/unsubscribe
 * @desc    Remove a user subscription
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId is required' 
      });
    }

    const result = await Subscription.findOneAndDelete({ chatId });

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    logger.info({ message: 'Subscription removed', chatId });

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    logger.error({ 
      message: 'POST /api/unsubscribe error', 
      error: error.message 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/status
 * @desc    Check a user's subscription status
 */
router.get('/status', async (req, res) => {
  try {
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId is required' 
      });
    }

    const subscription = await Subscription.findOne({ chatId }).lean();

    if (!subscription) {
      return res.json({
        success: true,
        isSubscribed: false,
        message: 'No active subscription found for this user'
      });
    }

    res.json({
      success: true,
      isSubscribed: true,
      data: subscription
    });

  } catch (error) {
    logger.error({ 
      message: 'GET /api/status error', 
      error: error.message 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * @route   POST /api/change-city
 * @desc    Update only the city for an existing subscription
 */
router.post('/change-city', async (req, res) => {
  try {
    const { chatId, city } = req.body;

    if (!chatId || !city) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId and city are required' 
      });
    }

    const updated = await Subscription.findOneAndUpdate(
      { chatId },
      { city },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found. Please subscribe first.' 
      });
    }

    logger.info({ message: 'City changed', chatId, newCity: city });

    res.json({
      success: true,
      message: 'City updated successfully',
      data: updated
    });

  } catch (error) {
    logger.error({ 
      message: 'POST /api/change-city error', 
      error: error.message 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * @route   POST /api/change-time
 * @desc    Update only the time for an existing subscription
 */
router.post('/change-time', async (req, res) => {
  try {
    const { chatId, time } = req.body;

    if (!chatId || !time) {
      return res.status(400).json({ 
        success: false, 
        error: 'chatId and time are required' 
      });
    }

    const updated = await Subscription.findOneAndUpdate(
      { chatId },
      { time },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found. Please subscribe first.' 
      });
    }

    logger.info({ message: 'Time changed', chatId, newTime: time });

    res.json({
      success: true,
      message: 'Alert time updated successfully',
      data: updated
    });

  } catch (error) {
    logger.error({ 
      message: 'POST /api/change-time error', 
      error: error.message 
    });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions (useful for the bot's cron job)
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.find().lean();
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    logger.error({ message: 'GET /api/subscriptions error', error: error.message });
    res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
  }
});

module.exports = router;
