# 🚀 Quick Deployment Guide

## Step-by-Step Instructions

### 1️⃣ First-Time Setup

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

### 2️⃣ Deploy to Vercel

Run this command in the `telegramBot` directory:

```bash
vercel
```

When prompted:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (first time)
- **What's your project's name?** → `panch-bot-tele` (or your choice)
- **In which directory is your code located?** → `./`
- **Want to modify settings?** → `N`

Vercel will give you a URL like: `https://panch-bot-tele.vercel.app`

### 3️⃣ Set Environment Variables

**Option A: Via Command Line**
```bash
vercel env add BOT_TOKEN
# Paste your bot token from @BotFather

vercel env add API_URL
# Enter your backend URL (e.g., https://your-backend-url.com)
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `BOT_TOKEN` = Your bot token
   - `API_URL` = Your backend URL

### 4️⃣ Deploy to Production

```bash
vercel --prod
```

### 5️⃣ Configure Webhook

1. **Update your local `.env` file** with your Vercel URL:
   ```
   WEBHOOK_URL=https://panch-bot-tele.vercel.app/api/webhook
   ```

2. **Set the webhook**:
   ```bash
   npm run webhook:set
   ```

3. **Verify it worked**:
   ```bash
   npm run webhook:info
   ```

   You should see output like:
   ```json
   {
     "url": "https://panch-bot-tele.vercel.app/api/webhook",
     "has_custom_certificate": false,
     "pending_update_count": 0
   }
   ```

### 6️⃣ Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/start`
4. The bot should respond!

---

## ✅ Success Checklist

- [ ] Vercel deployment successful
- [ ] Environment variables set (BOT_TOKEN, API_URL)
- [ ] Webhook configured
- [ ] Bot responds in Telegram
- [ ] Root URL (https://panch-bot-tele.vercel.app) shows landing page

---

## 🔧 Troubleshooting

### Bot doesn't respond

1. Check webhook status:
   ```bash
   npm run webhook:info
   ```

2. Check Vercel logs:
   ```bash
   vercel logs
   ```

3. Verify environment variables in Vercel dashboard

### 404 Error on root page

This is **SOLVED** - you now have a landing page at the root URL!

### Need to update code?

```bash
git add .
git commit -m "Update bot"
vercel --prod
```

---

## 🔄 Switching Modes

### Run Locally (Development)

1. Delete webhook:
   ```bash
   npm run webhook:delete
   ```

2. Run bot:
   ```bash
   npm start
   ```

### Back to Production

1. Deploy:
   ```bash
   vercel --prod
   ```

2. Set webhook:
   ```bash
   npm run webhook:set
   ```

---

## 📞 Need Help?

Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) file for more information.
