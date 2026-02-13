# KP System (Krishnamurti Paddhati) - Technical Specification

## 1. Overview
KP Astrology is a stellar system that provides minute precision in predictions. It relies heavily on:
-   **Constellation (Nakshatra) Lords**
-   **Sub-Lords** (Sub-division of Nakshatra)
-   **Placidus House System**

## 2. Ayanamsa: KP (New)
KP uses a specific Ayanamsa.
-   Roughly close to Lahiri (Chitra Paksha), but the value differs by a few arc minutes (approx -6' difference).
-   **Formula**: Often derived from the Newcombe rate with specific KP epoch corrections.
-   *Feature Request*: Ability to toggle between "KP Old" and "KP New".

## 3. The 249 Sub-Lord Table
This is the heart of the system.
The Zodiac (360°) is divided into 249 unequal parts.

### Logic of Division:
1.  **Zodiac** -> 12 Signs (30° each).
2.  **Sign** -> 2.25 Nakshatras (13° 20' each).
3.  **Nakshatra** -> 9 Subs.
    -   The Subs are distributed in proportion to the **Vimshottari Dasha** years of the planets (Sun 6, Moon 10, etc.).
    -   *Example*: In Ketu Nakshatra (Ashwini), the first sub is Ketu (ruled by itself), second is Venus, etc.

### Data Structure Requirement:
We need a `kp_sub_table.json`:
```json
[
  { "id": 1, "sign": "Aries", "star": "Ketu", "sub": "Ketu", "start_dms": "00:00:00", "end_dms": "00:46:40" },
  { "id": 2, "sign": "Aries", "star": "Ketu", "sub": "Venus", "start_dms": "00:46:40", "end_dms": "03:00:00" },
  ...
]
```

## 4. Placidus House System (Bhava)
KP **demands** Placidus houses.
-   Standard Vedic uses "Equal House" or "Sripati".
-   **Placidus Math**: Involves trisecting the semi-diurnal arcs of the quadrants.
-   This means house cusps are highly sensitive to **Latitude** and **Time**.

## 5. Significators (Karaka) Logic
The engine must calculate the "Four-Fold" Significators for every planet:
1.  **Level 1**: Planet in the Star of a generic Occupant of a House.
2.  **Level 2**: Planet in the House itself.
3.  **Level 3**: Planet in the Star of the House Lord.
4.  **Level 4**: The Lord of the House.

## 6. Ruling Planets (RP)
A dynamic utility to capture the RPs at the moment of query:
1.  **Ascendant Sign Lord**
2.  **Ascendant Star Lord**
3.  **Moon Sign Lord**
4.  **Moon Star Lord**
5.  **Day Lord** (Vara Lord - Sunrise to Sunrise)

*Precision Requirement*: The Ascendant calculation must be exact to the second to find the correct Star Lord.
