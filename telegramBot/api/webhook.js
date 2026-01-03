const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Environment variables
const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:4000';

// In-memory state (Note: This will reset on cold starts)
// For production, consider using a database like Redis
const userStates = {};

// Helper function to format today's date
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Generate Combined Image
async function generateCombinedImage(bot, chatId, state) {
    const { city, date, showNonBlue, is12HourFormat } = state;

    await bot.sendMessage(chatId, '⏳ Generating combined image...', {
        reply_markup: { remove_keyboard: true }
    });

    try {
        const response = await axios.post(`${API_URL}/api/combine-image`, {
            city,
            date,
            showNonBlue,
            is12HourFormat
        }, {
            responseType: 'arraybuffer'
        });

        await bot.sendPhoto(chatId, response.data, {
            caption: `Combined Panchang\n📍 ${city}\n📅 ${date}`
        });

        await bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating combined image:', error.message);
        await bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Generate Drik Table Image
async function generateDrikImage(bot, chatId, state) {
    const { city, date, goodTimingsOnly } = state;

    await bot.sendMessage(chatId, '⏳ Generating Drik Panchang image...', {
        reply_markup: { remove_keyboard: true }
    });

    try {
        const response = await axios.post(`${API_URL}/api/getDrikTable-image`, {
            city,
            date,
            goodTimingsOnly
        }, {
            responseType: 'arraybuffer'
        });

        await bot.sendPhoto(chatId, response.data, {
            caption: `Drik Panchang Table\n📍 ${city}\n📅 ${date}`
        });

        await bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating Drik image:', error.message);
        await bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Generate Bhargav Table Image
async function generateBhargavImage(bot, chatId, state) {
    const { city, date, showNonBlue, is12HourFormat } = state;

    await bot.sendMessage(chatId, '⏳ Generating Bhargav Panchangam image...', {
        reply_markup: { remove_keyboard: true }
    });

    try {
        const response = await axios.post(`${API_URL}/api/getBharagvTable-image`, {
            city,
            date,
            showNonBlue: showNonBlue.toString(),
            is12HourFormat
        }, {
            responseType: 'arraybuffer'
        });

        await bot.sendPhoto(chatId, response.data, {
            caption: `Bhargav Panchangam Table\n📍 ${city}\n📅 ${date}`
        });

        await bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating Bhargav image:', error.message);
        await bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Handle incoming messages
async function handleMessage(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle commands
    if (text === '/start') {
        const welcomeMessage = `
🙏 Welcome to Panchang Bot! 🙏

I can generate three types of Panchang images for you:

📊 /combined - Combined Muhurat & Panchangam Image
📅 /drik - Drik Panchang Muhurat Table
⏰ /bhargav - Bhargav Panchangam Table

Just select a command and I'll guide you through the process!
        `.trim();

        await bot.sendMessage(chatId, welcomeMessage);
        return;
    }

    if (text === '/help') {
        await bot.sendMessage(chatId, `
Available Commands:
/combined - Generate combined image
/drik - Generate Drik table image
/bhargav - Generate Bhargav table image
/cancel - Cancel current operation
/help - Show this help message
        `.trim());
        return;
    }

    if (text === '/cancel') {
        delete userStates[chatId];
        await bot.sendMessage(chatId, 'Operation cancelled. You can start again with any command.');
        return;
    }

    if (text === '/combined') {
        userStates[chatId] = { type: 'combined', step: 'city' };
        await bot.sendMessage(chatId, 'Please enter the city name:');
        return;
    }

    if (text === '/drik') {
        userStates[chatId] = { type: 'drik', step: 'city' };
        await bot.sendMessage(chatId, 'Please enter the city name:');
        return;
    }

    if (text === '/bhargav') {
        userStates[chatId] = { type: 'bhargav', step: 'city' };
        await bot.sendMessage(chatId, 'Please enter the city name:');
        return;
    }

    // Handle conversation flow
    const state = userStates[chatId];
    if (!state) return;

    try {
        // City input
        if (state.step === 'city') {
            state.city = text.trim();
            state.step = 'date';
            await bot.sendMessage(chatId, `City: ${state.city}\n\nEnter date (YYYY-MM-DD) or press "Skip" for today:`, {
                reply_markup: {
                    keyboard: [['Skip']],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
            return;
        }

        // Date input
        if (state.step === 'date') {
            if (text.toLowerCase() === 'skip') {
                state.date = getTodayDate();
            } else {
                // Validate date format
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(text)) {
                    await bot.sendMessage(chatId, 'Invalid date format. Please use YYYY-MM-DD or press "Skip"');
                    return;
                }
                state.date = text.trim();
            }

            // Ask for options based on type
            if (state.type === 'combined') {
                state.step = 'options';
                await bot.sendMessage(chatId, 'Show good timings only?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'drik') {
                state.step = 'options';
                await bot.sendMessage(chatId, 'Show good timings only?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'bhargav') {
                state.step = 'options';
                await bot.sendMessage(chatId, 'Show non-blue timings only?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            }
            return;
        }

        // Options input
        if (state.step === 'options') {
            const answer = text.toLowerCase();

            if (state.type === 'combined') {
                state.showNonBlue = answer === 'yes';
                state.step = 'time_format';
                await bot.sendMessage(chatId, 'Use 12-hour time format?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'drik') {
                state.goodTimingsOnly = answer === 'yes';
                await generateDrikImage(bot, chatId, state);
            } else if (state.type === 'bhargav') {
                state.showNonBlue = answer === 'yes';
                state.step = 'time_format';
                await bot.sendMessage(chatId, 'Use 12-hour time format?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            }
            return;
        }

        // Time format input
        if (state.step === 'time_format') {
            state.is12HourFormat = text.toLowerCase() === 'yes';

            if (state.type === 'combined') {
                await generateCombinedImage(bot, chatId, state);
            } else if (state.type === 'bhargav') {
                await generateBhargavImage(bot, chatId, state);
            }
            return;
        }

    } catch (error) {
        console.error('Error handling message:', error);
        await bot.sendMessage(chatId, 'An error occurred. Please try again.');
        delete userStates[chatId];
    }
}

// Main webhook handler
module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(200).send('Bot is running');
    }

    try {
        // Create bot instance (webhook mode - no polling)
        const bot = new TelegramBot(token);

        // Get the update from Telegram
        const { body } = req;

        if (body.message) {
            await handleMessage(bot, body.message);
        }

        // Respond to Telegram
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(200).send('OK'); // Always return 200 to Telegram
    }
};
