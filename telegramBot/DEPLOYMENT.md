# Panchang Telegram Bot - Vercel Deployment Guide

This guide will help you deploy your Telegram bot to Vercel using webhooks.

## 🚀 Deployment Steps

### 1. Prepare Your Environment Variables

You need to set these environment variables in Vercel:

- `BOT_TOKEN` - Your Telegram bot token from @BotFather
- `API_URL` - Your backend API URL (e.g., https://your-backend.vercel.app)

### 2. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 3. Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (first time) or **Y** (if redeploying)
- What's your project's name? **panchang-telegram-bot** (or your preferred name)
- In which directory is your code located? **./**
- Want to override settings? **N**

### 4. Set Environment Variables in Vercel

After deployment, Vercel will give you a URL like: `https://your-app.vercel.app`

Set your environment variables:

```bash
vercel env add BOT_TOKEN
# Paste your bot token when prompted

vercel env add API_URL
# Enter your backend API URL when prompted (e.g., https://your-backend.vercel.app)
```

Or set them via the Vercel dashboard:
1. Go to your project settings
2. Click "Environment Variables"
3. Add `BOT_TOKEN` and `API_URL`

### 5. Redeploy After Setting Variables

```bash
vercel --prod
```

### 6. Set Up the Webhook

After deployment, you need to tell Telegram where to send updates.

Update your local `.env` file with:
```
WEBHOOK_URL=https://your-app.vercel.app/api/webhook
```

Then run:
```bash
npm run webhook:set
```

This will configure Telegram to send updates to your Vercel deployment.

### 7. Verify the Webhook

Check if the webhook is set correctly:

```bash
npm run webhook:info
```

You should see your webhook URL and it should say "pending_update_count: 0"

## 🔧 Useful Commands

- **Set webhook**: `npm run webhook:set`
- **Delete webhook**: `npm run webhook:delete`
- **Check webhook status**: `npm run webhook:info`

## 🔄 Switching Between Local and Production

### For Local Development (Polling Mode)

1. Delete the webhook:
   ```bash
   npm run webhook:delete
   ```

2. Run the bot locally:
   ```bash
   npm start
   ```

### For Production (Webhook Mode on Vercel)

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Set the webhook:
   ```bash
   npm run webhook:set
   ```

## ⚠️ Important Notes

1. **State Management**: The current implementation uses in-memory state, which will reset on cold starts. For production, consider using:
   - Redis (Upstash)
   - MongoDB
   - PostgreSQL
   - Any persistent storage

2. **You can't use both polling and webhooks** at the same time. Delete the webhook before running locally.

3. **Webhook Requirements**:
   - Must be HTTPS (Vercel provides this automatically)
   - Must respond within 60 seconds
   - Must return status 200

4. **Environment Variables**: Make sure all environment variables are set in Vercel dashboard for production deployment.

## 🐛 Troubleshooting

### Bot doesn't respond on Vercel

1. Check webhook status:
   ```bash
   npm run webhook:info
   ```

2. Check if there are pending updates or errors

3. Verify environment variables in Vercel dashboard

4. Check Vercel function logs:
   ```bash
   vercel logs
   ```

### Getting 404 error

This is normal! The root path `/` doesn't serve anything. The bot works via the webhook at `/api/webhook`. Just test it by sending a message to your bot on Telegram.

### Webhook not setting

1. Make sure your Vercel app is deployed
2. Verify the WEBHOOK_URL in `.env` is correct
3. Check your BOT_TOKEN is valid

## 📝 Testing

Send a message to your bot on Telegram:
- `/start` - Welcome message
- `/help` - List of commands
- `/combined` - Generate combined image
- `/drik` - Generate Drik table
- `/bhargav` - Generate Bhargav table

## 🔗 Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Vercel Documentation](https://vercel.com/docs)
- [Webhook Best Practices](https://core.telegram.org/bots/webhooks)
