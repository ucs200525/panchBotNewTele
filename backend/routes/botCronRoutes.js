const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { createDrikTable, createBharagvTable, processMuhuratAndPanchangam, convertToDDMMYYYY } = require('./panchangRoutes');
const { renderAstrologyTable } = require('../utils/canvasRenderer');
const { sendTelegramPhoto } = require('../utils/botHelper');
const logger = require('../utils/logger');

/**
 * @route   GET /api/bot-cron
 * @desc    Triggered by Vercel every minute to send scheduled Telegram messages
 */
router.get('/bot-cron', async (req, res) => {
    // 1. Get current time in IST (Asia/Kolkata)
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Kolkata', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    logger.info({ message: 'Bot Cron executing', time: currentTime });

    try {
        // (Optional) Check for Vercel Cron header for security
        // if (req.headers['x-vercel-cron'] !== 'true') return res.status(401).send('Unauthorized');

        // 2. Fetch users scheduled for THIS specific minute
        const users = await Subscription.find({ time: currentTime }).lean();
        
        if (users.length === 0) {
            return res.json({ 
                success: true, 
                message: `No users scheduled for ${currentTime} IST`,
                time: currentTime 
            });
        }

        logger.info({ message: `Found ${users.length} users for scheduling`, time: currentTime });

        const date = now.toISOString().split('T')[0]; // Today's date YYYY-MM-DD
        const dateDDMMYYYY = convertToDDMMYYYY(date);
        
        const results = [];

        for (const user of users) {
             const { chatId, city, imageTypes } = user;
             const userTasks = [];
             
             // Default to Drik if no types selected
             const types = (imageTypes && imageTypes.length > 0) ? imageTypes : ['Drik'];
             
             for (const type of types) {
                  userTasks.push((async () => {
                      try {
                          let buffer, title;
                          
                          if (type === 'Bhargava') {
                              const table = await createBharagvTable(city, date, true, true); 
                              buffer = await renderAstrologyTable("Bhargava Panchangam", city, date, ["Start-End 1", "Weekday", "Start-End 2", "S.No"], table, 'bhargava');
                              title = `Bhargava Panchangam`;
                          } else if (type === 'Drik') {
                              const tableData = await createDrikTable(city, dateDDMMYYYY);
                              const finalData = tableData.filter(row => row.category === 'Good');
                              buffer = await renderAstrologyTable("Drik Panchang Muhuruts", city, date, ["Muhurat", "Category", "Time"], finalData);
                              title = `Drik Panchang Table`;
                          } else if (type === 'Combined') {
                              const fullMuhuratData = await createDrikTable(city, dateDDMMYYYY);
                              const muhuratData = fullMuhuratData.filter(row => row.category === 'Good');
                              const panchangamData = await createBharagvTable(city, date, true, true);
                              const finalData = processMuhuratAndPanchangam(muhuratData, panchangamData, new Date(date));
                              buffer = await renderAstrologyTable("Combined Muhurat & Panchanga", city, date, ["No.", "Type", "Description", "Time Interval", "Weekdays"], finalData, 'combined');
                              title = `Combined Panchang`;
                          }

                          if (buffer) {
                              await sendTelegramPhoto(chatId, buffer, `🌅 Good Morning! Here is your daily ${title}.\n📍 City: ${city}\n📅 Date: ${date}`);
                              return { chatId, type, status: 'sent' };
                          }
                          return { chatId, type, status: 'skipped', reason: 'no buffer' };
                      } catch (err) {
                          logger.error({ message: `Failed to send ${type} to ${chatId}`, error: err.message, stack: err.stack });
                          return { chatId, type, status: 'error', error: err.message };
                      }
                  })());
             }
             const userResults = await Promise.all(userTasks);
             results.push(...userResults);
        }

        res.json({ 
            success: true, 
            time: currentTime, 
            usersCount: users.length,
            processed: results 
        });

    } catch (error) {
        logger.error({ message: 'Bot Cron execution failed', error: error.message });
        res.status(500).json({ success: false, error: 'Internal cron error', details: error.message });
    }
});

module.exports = router;
