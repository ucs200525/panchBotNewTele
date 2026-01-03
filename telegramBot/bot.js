require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Validate required environment variables
if (!process.env.BOT_TOKEN) {
    console.error('ERROR: BOT_TOKEN is not set in .env file');
    process.exit(1);
}

const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'http://localhost:4000';

// Create bot instance
const bot = new TelegramBot(token, { polling: true });

// Conversation state management
const userStates = {};

// Helper function to format today's date
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🙏 Welcome to Panchang Bot! 🙏

I can generate three types of Panchang images for you:

📊 /combined - Combined Muhurat & Panchangam Image
📅 /drik - Drik Panchang Muhurat Table
⏰ /bhargav - Bhargav Panchangam Table

Just select a command and I'll guide you through the process!
    `.trim();
    
    bot.sendMessage(chatId, welcomeMessage);
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `
Available Commands:
/combined - Generate combined image
/drik - Generate Drik table image
/bhargav - Generate Bhargav table image
/cancel - Cancel current operation
/help - Show this help message
    `.trim());
});

// Cancel command
bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    delete userStates[chatId];
    bot.sendMessage(chatId, 'Operation cancelled. You can start again with any command.');
});

// Combined Image Handler
bot.onText(/\/combined/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { type: 'combined', step: 'city' };
    bot.sendMessage(chatId, 'Please enter the city name:');
});

// Drik Table Image Handler
bot.onText(/\/drik/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { type: 'drik', step: 'city' };
    bot.sendMessage(chatId, 'Please enter the city name:');
});

// Bhargav Table Image Handler
bot.onText(/\/bhargav/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { type: 'bhargav', step: 'city' };
    bot.sendMessage(chatId, 'Please enter the city name:');
});

// Handle text messages (conversation flow)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (text && text.startsWith('/')) return;

    const state = userStates[chatId];
    if (!state) return;

    try {
        // City input
        if (state.step === 'city') {
            state.city = text.trim();
            state.step = 'date';
            bot.sendMessage(chatId, `City: ${state.city}\n\nEnter date (YYYY-MM-DD) or press "Skip" for today:`, {
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
                    bot.sendMessage(chatId, 'Invalid date format. Please use YYYY-MM-DD or press "Skip"');
                    return;
                }
                state.date = text.trim();
            }

            // Ask for options based on type
            if (state.type === 'combined') {
                state.step = 'options';
                bot.sendMessage(chatId, 'Show good timings only?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'drik') {
                state.step = 'options';
                bot.sendMessage(chatId, 'Show good timings only?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'bhargav') {
                state.step = 'options';
                bot.sendMessage(chatId, 'Show non-blue timings only?', {
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
                bot.sendMessage(chatId, 'Use 12-hour time format?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            } else if (state.type === 'drik') {
                state.goodTimingsOnly = answer === 'yes';
                await generateDrikImage(chatId, state);
            } else if (state.type === 'bhargav') {
                state.showNonBlue = answer === 'yes';
                state.step = 'time_format';
                bot.sendMessage(chatId, 'Use 12-hour time format?', {
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
                await generateCombinedImage(chatId, state);
            } else if (state.type === 'bhargav') {
                await generateBhargavImage(chatId, state);
            }
            return;
        }

    } catch (error) {
        console.error('Error handling message:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again.');
        delete userStates[chatId];
    }
});

// Generate Combined Image
async function generateCombinedImage(chatId, state) {
    const { city, date, showNonBlue, is12HourFormat } = state;
    
    bot.sendMessage(chatId, '⏳ Generating combined image...', {
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

        bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating combined image:', error.message);
        bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Generate Drik Table Image
async function generateDrikImage(chatId, state) {
    const { city, date, goodTimingsOnly } = state;
    
    bot.sendMessage(chatId, '⏳ Generating Drik Panchang image...', {
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

        bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating Drik image:', error.message);
        bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Generate Bhargav Table Image
async function generateBhargavImage(chatId, state) {
    const { city, date, showNonBlue, is12HourFormat } = state;
    
    bot.sendMessage(chatId, '⏳ Generating Bhargav Panchangam image...', {
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

        bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /combined, /drik, or /bhargav to generate another image.');
    } catch (error) {
        console.error('Error generating Bhargav image:', error.message);
        bot.sendMessage(chatId, `❌ Error: ${error.response?.data?.error || 'Failed to generate image. Please check the city name and try again.'}`);
    }

    delete userStates[chatId];
}

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('🤖 Panchang Telegram Bot is running...');
console.log('API URL:', API_URL);
