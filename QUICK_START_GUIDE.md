# 🚀 Quick Start Guide - Swiss Ephemeris Features

## Running the Application

Both servers are already running:
- **Backend**: `http://localhost:4000`
- **Frontend**: `http://localhost:3000`

Just open your browser and visit `http://localhost:3000`!

## 📱 Using Each Feature

### 1. 📅 Panchang Page (`/panchang`)
**What it shows**: Complete daily Panchang with all 5 elements

**How to use**:
1. Enter city name (e.g., "Delhi", "Mumbai")
2. Select date
3. Click "Get Panchang"
4. View:
   - Tithi (lunar day)
   - Nakshatra (lunar mansion)
   - Yoga (astronomical combination)
   - Karana (half-tithi)
   - Vara (weekday)
   - Auspicious timings (Abhijit Muhurat)
   - Inauspicious timings (Rahu Kaal, Gulika)

### 2. 📊 Charts Page (`/charts`)
**What it shows**: D1, D9, and D10 divisional charts

**How to use**:
1. Enter city name
2. Select date
3. Enter birth time (e.g., "14:30")
4. Click "Get Charts"
5. View all three charts:
   - **D1 (Rasi)**: Main birth chart
   - **D9 (Navamsa)**: Marriage and strength chart
   - **D10 (Dasamsa)**: Career and profession chart

**Chart Features**:
- House numbers (1-12)
- Planets in each house
- Lagna (Ascendant) marked
- Color-coded houses

### 3. ⏳ Dasha Page (`/dasha`)
**What it shows**: Vimshottari Mahadasha periods

**How to use**:
1. Enter birth date
2. Enter birth time
3. Click "Get Dasha"
4. View:
   - All 9 Mahadasha periods
   - Start and end dates
   - Duration in years
   - Current running dasha highlighted
   - Moon nakshatra at birth

**Dasha Lords**:
- Ketu (7 years)
- Venus (20 years)
- Sun (6 years)
- Moon (10 years)
- Mars (7 years)
- Rahu (18 years)
- Jupiter (16 years)
- Saturn (19 years)
- Mercury (17 years)

### 4. 🪐 Planetary Page (`/planetary`)
**What it shows**: Positions of all planets

**How to use**:
1. Select date
2. Enter time (optional, defaults to 12:00)
3. Click "Get Positions"
4. View for each planet:
   - Tropical longitude
   - Sidereal longitude (Vedic)
   - Rashi (sign)
   - Degrees within sign
   - Nakshatra

**Planets shown**:
- ☉ Sun
- ☽ Moon
- ♂ Mars
- ☿ Mercury
- ♃ Jupiter
- ♀ Venus
- ♄ Saturn
- ☊ Rahu (North Node)
- ☋ Ketu (South Node)

### 5. 🌌 Astronomical Page (`/astronomical`)
**What it shows**: Advanced astronomical calculations

**How to use**:
1. Select date
2. Enter time
3. Click "Get Data"
4. View:
   - Julian Day number
   - Ayanamsa value
   - Sun position (tropical & sidereal)
   - Moon position (tropical & sidereal)
   - Tithi number and progress
   - Nakshatra and progress
   - Paksha (Shukla/Krishna)

**Use this for**:
- Precise astronomical data
- Verification of calculations
- Research purposes

### 6. 🌅 Lagna Page (`/lagna`)
**What it shows**: Daily ascendant (lagna) timings

**How to use**:
1. Enter city (for coordinates)
2. Select date
3. Click "Get Lagnas"
4. View all 12 lagna periods:
   - Mesha (Aries) lagna timing
   - Vrishabha (Taurus) lagna timing
   - ... (all 12 rashis)
   - Start and end time for each

**Use this for**:
- Finding auspicious lagna for activities
- Planning important events
- Muhurta selection

### 7. ⌛ Hora Page (`/hora`)
**What it shows**: Hourly planetary periods (hora)

**How to use**:
1. Enter city
2. Select date
3. Click "Get Horas"
4. View:
   - All hora periods from sunrise to next sunrise
   - Planetary lord for each hora
   - Start and end times

**Hora Lords**:
- ☉ Sun Hora - Good for government work, authority
- ☽ Moon Hora - Good for personal, emotional matters
- ♂ Mars Hora - Good for courage, competition
- ☿ Mercury Hora - Good for business, communication
- ♃ Jupiter Hora - Good for education, spiritual work
- ♀ Venus Hora - Good for arts, relationships
- ♄ Saturn Hora - Good for hard work, service

### 8. ⭐ Good Timings Page (`/combine`)
**What it shows**: Combined best timings for the day

**How to use**:
1. Enter city
2. Select date
3. Click "Get Good Timings"
4. View combined data from:
   - Bhargava table (24-minute periods)
   - Muhurta calculations
   - Auspicious periods highlighted
   - Inauspicious periods marked

## 💡 Tips for Best Results

### City Names
- Use well-known city names: "Delhi", "Mumbai", "Bangalore", "Chennai"
- If city not found, try nearby major city
- Or use specific coordinates if you have them

### Date Selection
- Use the date picker for consistency
- Format: YYYY-MM-DD (e.g., 2026-02-07)
- Past, present, and future dates all work!

### Time Input
- Use 24-hour format: "14:30" for 2:30 PM
- Or use the time picker
- Seconds are optional

### Coordinates
- Latitude: North is positive, South is negative
- Longitude: East is positive, West is negative
- Example: Delhi = 28.6139°N, 77.2090°E

## 🎯 Common Use Cases

### 1. Daily Panchang Check
**Goal**: Check today's panchang  
**Page**: Panchang (`/panchang`)  
**Steps**: Enter city → Today's date → Get Panchang

### 2. Birth Chart Analysis
**Goal**: See complete birth chart  
**Page**: Charts (`/charts`)  
**Steps**: Enter birth city → Birth date → Birth time → Get Charts

### 3. Check Current Dasha
**Goal**: Know which dasha is running  
**Page**: Dasha (`/dasha`)  
**Steps**: Enter birth date → Birth time → Check highlighted dasha

### 4. Find Good Muhurta
**Goal**: Find auspicious time for activity  
**Page**: Good Timings (`/combine`)  
**Steps**: Enter city → Date → See green (auspicious) periods

### 5. Plan Event by Lagna
**Goal**: Find specific lagna timing  
**Page**: Lagna (`/lagna`)  
**Steps**: Enter city → Date → Find desired lagna period

## ❓ Troubleshooting

### "Could not find city"
- Try major nearby city
- Check spelling
- Use alternate name (e.g., "Bombay" → "Mumbai")

### No data showing
- Check if both servers are running
- Refresh the page
- Check browser console for errors

### Chart not displaying
- Verify you entered all fields (city, date, time)
- Check if coordinates are valid
- Try a different date

### Wrong timings
- Verify correct city selected
- Check time zone
- Ensure date format is correct

## 🔧 Advanced Features

### Custom Coordinates
Some pages allow direct coordinate input:
- **Latitude**: Degrees North/South
- **Longitude**: Degrees East/West
- More accurate than city lookup!

### Timezone Selection
Default: Asia/Kolkata (IST)  
Can be customized in API calls if needed

### Multiple Chart Types
Charts page shows three divisional charts:
- **D1**: Overall life, personality
- **D9**: Marriage, inner strength
- **D10**: Career, profession

### Detailed Planetary Data
Planetary page shows both:
- **Tropical**: Western astrology reference
- **Sidereal**: Vedic astrology (primary)

## 📚 Learn More

### Vedic Astrology Concepts

**Tithi**: Lunar day (1-30), measures Moon-Sun angle  
**Nakshatra**: Lunar mansion (1-27), 13°20' each  
**Yoga**: Sun + Moon speed combination (27 types)  
**Karana**: Half-tithi (11 types)  
**Paksha**: Lunar fortnight (Shukla/Krishna)  

**Lagna**: Ascendant sign rising on eastern horizon  
**Rashi**: Zodiac sign (12 total)  
**Hora**: Planetary hour  

### Swiss Ephemeris
- Professional astronomy library
- Ultra-high precision
- Used worldwide by astrologers
- Calculates planetary positions from 13,000 BCE to 17,000 CE!

---

**Need Help?** Check the `SWISSEPH_INTEGRATION.md` file for detailed API documentation!

**Enjoy exploring Vedic astrology with Swiss Ephemeris! 🕉️✨**
