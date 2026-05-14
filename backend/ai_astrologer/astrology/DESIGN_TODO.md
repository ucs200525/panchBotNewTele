# 🔭 Objective 2: Sidereal Astrological Calculation Core
## 🗺️ Architectural Implementation Todo & Blueprint

To execute high-precision Sidereal (Vedic) computations completely offline, we establish a robust computational package under `/backend/ai_astrologer/astrology/`. This document outlines the files, equations, and features we are creating.

---

## 📁 File Structure & Implementation Plan

```text
/backend/ai_astrologer/astrology/
 ├── DESIGN_TODO.md      // (This file) Architectural checklist
 ├── planets.js          // Planetary longitudes, signs, retrograde states, and properties
 ├── lagna.js            // Houses, Ascendant (Lagna) cusps, and 12-house coordinates
 └── nakshatra.js        // Nakshatra mapping, Pada (quarter) indices, and ruling lords
```

---

## 📝 Detailed File Summaries

### 🪐 1. `planets.js` (Planetary Coordinates)
*   **Purpose:** Calculate the Sidereal longitudes, speeds, and sign positions for all 9 core Vedic bodies: **Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu**.
*   **Math Details:**
    *   Fetches Tropical coordinates from the C++ Swiss Ephemeris wrapper using standard planet IDs (`SE_SUN`, `SE_MOON`, etc.).
    *   Subtracts the sidereal offset (**Ayanamsa**, e.g., Lahiri ayanamsa offset of approximately $24.0^\circ$) to obtain the Sidereal longitude ($\lambda_{\text{sidereal}}$).
    *   Determines the Zodiac Sign: $\text{Sign Index} = \lfloor \lambda_{\text{sidereal}} / 30^\circ \rfloor$.
    *   Evaluates retrograde state (Speed < 0).
*   **Returns:** An array of planet placement objects including names, signs, degrees, and retrograde flags.

### 🏠 2. `lagna.js` (Ascendant & Houses)
*   **Purpose:** Compute the exact Ascendant sign, longitude, and positions of the 12 houses for any birth time and location.
*   **Math Details:**
    *   Fetches Tropical house cusps using standard house methods.
    *   Applies the Sidereal Ayanamsa offset to all 12 cusps.
    *   Identifies the **Lagna Sign** (Cusp of House 1).
    *   Calculates relative planet-to-house placements (e.g., placing planets in houses 1 through 12).
*   **Returns:** A house profile structure including Lagna details and cusp arrays.

### 🌙 3. `nakshatra.js` (Stellar Mapping)
*   **Purpose:** Map any longitude to its respective Vedic Nakshatra, Pada (quarter), and ruling planet.
*   **Math Details:**
    *   Total Zodiac = $360.0^\circ$. Nakshatras = 27. Width of each = $13.3333^\circ$ ($13^\circ 20'$).
    *   Width of a Pada = $3.3333^\circ$ ($3^\circ 20'$).
    *   Nakshatra Index = $\lfloor \lambda_{\text{sidereal}} / 13.3333^\circ \rfloor$.
    *   Pada Index = $\lfloor (\lambda_{\text{sidereal}} \pmod{13.3333^\circ}) / 3.3333^\circ \rfloor + 1$.
*   **Returns:** Detailed nakshatra profiles including names, quarters, lords, and astrological properties.

---

## 🏁 Execution Checklist
- [ ] Create `DESIGN_TODO.md` (Done)
- [ ] Implement `nakshatra.js`
- [ ] Implement `planets.js`
- [ ] Implement `lagna.js`
- [ ] Build universal interface in `backend/ai_astrologer/router.js`
