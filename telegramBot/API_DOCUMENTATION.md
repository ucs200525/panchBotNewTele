# API Integration Table

| Route | Method | Body / Query Parameters | Expected Success Response |
| :--- | :--- | :--- | :--- |
| `/api/subscribe` | **POST** | `{ "chatId": "string", "city": "string", "time": "string (HH:MM)", "imageTypes": ["Bhargava", "Drik", "Combined"] }` | `200 OK` (User is saved to database) |
| `/api/status` | **GET** | `?chatId=string` | `{ "isSubscribed": boolean, "city": "string", "time": "string", "imageTypes": ["string"] }` |
| `/api/unsubscribe` | **POST** | `{ "chatId": "string" }` | `200 OK` (User is removed from database) |
| `/api/change-city` | **POST** | `{ "chatId": "string", "city": "string" }` | `200 OK` (City updated in database) |
| `/api/change-time` | **POST** | `{ "chatId": "string", "time": "string (HH:MM)" }` | `200 OK` (Time updated in database) |
| `/api/getScheduledUsers`| **GET** | `?time=string (HH:MM)` | `[{ "chatId": "string", "city": "string", "imageTypes": ["Bhargava", "Drik", "Combined"] }]` |

### Backend Summary
Your backend at `https://tele-panch-backend.vercel.app` should implement these endpoints to handle the bot's requests. The bot expects a `200` status code for success and handles any error by informing the user.
