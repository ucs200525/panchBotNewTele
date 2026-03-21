# 🤖 Panchangam Telegram Bot

A premium Telegram bot that generates high-resolution astrological reports (Panchangam images) and provides daily live updates. This bot connects to the [Panchang Backend](https://tele-panch-backend.vercel.app/) for data and image rendering.

## 🚀 Commands

| Command | Description | Backend Route |
|---------|-------------|---------------|
| `/gt` | **Today Timings (Bhargava)** | `/api/getBharagvTable-image` |
| `/dgt` | **Daily Timings (Drik)** | `/api/getDrikTable-image` |
| `/cgt` | **Combined Timings** | `/api/combine-image` |
| `/subscribe` | Subscribe to Daily Live Updates | `/api/subscribe` |
| `/status` | My Subscription Status | `/api/status` |
| `/change_city` | Change Subscription City | `/api/change-city` |
| `/change_time` | Change Notification Time | `/api/change-time` |
| `/stop` | Unsubscribe | `/api/unsubscribe` |
| `/help` | Show All Commands | - |
| `/cancel` | Cancel Current Action | - |

## 🛠 Features

- **High-Resolution Images**: Generates 1080p effective width PNG images with premium styling.
- **Multiple Sources**: Supports Bhargava, Drik, and Combined astrological calculations.
- **Daily Subscriptions**: Automated daily delivery of panchangam images at your preferred time.
- **Multi-step Input**: Guided conversation flow to collect city and timing preferences.

## 🌐 Deployment on Vercel

The bot is designed to run as a serverless function on Vercel.

### Environment Variables

Required variables in Vercel settings:
- `BOT_TOKEN`: Your Telegram Bot Token from @BotFather.
- `API_URL`: The URL of your backend (default: `https://tele-panch-backend.vercel.app`).
- `WEBHOOK_URL`: Your Vercel app URL ending in `/api/webhook`.

### Quick Deploy

1. Deploy the code to Vercel:
   ```bash
   vercel --prod
   ```
2. Set the webhook:
   ```bash
   npm run webhook:set
   ```

## 💻 Local Development

1. Update `.env` with your `BOT_TOKEN`.
2. Delete the current webhook:
   ```bash
   npm run webhook:delete
   ```
3. Run the bot in polling mode:
   ```bash
   npm run dev
   ```

## ✅ Backend Compatibility

This bot expects the following endpoints to be available at `API_URL`:
- **POST** `/api/getBharagvTable-image`
- **POST** `/api/getDrikTable-image`
- **POST** `/api/combine-image`
- **POST** `/api/subscribe`
- **GET** `/api/status?chatId=...`
- **POST** `/api/unsubscribe`
- **POST** `/api/change-city`
- **POST** `/api/change-time`

---
*Created with ❤️ for premium astrological insights.*
