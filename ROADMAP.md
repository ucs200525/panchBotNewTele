# 🚀 Product Roadmap: Login & Personalization Features

This document outlines the planned enhancements for authenticated users to transform the application from a general calculation tool into a personalized Vedic Astrology platform.

---

## 💎 Premium User Features (Planned)

### 1. ☁️ Cloud Profile Vault (Family & Friends)
*   **Concept**: Move beyond browser `localStorage` to a secure database.
*   **Details**: Users can save unlimited birth profiles (Self, Family, Clients).
*   **Key Benefit**: Persistent access across multiple devices (Desktop, Mobile, Tablet).

### 2. 🎯 Personalized Daily Guidance (Tara Bala & Chandra Bala)
*   **Concept**: Custom daily dashboard based on the user's Natal Moon.
*   **Details**: 
    *   **Tara Bala**: Categorize daily Nakshatras as *Janma, Sampat, Vipat, Kshema, Pratyak, Sadhana, Naidhana, Mitra, or Ati-Mitra*.
    *   **Actionable Advice**: "Today is a 'Sadhana' day—best for spiritual practice or focused work."
*   **Benefit**: High-value daily engagement.

### 3. 📉 Unified Life Timeline (Dasha + Transits)
*   **Concept**: A visual chronological scroll merging cycles and transits.
*   **Details**: Overlay **Vimshottari Dasha** periods with major planet transits (Saturn, Jupiter, Rahu/Ketu).
*   **Benefit**: Users can "see the weather" for current and future life seasons.

### 4. 🔔 Smart Transit Alerts
*   **Concept**: Real-time push or email notifications.
*   **Details**: Alert users when:
    *   A planet changes Rashi (Sankranti).
    *   They enter a new Antardasha.
    *   Sade Sati phases change.
*   **Benefit**: Keeps users returning to the app without prompting.

### 5. 📑 Premium PDF Report Generator
*   **Concept**: Professional-grade downloadable reports.
*   **Details**: A "One-Click PDF" containing Shodashvarga (16 charts), Dasha tables, and transit analysis.
*   **Visuals**: Clean, high-resolution Vedic diagrams.

### 6. 🔍 Personal Auspicious Finder (Individual Muhurat)
*   **Concept**: Scanning the calendar for the user's specific benefit.
*   **Details**: Filter general Panchaka/Muhurat timings through the user's natal chart (avoiding Janma Nakshatra, Chandrashtama, etc.).
*   **Benefit**: Highly personalized "Best Day for ME" recommendations.

### 7. 🏷️ Significant Life Events Tracker
*   **Concept**: An "Astro-Journal."
*   **Details**: Users can tag past dates (Marriage, New Job, House Purchase) to see relevant Dashas/Transits at that time.
*   **Benefit**: Educational and helps confirm the accuracy of their birth time.

### 8. 📍 Default "Home" Location
*   **Concept**: Frictionless user experience.
*   **Details**: Set a default city/timezone so the Panchang and Muhurat load instantly upon login without search.

---

## 🛠️ Technical Considerations for Implementation
*   **Database**: MongoDB or PostgreSQL for profile storage.
*   **Backend**: Node.js/Express service for personalized computations.
*   **Notifications**: Integration with Firebase Cloud Messaging (FCM) or Twilio.
*   **Logic Engine**: Advanced utility functions for Tara Bala and Muhurat filtering.

---
*Created on 2026-02-13 | Last Modified: 2026-02-13*
