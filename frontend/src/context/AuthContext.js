import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize states from localStorage (for persistence across sessions)
    // or provide default values
    const [localCity, setLocalCity] = useState(() => localStorage.getItem('selectedCity') || '');
    const [localDate, setLocalDate] = useState(() => {
        // Use today's date if not in sessionStorage
        return sessionStorage.getItem('date') || new Date().toISOString().substring(0, 10);
    });

    // Additional general info
    const [selectedLat, setSelectedLat] = useState(() => localStorage.getItem('selectedLat') || null);
    const [selectedLng, setSelectedLng] = useState(() => localStorage.getItem('selectedLng') || null);
    const [timeZone, setTimeZone] = useState(() => localStorage.getItem('selectedTimeZone') || '');
    const [is12HourFormat, setIs12HourFormat] = useState(() => {
        const saved = localStorage.getItem('is12HourFormat');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Function to update city and date globally
    const setCityAndDate = (newCity, newDate) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        sessionStorage.setItem('date', newDate);
        localStorage.setItem('selectedCity', newCity);
    };

    // Function to update location details specifically
    const setLocationDetails = (details) => {
        if (details.name) {
            setLocalCity(details.name);
            localStorage.setItem('selectedCity', details.name);
        }
        if (details.lat) {
            setSelectedLat(details.lat);
            localStorage.setItem('selectedLat', details.lat);
        }
        if (details.lng) {
            setSelectedLng(details.lng);
            localStorage.setItem('selectedLng', details.lng);
        }
        if (details.timeZone) {
            setTimeZone(details.timeZone);
            localStorage.setItem('selectedTimeZone', details.timeZone);
        }
    };

    // Keep localStorage/sessionStorage updated
    useEffect(() => {
        localStorage.setItem('selectedCity', localCity);
        sessionStorage.setItem('date', localDate);
        if (selectedLat) localStorage.setItem('selectedLat', selectedLat);
        if (selectedLng) localStorage.setItem('selectedLng', selectedLng);
        if (timeZone) localStorage.setItem('selectedTimeZone', timeZone);
        localStorage.setItem('is12HourFormat', JSON.stringify(is12HourFormat));
    }, [localCity, localDate, selectedLat, selectedLng, timeZone, is12HourFormat]);

    // Provide values to components consuming AuthContext
    return (
        <AuthContext.Provider value={{
            localCity,
            localDate,
            selectedLat,
            selectedLng,
            timeZone,
            is12HourFormat,
            setIs12HourFormat,
            setCityAndDate,
            setLocationDetails
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
