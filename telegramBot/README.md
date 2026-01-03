# Panchang Telegram Bot

A Telegram bot that generates Panchang images for Hindu calendar calculations.

## Features

- **Combined Image**: Generates a combined Muhurat and Panchangam image
- **Drik Panchang Table**: Generates Drik Panchang Muhurat table image
- **Bhargav Panchangam Table**: Generates Bhargav Panchangam table image

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather

### 2. Install Dependencies

```bash
cd telegramBot
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `telegramBot` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your bot token:

```env
BOT_TOKEN=your_bot_token_here
API_URL=http://localhost:5000
```

### 4. Start the Backend Server

Make sure your backend server is running:

```bash
cd ../backend
npm start
```

### 5. Start the Bot

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## Usage

### Available Commands

- `/start` - Welcome message and command list
- `/combined` - Generate combined Muhurat & Panchangam image
- `/drik` - Generate Drik Panchang Muhurat table
- `/bhargav` - Generate Bhargav Panchangam table
- `/cancel` - Cancel current operation
- `/help` - Show help message

### Example Conversation

```
User: /combined
Bot: Please enter the city name:

User: Hyderabad
Bot: City: Hyderabad
     Enter date (YYYY-MM-DD) or press "Skip" for today:

User: Skip
Bot: Show good timings only?

User: Yes
Bot: Use 12-hour time format?

User: Yes
Bot: ⏳ Generating combined image...
Bot: [Sends image]
     ✅ Image generated successfully!
```

## Requirements

- Node.js 14 or higher
- Backend server running on http://localhost:5000 (or configured API_URL)
- Valid Telegram Bot Token

## Troubleshooting

### Bot not responding
- Check if the bot token is correct in `.env`
- Verify the backend server is running
- Check console for error messages

### Image generation fails
- Ensure the backend API is accessible
- Verify the city name is correct
- Check the date format (YYYY-MM-DD)

## License

ISC
