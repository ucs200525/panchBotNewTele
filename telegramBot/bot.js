require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Environment variables
const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'https://tele-panch-backend.vercel.app';

if (!token) {
    console.error('ERROR: BOT_TOKEN is not set');
    process.exit(1);
}

// Create bot instance for polling (Local Development)
const bot = new TelegramBot(token, { polling: true });

// In-memory state (resets on bot restart)
const userStates = {};

// Helper function to format today's date
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Set Bot Commands
const commands = [
    { command: 'gt', description: 'Today Timings (Bhargava)' },
    { command: 'dgt', description: 'Daily Timings (Drik)' },
    { command: 'cgt', description: 'Combined Timings' },
    { command: 'subscribe', description: 'Subscribe to Daily Live Updates' },
    { command: 'status', description: 'My Subscription Status' },
    { command: 'change_city', description: 'Change Subscription City' },
    { command: 'change_time', description: 'Change Notification Time' },
    { command: 'stop', description: 'Unsubscribe' },
    { command: 'help', description: 'Show All Commands' },
    { command: 'cancel', description: 'Cancel Current Action' }
];

bot.setMyCommands(commands).then(() => {
    console.log('✅ Bot commands set successfully!');
}).catch(err => {
    console.error('❌ Failed to set bot commands:', err.message);
});

// --- Image Generation Handlers ---

async function fetchAndSendImage(chatId, endpoint, params, caption) {
    bot.sendMessage(chatId, '⏳ Generating your Panchanagam image...', {
        reply_markup: { remove_keyboard: true }
    });

    try {
        console.log(`Calling backend: ${API_URL}${endpoint} with params:`, params);
        const response = await axios.post(`${API_URL}${endpoint}`, params, {
            responseType: 'arraybuffer'
        });

        await bot.sendPhoto(chatId, response.data, {
            caption: caption
        });

        bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /help to see more commands.');
    } catch (error) {
        console.error(`Error generating image from ${endpoint}:`, error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data.toString());
        }
        const errorMsg = 'Failed to generate image. Please check parameters and try again.';
        bot.sendMessage(chatId, `❌ Error: ${errorMsg}`);
    }
}

// --- Main Event Listeners ---

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    if (!text) return;

    // Command Handling
    if (text.startsWith('/')) {
        const commandText = text.split(' ')[0].split('@')[0].toLowerCase();
        
        if (commandText === '/start') {
            bot.sendMessage(chatId, '🙏 Welcome to Panchang Bot! 🙏\n\nUse /help to see all available commands.');
            return;
        }

        if (commandText === '/help') {
            const help = commands.map(c => `/${c.command} - ${c.description}`).join('\n');
            bot.sendMessage(chatId, `Available Commands:\n${help}`);
            return;
        }

        if (['/gt', '/dgt', '/cgt'].includes(commandText)) {
            userStates[chatId] = { command: commandText, step: 'city' };
            bot.sendMessage(chatId, '📍 Please enter the city name:');
            return;
        }

        if (commandText === '/subscribe') {
            userStates[chatId] = { command: '/subscribe', step: 'image_type' };
            bot.sendMessage(chatId, '🖼 What type of Panchangam image do you want to receive daily?', {
                reply_markup: {
                    keyboard: [['Bhargava', 'Drik', 'Combined']],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
            return;
        }

        if (commandText === '/status') {
            try {
                const response = await axios.get(`${API_URL}/api/status?chatId=${chatId}`);
                const { isSubscribed, city, time, imageType } = response.data;
                if (isSubscribed) {
                    const imgText = imageType ? `\n🖼 Format: ${imageType}` : '';
                    bot.sendMessage(chatId, `🔔 Subscription Status:\n\n✅ Subscribed\n📍 City: ${city}\n⏰ Time: ${time}${imgText}`);
                } else {
                    bot.sendMessage(chatId, '❌ Not subscribed. Use /subscribe to start.');
                }
            } catch (err) {
                bot.sendMessage(chatId, '❌ Could not retrieve status.');
            }
            return;
        }

        if (commandText === '/stop') {
            try {
                await axios.post(`${API_URL}/api/unsubscribe`, { chatId: chatId.toString() });
                bot.sendMessage(chatId, '🛑 Unsubscribed successfully.');
            } catch (err) {
                bot.sendMessage(chatId, '❌ Failed to unsubscribe.');
            }
            return;
        }

        if (commandText === '/cancel') {
            delete userStates[chatId];
            bot.sendMessage(chatId, 'Operation cancelled.', {
                reply_markup: { remove_keyboard: true }
            });
            return;
        }

        if (commandText === '/change_city') {
            userStates[chatId] = { command: '/change_city', step: 'new_city' };
            bot.sendMessage(chatId, 'Please enter the new city:');
            return;
        }

        if (commandText === '/change_time') {
            userStates[chatId] = { command: '/change_time', step: 'new_time' };
            bot.sendMessage(chatId, 'Please enter the notification time (HH:MM):');
            return;
        }
    }

    // State Processing
    const state = userStates[chatId];
    if (!state) return;

    try {
        // Step 0: Image Type (Subscription only)
        if (state.step === 'image_type') {
            state.imageType = text;
            state.step = 'city';
            bot.sendMessage(chatId, '📍 Please enter the city name:', {
                reply_markup: { remove_keyboard: true }
            });
            return;
        }

        // Step 1: City
        if (state.step === 'city') {
            state.city = text;
            if (state.command === '/subscribe') {
                state.step = 'time';
                bot.sendMessage(chatId, '⏰ Please enter notification time (HH:MM in 24h format):');
            } else {
                state.step = 'date';
                bot.sendMessage(chatId, `📅 City: ${state.city}\n\nEnter date (YYYY-MM-DD) or press "Skip" for Today's date:`, {
                    reply_markup: {
                        keyboard: [['Skip']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            }
            return;
        }

        // Step 2: Date (Image commands only)
        if (state.step === 'date') {
            if (text.toLowerCase() === 'skip') {
                state.date = getTodayDate();
            } else {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(text)) {
                    bot.sendMessage(chatId, '❌ Invalid format. Please use YYYY-MM-DD or "Skip":');
                    return;
                }
                state.date = text;
            }

            // Next step: Options (Auspicious only?)
            state.step = 'options';
            const question = state.command === '/dgt' ? 'Show Good Timings only?' : 'Show Auspicious (Non-Blue) periods only?';
            bot.sendMessage(chatId, question, {
                reply_markup: {
                    keyboard: [['Yes'], ['No']],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
            return;
        }

        // Step 3: Options (Image commands only)
        if (state.step === 'options') {
            state.isAuspiciousOnly = text.toLowerCase() === 'yes';

            if (state.command === '/dgt') {
                await fetchAndSendImage(chatId, '/api/getDrikTable-image', {
                    city: state.city,
                    date: state.date,
                    goodTimingsOnly: state.isAuspiciousOnly
                }, `Drik Panchang Table\n📍 ${state.city}\n📅 ${state.date}`);
                delete userStates[chatId];
            } else {
                state.step = 'time_format';
                bot.sendMessage(chatId, '🕰 Use 12-hour AM/PM format?', {
                    reply_markup: {
                        keyboard: [['Yes'], ['No']],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            }
            return;
        }

        // Step 4: Time Format (Image commands only)
        if (state.step === 'time_format') {
            state.is12HourFormat = text.toLowerCase() === 'yes';

            if (state.command === '/gt') {
                await fetchAndSendImage(chatId, '/api/getBharagvTable-image', {
                    city: state.city,
                    date: state.date,
                    showNonBlue: state.isAuspiciousOnly,
                    is12HourFormat: state.is12HourFormat
                }, `Bhargava Panchangam\n📍 ${state.city}\n📅 ${state.date}`);
            } else if (state.command === '/cgt') {
                await fetchAndSendImage(chatId, '/api/combine-image', {
                    city: state.city,
                    date: state.date,
                    showNonBlue: state.isAuspiciousOnly,
                    is12HourFormat: state.is12HourFormat
                }, `Combined Panchang\n📍 ${state.city}\n📅 ${state.date}`);
            }
            delete userStates[chatId];
            return;
        }

        // Step: Subscription Time
        if (state.step === 'time') {
            state.time = text;
            try {
                await axios.post(`${API_URL}/api/subscribe`, {
                    chatId: chatId.toString(),
                    city: state.city,
                    time: state.time,
                    imageType: state.imageType
                });
                bot.sendMessage(chatId, `✅ Subscribed for daily updates!\n📍 City: ${state.city}\n⏰ Time: ${state.time}\n🖼 Format: ${state.imageType}`);
            } catch (err) {
                bot.sendMessage(chatId, '❌ Subscription failed.');
            }
            delete userStates[chatId];
            return;
        }

        // Other steps (new_city, new_time)
        if (state.step === 'new_city') {
            try {
                await axios.post(`${API_URL}/api/change-city`, { chatId: chatId.toString(), city: text });
                bot.sendMessage(chatId, `✅ City updated to: ${text}`);
            } catch (err) {
                bot.sendMessage(chatId, '❌ Update failed.');
            }
            delete userStates[chatId];
            return;
        }

        if (state.step === 'new_time') {
            try {
                await axios.post(`${API_URL}/api/change-time`, { chatId: chatId.toString(), time: text });
                bot.sendMessage(chatId, `✅ Time updated to: ${text}`);
            } catch (err) {
                bot.sendMessage(chatId, '❌ Update failed.');
            }
            delete userStates[chatId];
            return;
        }

    } catch (error) {
        console.error('State handling error:', error);
        bot.sendMessage(chatId, '❌ An error occurred.');
        delete userStates[chatId];
    }
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('🤖 Telegram Bot (Polling Mode) is running correctly...');
console.log('Backend API URL:', API_URL);
