require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // e.g., https://your-app.vercel.app/api/webhook

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not found in .env file');
    process.exit(1);
}

if (!WEBHOOK_URL) {
    console.error('❌ WEBHOOK_URL not found in .env file');
    console.log('\nPlease add this to your .env file:');
    console.log('WEBHOOK_URL=https://your-vercel-app.vercel.app/api/webhook');
    process.exit(1);
}

async function setWebhook() {
    try {
        console.log('Setting up webhook...');
        console.log('Webhook URL:', WEBHOOK_URL);

        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
            {
                url: WEBHOOK_URL,
                allowed_updates: ['message']
            }
        );

        if (response.data.ok) {
            console.log('✅ Webhook set successfully!');
            console.log('Response:', response.data);
        } else {
            console.error('❌ Failed to set webhook');
            console.error('Response:', response.data);
        }
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function getWebhookInfo() {
    try {
        const response = await axios.get(
            `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
        );
        console.log('\n📊 Current webhook info:');
        console.log(JSON.stringify(response.data.result, null, 2));
    } catch (error) {
        console.error('❌ Error getting webhook info:', error.message);
    }
}

async function deleteWebhook() {
    try {
        console.log('Deleting webhook...');
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
        );

        if (response.data.ok) {
            console.log('✅ Webhook deleted successfully!');
        } else {
            console.error('❌ Failed to delete webhook');
        }
    } catch (error) {
        console.error('❌ Error deleting webhook:', error.message);
    }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'delete') {
    deleteWebhook().then(() => getWebhookInfo());
} else if (command === 'info') {
    getWebhookInfo();
} else {
    setWebhook().then(() => getWebhookInfo());
}
