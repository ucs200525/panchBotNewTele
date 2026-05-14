# ⚙️ PanchBot Backend

The core engine of the Panchangam & Vedic Copilot platform. Responsible for high-precision astronomical calculations, AI reasoning, and data management.

## 📁 Backend Directory Structure

```text
backend/
├── 📁 ai_astrologer/          # Legacy / External AI Reasoning Engine API
├── 📁 ai_core/                # Advanced Deterministic Hybrid NLP/NLG Engine
│   ├── 📁 context/            # Profile State & Memory Management
│   ├── 📁 executor/           # Rule Engine & Evaluation Matrices
│   ├── 📁 nlp/                # Intent Classification & Entity Extraction (Regex + spaCy)
│   └── 📁 response/           # NLG Formatting & Astrological Deduplication
├── 📁 astrology_engines/      # Specialized Calculation Logic
│   ├── 📄 swissEngine.js      # Swiss Ephemeris wrappers
│   └── 📄 muhuratLogic.js     # Auspicious timing algorithms
├── 📁 routes/                 # Express API Routes
│   ├── 📄 panchangRoutes.js   # Core Tithi/Nakshatra data
│   ├── 📄 analyticsRoutes.js  # Usage tracking
│   └── 📄 authRoutes.js       # User management
├── 📁 utils/                  # Shared Helpers & Renderers
│   ├── 📄 chartRenderer.js    # South Indian Chart SVG/PNG logic
│   ├── 📄 db.js               # MongoDB connection
│   └── 📄 logger.js           # Structured logging
├── 📁 data/                   # Static Ephemeris & Astro data
├── 📄 server.js               # Application Entry Point
├── 📄 package.json            # Node.js dependencies & scripts
└── 📄 vercel.json             # Serverless deployment config
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with the following keys:
   ```env
   PORT=4000
   MONGODB_URI=your_mongodb_connection_string
   OPENROUTER_API_KEY=your_key_here
   ```

3. **Run Server**
   ```bash
   npm start
   ```

## 🛠️ Technology Stack
- **Node.js 22**: High-performance runtime.
- **Python 3.8+**: Used alongside spaCy for advanced NLP entity extraction.
- **Swiss Ephemeris**: Industry-standard precision astronomical calculations.
- **MongoDB**: Flexible storage for user profiles and analytics.
- **Winston**: Advanced logging for production monitoring.

## 📄 Main Project Documentation
For the full project overview (including Frontend and Architecture), see the [Root README](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/README.md).
