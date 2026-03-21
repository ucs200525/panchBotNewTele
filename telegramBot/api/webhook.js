const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Environment variables
const token = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL || 'https://tele-panch-backend.vercel.app';

// In-memory state (resets on cold starts)
const userStates = {};

// Helper function to format today's date
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// --- Image Generation Handlers ---

async function fetchAndSendImage(bot, chatId, endpoint, params, caption) {
    await bot.sendMessage(chatId, '⏳ Generating your Panchanagam image...', {
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

        await bot.sendMessage(chatId, '✅ Image generated successfully!\n\nUse /help to see more commands.');
    } catch (error) {
        console.error(`Error generating image from ${endpoint}:`, error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data.toString());
        }
        const errorMsg = 'Failed to generate image. Please check parameters and try again.';
        await bot.sendMessage(chatId, `❌ Error: ${errorMsg}`);
    }
}

// --- Main Message Handler ---

async function handleMessage(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    if (!text) return;

    // Command Handling
    if (text.startsWith('/')) {
        const commandText = text.split(' ')[0].split('@')[0].toLowerCase();
        
        if (commandText === '/start') {
            const welcome = `
🙏 Welcome to Panchang Bot! 🙏

Get daily auspicious timings and astrological reports.

📊 /cgt - Combined Timings
📅 /dgt - Daily Timings (Drik)
⏰ /gt - Today Timings (Bhargava)

🔔 /subscribe - Get daily updates
📈 /status - Check subscription
🛑 /stop - Unsubscribe

Use /help to see all commands.
            `.trim();
            await bot.sendMessage(chatId, welcome);
            delete userStates[chatId];
            return;
        }

        if (commandText === '/help') {
            const help = `
Available Commands:
/gt - Today Timings (Bhargava)
/dgt - Daily Timings (Drik)
/cgt - Combined Timings
/subscribe - Subscribe to Daily Live Updates
/status - My Subscription Status
/change_city - Change Subscription City
/change_time - Change Notification Time
/stop - Unsubscribe
/help - Show All Commands
/cancel - Cancel Current Action
            `.trim();
            await bot.sendMessage(chatId, help);
            delete userStates[chatId];
            return;
        }

        if (['/gt', '/dgt', '/cgt'].includes(commandText)) {
            userStates[chatId] = { command: commandText, step: 'city' };
            await bot.sendMessage(chatId, '📍 Please enter the city name:');
            return;
        }

        if (commandText === '/subscribe') {
            userStates[chatId] = { command: '/subscribe', step: 'image_type', selectedTypes: [] };
            await bot.sendMessage(chatId, '🖼 What type of Panchangam images do you want to receive daily? (Select all that apply, then press Done)', {
                reply_markup: {
                    keyboard: [['Bhargava', 'Drik'], ['Combined', 'Done ✅']],
                    one_time_keyboard: false,
                    resize_keyboard: true
                }
            });
            return;
        }


        if (commandText === '/status') {
            try {
                const response = await axios.get(`${API_URL}/api/status?chatId=${chatId}`);
                const { isSubscribed, city, time, imageTypes } = response.data;
                if (isSubscribed) {
                    const imgText = (imageTypes && imageTypes.length > 0) ? `\n🖼 Formats: ${imageTypes.join(', ')}` : '';
                    await bot.sendMessage(chatId, `🔔 Subscription Status:\n\n✅ Subscribed\n📍 City: ${city}\n⏰ Time: ${time}${imgText}`);
                } else {
                    await bot.sendMessage(chatId, '❌ Not subscribed. Use /subscribe to start.');
                }
            } catch (err) {
                await bot.sendMessage(chatId, '❌ Could not retrieve status.');
            }
            return;
        }

        if (commandText === '/stop') {
            try {
                await axios.post(`${API_URL}/api/unsubscribe`, { chatId: chatId.toString() });
                await bot.sendMessage(chatId, '🛑 Unsubscribed successfully.');
            } catch (err) {
                await bot.sendMessage(chatId, '❌ Failed to unsubscribe.');
            }
            return;
        }

        if (commandText === '/cancel') {
            delete userStates[chatId];
            await bot.sendMessage(chatId, 'Operation cancelled.', {
                reply_markup: { remove_keyboard: true }
            });
            return;
        }

        if (commandText === '/change_city') {
            userStates[chatId] = { command: '/change_city', step: 'new_city' };
            await bot.sendMessage(chatId, 'Please enter the new city:');
            return;
        }

        if (commandText === '/change_time') {
            userStates[chatId] = { command: '/change_time', step: 'new_time' };
            await bot.sendMessage(chatId, 'Please enter the notification time (HH:MM):');
            return;
        }
    }

    // State Processing
    const state = userStates[chatId];
    if (!state) return;

    try {
        // Step 0: Image Type (Subscription multiselect)
        if (state.step === 'image_type') {
            if (text === 'Done ✅') {
                if (state.selectedTypes.length === 0) {
                    await bot.sendMessage(chatId, '⚠️ Please select at least one type!');
                    return;
                }
                state.step = 'city';
                await bot.sendMessage(chatId, '📍 Please enter the city name:', {
                    reply_markup: { remove_keyboard: true }
                });
            } else {
                const typeMap = { 'Bhargava': 'Bhargava', 'Drik': 'Drik', 'Combined': 'Combined' };
                const selected = typeMap[text];
                if (selected) {
                    if (!state.selectedTypes.includes(selected)) {
                        state.selectedTypes.push(selected);
                        await bot.sendMessage(chatId, `✅ Added: ${selected}\nSelected: ${state.selectedTypes.join(', ')}`);
                    } else {
                        state.selectedTypes = state.selectedTypes.filter(t => t !== selected);
                        await bot.sendMessage(chatId, `❌ Removed: ${selected}\nSelected: ${state.selectedTypes.join(', ')}`);
                    }
                }
            }
            return;
        }

        // Step 1: City
        if (state.step === 'city') {
            state.city = text;
            if (state.command === '/subscribe') {
                state.step = 'time';
                await bot.sendMessage(chatId, '⏰ Please enter notification time (HH:MM in 24h format):');
            } else {
                state.step = 'date';
                await bot.sendMessage(chatId, `📅 City: ${state.city}\n\nEnter date (YYYY-MM-DD) or press "Skip" for Today's date:`, {
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
                    await bot.sendMessage(chatId, '❌ Invalid format. Please use YYYY-MM-DD or "Skip":');
                    return;
                }
                state.date = text;
            }

            // Next step: Options (Auspicious only?)
            state.step = 'options';
            const question = state.command === '/dgt' ? 'Show Good Timings only?' : 'Show Auspicious (Non-Blue) periods only?';
            await bot.sendMessage(chatId, question, {
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
                // Drik doesn't have 12h format option in current bot logic, let's just generate
                await fetchAndSendImage(bot, chatId, '/api/getDrikTable-image', {
                    city: state.city,
                    date: state.date,
                    goodTimingsOnly: state.isAuspiciousOnly
                }, `Drik Panchang Table\n📍 ${state.city}\n📅 ${state.date}`);
                delete userStates[chatId];
            } else {
                // Bhargava and Combined have 12h format option
                state.step = 'time_format';
                await bot.sendMessage(chatId, '🕰 Use 12-hour AM/PM format?', {
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
                await fetchAndSendImage(bot, chatId, '/api/getBharagvTable-image', {
                    city: state.city,
                    date: state.date,
                    showNonBlue: state.isAuspiciousOnly.toString(), // Backend expects string for some reason? Let's check.
                    is12HourFormat: state.is12HourFormat
                }, `Bhargava Panchangam\n📍 ${state.city}\n📅 ${state.date}`);
            } else if (state.command === '/cgt') {
                await fetchAndSendImage(bot, chatId, '/api/combine-image', {
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
                // 1. Save subscription
                await axios.post(`${API_URL}/api/subscribe`, {
                    chatId: chatId.toString(),
                    city: state.city,
                    time: state.time,
                    imageTypes: state.selectedTypes
                });

                await bot.sendMessage(chatId, `✅ Subscribed for daily updates!\n📍 City: ${state.city}\n⏰ Time: ${state.time}\n🖼 Images: ${state.selectedTypes.join(', ')}`);
                
                // 2. Send immediate preview images
                await bot.sendMessage(chatId, '🚀 Sending you today\'s preview images now...');
                const date = getTodayDate();
                
                for (const type of state.selectedTypes) {
                    if (type === 'Bhargava') {
                        await fetchAndSendImage(bot, chatId, '/api/getBharagvTable-image', {
                            city: state.city,
                            date: date,
                            showNonBlue: true,
                            is12HourFormat: true
                        }, `Bhargava Panchangam (Preview)\n📍 ${state.city}\n📅 ${date}`);
                    } else if (type === 'Drik') {
                        await fetchAndSendImage(bot, chatId, '/api/getDrikTable-image', {
                            city: state.city,
                            date: date,
                            goodTimingsOnly: true
                        }, `Drik Panchang Table (Preview)\n📍 ${state.city}\n📅 ${date}`);
                    } else if (type === 'Combined') {
                        await fetchAndSendImage(bot, chatId, '/api/combine-image', {
                            city: state.city,
                            date: date,
                            showNonBlue: true,
                            is12HourFormat: true
                        }, `Combined Panchang (Preview)\n📍 ${state.city}\n📅 ${date}`);
                    }
                }

            } catch (err) {
                console.error('Subscription error:', err.message);
                await bot.sendMessage(chatId, '❌ Subscription failed. Please try again or check backend connection.');
            }
            delete userStates[chatId];
            return;
        }

        // Step: New City / New Time
        if (state.step === 'new_city') {
            try {
                await axios.post(`${API_URL}/api/change-city`, { chatId: chatId.toString(), city: text });
                await bot.sendMessage(chatId, `✅ City updated to: ${text}`);
            } catch (err) {
                await bot.sendMessage(chatId, '❌ Update failed.');
            }
            delete userStates[chatId];
            return;
        }

        if (state.step === 'new_time') {
            try {
                await axios.post(`${API_URL}/api/change-time`, { chatId: chatId.toString(), time: text });
                await bot.sendMessage(chatId, `✅ Time updated to: ${text}`);
            } catch (err) {
                await bot.sendMessage(chatId, '❌ Update failed.');
            }
            delete userStates[chatId];
            return;
        }

    } catch (error) {
        console.error('State handling error:', error);
        await bot.sendMessage(chatId, '❌ An error occurred. Resetting state.');
        delete userStates[chatId];
    }
}

// Webhook Handler for Vercel
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('Panchang Bot is active.');
    }

    try {
        const bot = new TelegramBot(token);
        const { body } = req;

        if (body.message) {
            await handleMessage(bot, body.message);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(200).send('OK');
    }
};
