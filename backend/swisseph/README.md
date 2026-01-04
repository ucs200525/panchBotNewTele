# Swiss Ephemeris Module

Professional-grade astronomical calculations for Vedic astrology using Swiss Ephemeris.

## 📁 Structure

```
swisseph/
├── core/                    # Core utilities
│   ├── config.js           # Global configuration & constants
│   ├── julianDay.js        # Julian Day conversion utilities
│   └── baseCalculator.js   # Base class for all calculators
│
├── lagna/                  # Lagna (Ascendant) calculations
│   ├── ascendant.js        # LagnaCalculator class
│   └── index.js            # Module API
│
├── panchanga/              # Panchanga calculations (TODO)
│   └── index.js           
│
├── muhurta/                # Muhurta calculations (TODO)
│   └── index.js           
│
├── planetary/              # Planetary positions (TODO)
│   └── index.js           
│
├── charts/                 # Divisional charts (TODO)
│   └── index.js           
│
├── dasha/                  # Dasha systems (TODO)
│   └── index.js           
│
├── astronomical/           # Astronomical events (TODO)
│   └── index.js           
│
└── index.js                # Main export
```

## 🚀 Usage

### Import the module

```javascript
const swisseph = require('./swisseph');
const { lagna } = swisseph;
```

### Calculate Lagna timings

```javascript
const date = new Date('2026-01-04T12:00:00+05:30');
const lat = 16.8135;
const lng = 81.5217;
const timezone = 'Asia/Kolkata';
const sunrise = '06:32:45';

// Get all Lagna timings for the day
const lagnas = lagna.calculateDayLagnas(date, lat, lng, timezone, sunrise);

lagnas.forEach(l => {
    console.log(`${l.symbol} ${l.name}: ${l.startTime} to ${l.endTime}`);
});
```

### Get Lagna at specific time

```javascript
const currentLagna = lagna.getLagnaAtTime(new Date(), lat, lng);
console.log(`Current Lagna: ${currentLagna.symbol} ${currentLagna.name}`);
console.log(`Longitude: ${currentLagna.longitude.toFixed(2)}°`);
```

## 🎯 Features

### ✅ Lagna Module (Complete)
- Accurate Lagna calculations using Swiss Ephemeris
- All 12 Rashi timings for the day
- Backward search to find actual start time
- Binary search for precise transitions (±10 seconds)
- Proper 360°/0° boundary wrap handling
- Zodiac symbols (♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓)

### 🔜 Coming Soon
- Panchanga (Tithi, Nakshatra, Yoga, Karana)
- Muhurta (Abhijit, Brahma, Choghadiya, Rahu Kaal)
- Planetary positions & transits
- Divisional charts (D1-D60)
- Dasha systems (Vimshottari, Yogini, Ashtottari)
- Astronomical events (Eclipses, Sankranti, etc.)

## 🔧 Technical Details

### Base Calculator Class

All calculator modules extend `BaseCalculator` which provides:
- Julian Day conversion
- Ayanamsa calculations
- Tropical ↔ Sidereal conversion
- Binary search for precise timing
- Time formatting utilities

### Constants Available

```javascript
const { RASHIS, RASHI_SYMBOLS, NAKSHATRAS, TITHIS, YOGAS, KARANAS } = swisseph;
```

## 📦 Dependencies

- `swisseph` - Swiss Ephemeris library

## 🎨 Design Principles

1. **Modularity**: Each calculation in its own file
2. **Reusability**: Base classes for common patterns
3. **Accuracy**: Direct Swiss Ephemeris calculations
4. **Performance**: Binary search for precision
5. **Extensibility**: Easy to add new modules
6. **Professional**: Research-grade quality

## 📝 Migration Notes

The old `utils/lagnaFinder.js` now wraps `swisseph/lagna` for backward compatibility.

**TODO**: Migrate all code to use `swisseph/lagna` directly.

---

**Built with ❤️ using Swiss Ephemeris**
