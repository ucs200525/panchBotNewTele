const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Environment variables
const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'https://tele-panch-backend.vercel.app';

// Helper function to format today's date (YYYY-MM-DD)
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// --- Image Generation & Mailing Helper ---
async function generateAndSend(bot, chatId, city, imageType) {
    const date = getTodayDate();
    let endpoint = '/api/combine-image';
    let params = { city, date, showNonBlue: true, is12HourFormat: true };

    if (imageType === 'Bhargava') {
        endpoint = '/api/getBharagvTable-image';
    } else if (imageType === 'Drik') {
        endpoint = '/api/getDrikTable-image';
        params = { city, date, goodTimingsOnly: true };
    }

    try {
        console.log(`[Cron] Generating ${imageType} for ${chatId} (${city})`);
        const response = await axios.post(`${API_URL}${endpoint}`, params, {
            responseType: 'arraybuffer'
        });

        await bot.sendPhoto(chatId, response.data, {
            caption: `🌅 Good Morning! Here is your daily ${imageType} Panchang.\n📍 City: ${city}\n📅 Date: ${date}`
        });

        console.log(`[Cron] Successfully sent ${imageType} to ${chatId}`);
    } catch (error) {
        console.error(`[Cron] Error for ${chatId} (${imageType}):`, error.message);
    }
}

// --- Main Cron Handler ---
module.exports = async (req, res) => {
    // Vercel Cron jobs use GET by default
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // (Optional) Verify Vercel Cron Secret for security
    // if (req.headers['x-vercel-cron'] !== 'true') {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    try {
        const bot = new TelegramBot(token);
        
        // 1. Get current time in HH:MM format (Asia/Kolkata timezone/IST)
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-GB', { 
            timeZone: 'Asia/Kolkata', 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        console.log(`[Cron] Triggered at ${currentTime} IST`);

        // 2. Fetch users from backend scheduled for 'now'
        // Your backend route GET /api/getScheduledUsers?time=HH:MM should return an array of users
        const response = await axios.get(`${API_URL}/api/getScheduledUsers?time=${currentTime}`);
        const users = response.data; // Expected: [{ chatId, city, imageTypes: [] }]

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(200).json({ message: 'No users scheduled for this minute.', time: currentTime });
        }

        console.log(`[Cron] Found ${users.length} users to notify.`);

        // 3. Process each user
        const tasks = [];
        for (const user of users) {
            const { chatId, city, imageTypes } = user;
            if (Array.isArray(imageTypes)) {
                for (const type of imageTypes) {
                    tasks.push(generateAndSend(bot, chatId, city, type));
                }
            }
        }

        await Promise.all(tasks);

        res.status(200).json({ 
            message: `Successfully processed ${users.length} users.`,
            processedCount: tasks.length
        });

    } catch (error) {
        console.error('[Cron] Execution Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
