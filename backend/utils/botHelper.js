const logger = require('./logger');

const BOT_TOKEN = process.env.BOT_TOKEN;

/**
 * Sends a photo to a Telegram chat using native Fetch (Node 22+)
 * @param {string} chatId - Telegram chat ID
 * @param {Buffer} photoBuffer - Image buffer
 * @param {string} caption - Photo caption
 */
async function sendTelegramPhoto(chatId, photoBuffer, caption) {
    if (!BOT_TOKEN) {
        logger.error('BOT_TOKEN is not defined in environment variables');
        throw new Error('BOT_TOKEN missing');
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
        
        // Use global FormData and Blob (Native in Node 22+)
        const formData = new FormData();
        formData.append('chat_id', chatId);
        
        // Convert Buffer to Blob for native FormData
        const blob = new Blob([photoBuffer], { type: 'image/png' });
        formData.append('photo', blob, 'panchang.png');
        formData.append('caption', caption);

        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.ok) {
            logger.info({ message: 'Telegram photo sent successfully', chatId });
        } else {
            logger.error({ message: 'Telegram photo sending failed', error: data });
        }
    } catch (error) {
        logger.error({ message: 'Error sending Telegram photo', error: error.message });
        console.error(error);
    }
}

module.exports = {
    sendTelegramPhoto
};
