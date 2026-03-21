# Panchangam Image Generation API

This API provides professional, high-resolution astrological reports as PNG images. The reports are styled with a premium design system and high-accuracy astronomical data.

## 🌟 Image Generation Routes

All routes expect a `POST` request with a JSON body.

### 1. Combined Insights Report (Premium)
Fuses Muhurat calculations with Bhargava Panchang timings.
- **Endpoint**: `/api/combine-image`
- **Body Parameters**:
  - `city` (string, Required): The city name.
  - `date` (string, Required): Date in `YYYY-MM-DD` format.
  - `showNonBlue` (boolean, Optional): Default `true`. If true, shows only auspicious periods.
  - `is12HourFormat` (boolean, Optional): Default `true`. Output time in AM/PM.
  - `lat` (number, Optional): Precise latitude.
  - `lng` (number, Optional): Precise longitude.
  - `timeZone` (string, Optional): The local timezone ID (e.g., `Asia/Kolkata`).

### 2. Swiss Panchaka Report (Rahita Muhurats)
Detailed Rahita Muhurats calculated using precision mathematical formulas.
- **Endpoint**: `/api/getSwissTable-image`
- **Body Parameters**:
  - `city`, `date` (Required)
  - `lat`, `lng`, `timeZone` (Optional)

### 3. Bhargava Panchang Report
Daily guide to auspicious timings based on authentic Vedic astrology.
- **Endpoint**: `/api/getBharagvTable-image`
- **Body Parameters**:
  - `city`, `date` (Required)
  - `showNonBlue`, `is12HourFormat` (Optional)
  - `lat`, `lng`, `timeZone` (Optional)

### 4. Drik Table Report (Old Scraper Basis)
Report based on Drik Panchang scraped data.
- **Endpoint**: `/api/getDrikTable-image`
- **Body Parameters**:
  - `city`, `date` (Required)
  - `goodTimingsOnly` (boolean, Optional)

---

## ✅ Recent Updates
- **Geographic Precision**: All image routes now support `lat`, `lng`, and `timeZone` parameters. If provided, the backend skips geocoding and uses these coordinates for pinpoint mathematical accuracy.
- **Enhanced Templating**: Reports use a high-resolution 2x scale (1080p effective width) with full Google Font support (Inter & Outfit).
- **Duration Logic**: The `createDrikTable` helper now automatically calculates durations for time intervals, even those crossing midnight.
