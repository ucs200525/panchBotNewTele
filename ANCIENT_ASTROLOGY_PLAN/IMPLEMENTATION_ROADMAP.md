# 🚀 Implementation Roadmap

This roadmap breaks down the development of the Ancient Astrology module into 5 distinct phases.

---

## 🗓️ Phase 1: The Mathematic Foundation (Week 1)
**Goal:** Build the core utility libraries that power all ancient systems.

1.  **Time System (Kali Ahargana)**:
    -   Create function `julianToAhargana(jd)`: Converts modern Julian Date to "Days since Kali Yuga started" (Midnight/Sunrise Feb 18, 3102 BCE).
2.  **Indian Trigonometry**:
    -   Implement `RSine` (Radius Sine) functions as described in Surya Siddhanta (using R=3438).
    -   Implement `RCosine` and `RVersine`.
3.  **Ayanamsa Manager**:
    -   Implement the logic to calculate `Ayanamsa` for any given date.
    -   Support: *Lahiri, KP (New), KP (Straight), Raman, Surya Siddhanta (Oscillatory)*.

## ☀️ Phase 2: Surya Siddhanta Engine (Weeks 2-3)
**Goal:** Calculate planetary positions strictly using the Surya Siddhanta text.

1.  **Mean Computations**:
    -   Calculate Mean Longitude (`Madhyama`) for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu.
2.  **True Position Logic (Spashta)**:
    -   Implement **Manda Sanskara** (Equation of Center correction).
    -   Implement **Sighra Sanskara** (Perturbation/Geo-centric correction).
    -   Iterative correction loop (as specified in the text) to refine positions.
3.  **Validation**:
    -   Compare outputs against `Drig Ganita` (Swiss Eph) to understand deviations (expected to be up to 1-2 degrees).

## 📜 Phase 3: Vakya System (Week 4)
**Goal:** Implement the traditional Tamil sentence-based astrology.

1.  **Data Entry**:
    -   Digitize the "base tables" for the 248-day Lunar cycle.
    -   Digitize the basic planetary motion constants (Vakyas).
2.  **Lookup Logic**:
    -   Create `getVakyaPosition(planet, ahargana)` function.
    -   Implement the "Sodhaya" (reduction) logic to fit current days into the cyclic tables.
3.  **Panchang Integration**:
    -   Calculate Tithi and Nakshatra *specifically* using Vakya positions (this is critical for Temple festivals).

## 🌠 Phase 4: KP System (Krishnamurti Paddhati) (Week 5)
**Goal:** Implement the 20th-century precision system.

1.  **Placidus House System**:
    -   Port a Placidus algorithm (likely from a JS library or Swiss Eph native function) to generate unequal house cusps.
2.  **Sub-Lord Calculation**:
    -   Create the `249 Table` lookup.
    -   Logic: `Degree -> Sign -> Star (Constellation) -> Sub (1/9th division)`.
    -   Identify the **Sign Lord**, **Star Lord**, and **Sub Lord** for every planet and cusp.
3.  **Ruling Planets**:
    -   Real-time calculation of the Ruling Planets for the moment of judgment (Prasna).

## 🔌 Phase 5: API Integration & Frontend (Week 6)
**Goal:** Expose these engines to the frontend.

1.  **Unified API Strategy**:
    -   Endpoint: `POST /api/panchang/calculate-ancient`
    -   Body: `{ date, time, location, system: 'SURYA_SIDDHANTA' | 'VAKYA' | 'KP' }`
2.  **Frontend Selector**:
    -   Add a dropdown in the Global Settings: "Ayanamsa / System Model".
3.  **Dual View**:
    -   Create a "Comparison View" page where a user can see "Drik (Modern)" vs "Surya Siddhanta" side-by-side.

---

## 🛡️ Testing Strategy
-   **Unit Tests**: Test math functions (RSine, Ahargana) against known manual calculations.
-   **Reference Check**: Verify Surya Siddhanta output against printed almanacs (like *Vakyapanchangam*).
-   **Performance**: Ensure the iterative loops in SS and Placidus don't block the Node.js event loop.
