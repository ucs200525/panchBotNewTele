# 🎨 PanchBot Frontend

The user interface for the Panchangam & Vedic Copilot platform. Built with React and designed for high-performance astrological visualizations.

## 📁 Frontend Directory Structure

```text
frontend/
├── 📁 public/                 # Static assets & HTML template
├── 📁 src/
│   ├── 📁 components/         # Reusable UI Components
│   │   ├── 📁 common/         # Buttons, Inputs, Loaders
│   │   ├── 📁 layout/         # Header, Footer, Sidebar
│   │   └── 📁 charts/         # Specialized Astro Chart components
│   ├── 📁 pages/              # 40+ Application Screens
│   │   ├── 📄 AstroChat.js    # Interface for the Deterministic Hybrid AI Copilot
│   │   ├── 📄 DailyPanchang.js # Core Panchang Dashboard
│   │   ├── 📄 ChartsPage.js   # Birth Chart Visualizer
│   │   ├── 📄 GoodTimings.js  # Muhurat Filtering
│   │   └── ... (and many more)
│   ├── 📁 context/            # React Context for Auth & User Data
│   ├── 📁 utils/              # API Service Layers & Helpers
│   │   ├── 📄 api.js          # Main Axios Instance
│   │   └── 📄 astroUtils.js   # Formatting & Calculations
│   ├── 📁 styles/             # Global CSS & Theme Tokens
│   ├── 📄 App.js              # Application Entry & Routes
│   └── 📄 index.js            # React DOM Mounting
├── 📄 package.json            # Scripts: start, build, test
└── 📄 .env                    # API Base URL & Config
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file based on `.env.example`:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:4000
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

## 🛠️ Key Technologies
- **React 18**: Component-based UI architecture.
- **React Router 6**: Client-side routing for seamless navigation.
- **CSS Modules**: Scoped styling to prevent global conflicts.
- **HTML2Canvas**: Enables users to download astrological reports as images.

## 📄 Main Project Documentation
For the full project overview (including Backend and AI), see the [Root README](file:///d:/4.own/project/panchagamswiss/panchBotNewTele/README.md).

