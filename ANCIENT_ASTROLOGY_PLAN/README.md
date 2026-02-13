# Ancient & True Vedic Astrology Module - Implementation Plan

## 🌟 Overview
This folder contains the comprehensive architectural blueprint and implementation specifications for adding **True Ancient Vedic Astrology** capabilities to the Panchang application.

The goal is to move beyond standard Swiss Ephemeris calculations and implement the **mathematically distinct** systems used in traditional Indian astrology:
1.  **Surya Siddhanta (SS)**: The original astronomical text of India.
2.  **Vakya (Vakyam)**: The mnemonic-based system used in Tamil Nadu (e.g., Ramanathapuram, Srirangam).
3.  **KP System (Krishnamurti Paddhati)**: A precision-based stellar astrology system.
4.  **Drig Ganita**: The modern observational system.

## 📚 Documentation Contents

1.  **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)**  
    *Detailed breakdown of the new files and directories to be created in the codebase.*

2.  **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)**  
    *Step-by-step phased plan from mathematical core to API deployment.*

3.  **[SURYA_SIDDHANTA_SPEC.md](./SURYA_SIDDHANTA_SPEC.md)**  
    *Mathematical constants, formulas, and algorithms derived strictly from the Surya Siddhanta text.*

4.  **[VAKYA_SYSTEM_SPEC.md](./VAKYA_SYSTEM_SPEC.md)**  
    *Structure of Vakya sentences, lookup tables, and correction mechanisms.*

5.  **[KP_SYSTEM_SPEC.md](./KP_SYSTEM_SPEC.md)**  
    *Logic for Placidus houses, 249 Sub-Lords, and Ruling Planets.*

---

## 🎯 Core Objectives
-   **Precision**: Maintain high-precision floating-point arithmetic for "Zero-Ayanamsa" calculations.
-   **Authenticity**: Ensure Surya Siddhanta calculations align with the *Beeja-samskara* (corrected) or *Original* text as configured.
-   **Flexibility**: Allow the user to switch the "Calculation Engine" on the fly (e.g., from SwissEph to Surya Siddhanta).
