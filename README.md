# 🕉️ Panchangam & Vedic Copilot (PanchBotNewTele)

A high-precision Vedic astrology platform featuring a hybrid AI reasoning engine, professional image generation, and comprehensive Panchangam data.

## 🚀 Project Overview

This repository contains the complete source code for a modern Vedic Astrology application. It combines traditional astronomical calculations (using Swiss Ephemeris) with state-of-the-art AI capabilities to provide personalized astrological guidance.

### Key Features
- **Hybrid AI Astrologer**: Features a highly advanced Deterministic Hybrid NLP/NLG Engine. Uses strict intent classification, entity extraction (Regex + spaCy), and context-aware session management to provide scalable, highly accurate conversational astrology.
- **High-Precision Panchangam**: Accurate calculations for Tithi, Nakshatra, Yoga, Karana, and more using `swisseph`.
- **Muhurat & Auspicious Timings**: Advanced filtering for Choghadiya, Hora, and Swiss-precision Rahita Muhurats.
- **Dynamic Chart Rendering**: Professional South Indian style birth charts rendered as PNG/SVG.
- **Image Generation API**: Dedicated routes for generating high-resolution reports for sharing.
- **Analytics Dashboard**: Comprehensive tracking of API usage and user engagement.

---

## 📂 Directory Structure

```text
panchBotNewTele/
├── 📁 backend/                # Node.js/Express Server
│   ├── 📁 ai_astrologer/      # Advanced AI Reasoning Engine & Router
│   ├── 📁 ai_core/            # Core NLP, NLG, and Executor Pipelines
│   ├── 📁 astrology_engines/  # Specialized calculation logic
│   ├── 📁 routes/             # API Endpoints (Panchang, Dasha, Lagna, etc.)
│   ├── 📁 utils/              # Core helpers (Interpreters, DB, OpenRouter)
│   ├── 📁 data/               # Static astrological data
│   ├── 📁 middleware/         # Auth & Analytics logic
│   ├── 📄 server.js           # Backend Entry Point
│   └── 📄 vercel.json         # Backend Deployment Config
├── 📁 frontend/               # React SPA
│   ├── 📁 src/
│   │   ├── 📁 pages/          # 40+ specialized Astro & Panchang screens
│   │   ├── 📁 components/     # Modular UI elements
│   │   ├── 📁 context/        # State management (User/Astro data)
│   │   ├── 📁 utils/          # API Service layers
│   │   └── 📄 App.js          # Routing & Main Layout
│   └── 📄 package.json        # Frontend dependencies
├── 📄 PROJECT_ARCHITECTURE.md # Deep-dive into system design
├── 📄 ADVANCED_AI.md          # Comprehensive breakdown of the Hybrid AI Engine
├── 📄 AI_IMPLEMENTATION_PLAN.md # Roadmap for AI features
├── 📄 vercel.json             # Root monorepo deployment config
└── 📄 README.md               # This file
```

---

## 🛠️ Technology Stack

### Backend
- **Core**: Node.js, Express
- **Astronomy**: `swisseph` (Swiss Ephemeris Node bindings)
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: Hybrid Regex + Python spaCy NLP Pipeline / OpenRouter API
- **Rendering**: `canvas` / `skia-canvas` for chart & report generation
- **Logging**: Winston with Daily Rotate File

### Frontend
- **Framework**: React 18
- **Routing**: React Router 6
- **Styling**: Vanilla CSS with CSS Modules for scoped styles
- **Visualization**: HTML2Canvas for client-side exports

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v22.x
- MongoDB Instance
- OpenRouter API Key (for LLM extensions)
- Python 3.8+ (for advanced spaCy NLP features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd panchBotNewTele
   ```

2. **Setup Backend & Python Engine**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Configure your variables
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

---

## 📄 Documentation

For more detailed information, please refer to:
- [Advanced AI Architecture](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/ADVANCED_AI.md) - **Start Here for AI Core modifications**
- [Project Architecture](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/PROJECT_ARCHITECTURE.md)
- [AI Implementation Plan](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/AI_IMPLEMENTATION_PLAN.md)
- [Personalized Advisor Specs](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/PERSONALIZED_ADVISOR.md)

---

## 🛡️ License
Proprietary. All rights reserved.

