# Vakya System - Technical Specification

## 1. Concept
The Vakya system avoids complex division and multiplication (which were hard in ancient times without paper) by using **mnemonics (Vakyas)**.

Each "Vakya" is a sentence encoded using the *Katapayadi* system to represent numbers.

## 2. Lunar Calculation (The 248-Day Cycle)
The Moon's motion is the most complex. It is modeled on a repeating cycle of **248 days**.
-   The cycle is divided into 9 anomalies.
-   There are specific Vakyas for every day of this 248-day cycle.

### Implementation Logic:
1.  **Calculate Vakya Day Index**:
    -   `Days = Ahargana % 248`
    -   (`Ahargana` here might be calculated from a different epoch standard to Vakya tradition, typically Kali Yuga or a refresher epoch like 1200 AD).
2.  **Lookup Base Position**:
    -   Retrieve the Moon's longitude from the `VakyaTable` using the `Index`.
3.  **Apply Dhruva Correction**:
    -   Since the 248-day cycle isn't perfect, a "Dhruvaka" (constant) is added for every completed cycle (Devaram).

## 3. Planetary Vakyas
Planets use long-term period tables.
-   **Jupiter**: 1 cycle = 12 years (approx). Vakyas exist for position changes every few days.
-   **Saturn**: 1 cycle = 30 years.
-   **Sun**: 1 cycle = 365 ¼ days.

### Algorithm:
1.  Determine the number of full cycles elapsed since the Epoch.
2.  Add the `Dhruva` (Accumulated Longitude) for those cycles.
3.  Find the `Remainder Days` in the current cycle.
4.  Lookup the closest Vakya phrase for `Remainder Days`.
5.  **Interpolation**: Simple linear interpolation is done between two Vakyas if the day falls in between.

## 4. The "Suddha Vakya" Data Structure
We need a JSON file mimicking the traditional palm-leaf tables:

```json
{
  "moon_vakyas": [
    { "day": 1, "value_encoded": "Girnah Sreyah", "long_deg": 12.5 },
    { "day": 2, "value_encoded": "...", "long_deg": 26.2 }
    // ... 248 entries
  ],
  "sun_vakyas": [
    // ... 365 entries
  ]
}
```

## 5. Usage in Panchang
Vakya Panchangam is strictly used for **Temple Festivals** (Utsavas) in South India.
-   **Tithi**: Calculated from Vakya Sun - Vakya Moon.
-   **Nakshatra**: Calculated from Vakya Moon.

*Note: Vakya positions can deviate from modern Drik positions by up to 12 hours in Tithi endings. This is "correct" for ritual purposes.*
