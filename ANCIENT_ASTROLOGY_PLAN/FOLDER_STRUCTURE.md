# 📂 Proposed Folder Structure

To implement the Ancient Astrology capabilities without cluttering the existing backend, we will create a dedicated `astrology_engines` module.

## 📍 Root Directory: `backend/src/astrology_engines/`

```text
backend/
└── src/
    └── astrology_engines/
        ├── index.js                  # Main entry point / Factory pattern
        ├── constants/
        │   ├── ss_constants.js       # Surya Siddhanta Yuga constants
        │   ├── vakya_tables.json     # 248-day Moon Vakyas & Planet Vakyas
        │   └── kp_sublords.json      # The 249 Sub-Lord divisions
        ├── core/
        │   ├── math_utils.js         # Circular trigonometry (sine/cosine lookup emulation)
        │   ├── time_utils.js         # Ahargana calculation (Julian Day to Kali Ahargana)
        │   └── ayanamsa.js           # KP, Lahiri, Raman, Surya Siddhanta Ayanamsa logic
        ├── engines/
        │   ├── surya_siddhanta/
        │   │   ├── planetary_model.js # Logic for Mean Longitude -> True Longitude
        │   │   ├── solar_lunar.js     # Specific computations for Sun and Moon (Tithi/Nakshatra)
        │   │   └── engine.js          # Main SS Class
        │   ├── vakya/
        │   │   ├── sentence_parser.js # Logic to read Vakya phrases
        │   │   ├── interpolator.js    # Linear interpolation between Vakya points
        │   │   └── engine.js          # Main Vakya Class
        │   └── kp_system/
        │       ├── house_system.js    # Placidus House calculation (complex trig)
        │       ├── significators.js   # 4-fold significator logic
        │       └── engine.js          # Main KP Class
        └── interfaces/
            ├── astrology_api.js      # Uniform API wrapper for all engines
            └── output_formatter.js   # Formats data for Frontend (JSON)
```

## 🧩 Key File Descriptions

### 1. `constants/ss_constants.js`
Contains the raw numbers from the Surya Siddhanta:
-   **Civil Days in a Yuga**: 1,577,917,828
-   **Solar Revolutions**: 4,320,000
-   **Planetary Revolutions**: e.g., Mars (2,296,832), Jupiter (364,220)...

### 2. `engines/surya_siddhanta/planetary_model.js`
Implements the crucial "Epicyclic Model":
-   **Manda Paridhi**: Dimensions of the epicycle of "apsis" (slow motion).
-   **Sighra Paridhi**: Dimensions of the epicycle of "conjunction" (fast motion).
-   **Jya / Utkramajya**: Indian Sine and Versine functions.

### 3. `engines/kp_system/house_system.js`
Unlike standard Vedic (Equal/Whole Sign), KP uses **Placidus**.
-   This requires solving the **diurnal arc** equations iteratively.
-   Inputs: Latitude, Longitude, Sidereal Time.
-   Outputs: Exact Cusp degrees for all 12 houses.

### 4. `engines/vakya/sentence_parser.js`
-   Stores the "Suddha Vakya" (pure sentences).
-   Logic to calculate the "Day Index" within the 248-day lunar cycle.
-   Logic to apply "Beeja" corrections if required.
