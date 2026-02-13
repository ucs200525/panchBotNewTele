# Surya Siddhanta - Technical Specification

## 1. Fundamental Constants (Chapter 1)
The engine must use the following integer constants representing the number of revolutions in a **Mahayuga** (4,320,000 solar years).

| Planet (Graha) | Revolutions (Bhagana) |
| :--- | :--- |
| **Sun (Surya)** | 4,320,000 |
| **Moon (Chandra)** | 57,753,336 |
| **Mars (Kuja)** | 2,296,832 |
| **Mercury (Budha - Sighra)** | 17,937,060 |
| **Jupiter (Guru)** | 364,220 |
| **Venus (Shukra - Sighra)** | 7,022,376 |
| **Saturn (Shani)** | 146,568 |
| **Moon's Apogee (Mandocca)** | 488,203 |
| **Rahu (Node - Retrograde)** | 232,226 |

**Civil Days in Mahayuga**: `1,577,917,828` days.

## 2. Time Calculation (Ahargana)
The core variable for all positions is calculating the **Ahargana** (heap of days).

### Algorithm:
1.  **Epoch**: Kali Yuga Start (Midnight at Ujjain, Feb 17/18, 3102 BCE).
2.  **Input**: Modern Calendar Date (Gregorian).
3.  **Process**:
    -   Convert Gregorian Date -> Julian Day Number (JDN).
    -   `Ahargana = JDN - 588465.5` (Adjust for Ujjain Mean Time offset if strict adherence is needed).
    -   *Crucial Step*: The day must be measured from **Sunrise to Sunrise** for true Vedic days, but for planetary calculation, the Mean Midnight or Mean Sunrise epoch can be used as the zero point.

## 3. Position Calculation Flow

### Step A: Mean Longitude (Madhyama)
For each planet $P$:
$$ \text{Mean Longitude} = \frac{\text{Ahargana} \times \text{Revolutions}_P}{\text{Days in Mahayuga}} \times 360^\circ $$
*Take the fractional part and multiply by 360 to get degrees.*

### Step B: The Correction Process (Spashta)
Surya Siddhanta uses a unique " Epicyclic" model involving two circumferences:
1.  **Manda Paridhi** (Epicycle of Apsis)
2.  **Sighra Paridhi** (Epicycle of Conjunction) - *Only for Mars, Mercury, Jupiter, Venus, Saturn*.

#### 1. Manda Sanskara (Equation of Center)
Correction based on the planet's position relative to its apogee.
-   Calculate `Manda Kendra` (Mean Anomaly) = `Mean Longitude - Apogee`.
-   Lookup `Manda Paridhi` (this varies by Kendra in SS, unlike modern astronomy where it's constant).
-   Calculate `Manda Phala` (Equation of Center) using Indian Sine function.
-   `Corrected = Mean +/- Manda Phala`.

#### 2. Sighra Sanskara (Perturbation)
Correction based on the planet's position relative to the Sun (Sighrocca).
-   Calculate `Sighra Kendra`.
-   Lookup `Sighra Paridhi`.
-   Calculate `Sighra Phala`.

#### 3. Iterative Correction (Mars, Mercury, Jupiter, Venus, Saturn)
The text specifies a 4-step process for the 5 planets:
1.  Calculate Manda correction -> Apply ½ of it.
2.  Calculate Sighra correction (on result of 1) -> Apply ½ of it.
3.  Calculate Manda correction (on result of 2) -> Apply WHOLE of it.
4.  Calculate Sighra correction (on result of 3) -> Apply WHOLE of it.

## 4. True Ayanamsa in Surya Siddhanta
Surya Siddhanta describes a **Trepidation (Oscillating) Ayanamsa**, not a continuously increasing one.
-   **Range**: +/- 27 degrees.
-   **Rate**: 54 arc-seconds per year (approx).
-   **Logic**: It swings back and forth. (There is debate here; some modern SS implementations use linear, but "True" SS is oscillatory).

## 5. Required Trigonometry
Do **not** use `Math.sin()`. Use the **Jya** table or formula:
-   `Radius (R) = 3438`
-   `Sin(theta) = (R * sin(theta))` - *computed via interpolation from the 24 sine values given in verses.*

---
**Note**: This logic produces the "Old School" positions used for temple rituals, not the NASA-aligned positions.
