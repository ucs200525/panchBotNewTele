# 📊 Production Logging & Admin Panel Guide

This project now uses a **dual-logging strategy**:
1. **Console Logs**: For Vercel real-time monitoring.
2. **MongoDB Logs**: For persistent storage and historical analysis (Enabled via `MONGO_URI`).

## 🚀 Setup Instructions

### 1. Database Connection
You must provide a MongoDB connection string to persist logs.
Add this to your `.env` file in `backend/`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/panchang_logs?retryWrites=true&w=majority
ADMIN_SECRET=mySecurePassword123
```

- If `MONGO_URI` is missing, the app will log to Console only (safe fallback).
- `ADMIN_SECRET` protects the Admin Panel. Default is `admin123` if not set.

### 2. Admin Panel
Access the hidden logging panel at:
**`/admin`** (e.g. `http://localhost:3000/admin`)

- **Login**: Enter the `ADMIN_SECRET`.
- **View**: Real-time table of all logs (Info, Warn, Error).
- **Metadata**: Click details to see full JSON payloads (request bodies, detailed error stacks).

## 🛠️ Implementation Details

- **`utils/db.js`**: Handle MongoDB connection.
- **`utils/logger.js`**: Configures Winston to use `winston-mongodb` transport.
- **`routes/adminRoutes.js`**: Secure API endpoint (`/admin/logs`) to fetch logs.
- **`frontend/src/pages/AdminLogs.js`**: React interface for viewing logs.

## 🔍 Troubleshooting

- **"No logs found"**: Check if `MONGO_URI` is correct and the database is accessible from your network/Vercel.
- **"Unauthorized"**: Ensure `x-admin-secret` header matches `ADMIN_SECRET` (handled automatically by frontend login).
