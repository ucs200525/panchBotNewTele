// // src/context/AuthContext.js
// import React, { createContext, useState, useContext, useEffect } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [localCity, setLocalCity] = useState(() => sessionStorage.getItem('city') || '');
//     const [localDate, setLocalDate] = useState(() => sessionStorage.getItem('date') || '');
//     const [isSearching, setisSearching] = useState(() => sessionStorage.getItem('search') || '');

//     const [muhurthData, setmuhurthData] = useState(() => sessionStorage.getItem('muhurtT') || '');
//     const [panchangam, setpanchangam] = useState(() => sessionStorage.getItem('panchangamT') || '');

//     const setCityAndDate = (newCity, newDate) => {
//         setLocalCity(newCity);
//         setLocalDate(newDate);
//         sessionStorage.setItem('city', newCity);
//         sessionStorage.setItem('date', newDate);
//     };
    
//     const search = (isSearching)=>{
//         setisSearching(isSearching);
//         sessionStorage.setItem('search', isSearching);
//     }; 

//     const setMuhuratTable = (data) => {
//         setmuhurthData(data);
//         sessionStorage.setItem('muhurtT', data);
//     };

//     const setPancahgamTable = (data) => {
//         setpanchangam(data);
//         sessionStorage.setItem('panchangamT', data);
//     };

//     useEffect(() => {
//         if (localCity) {
//             sessionStorage.setItem('city', localCity);
//         }
//         if (localDate) {
//             sessionStorage.setItem('date', localDate);
//         }
//         if (isSearching) {
//             sessionStorage.setItem('search', isSearching);
//         }
//     }, [localCity, localDate,isSearching]);

//     return (
//         <AuthContext.Provider value={{ muhurthData,localCity, localDate,isSearching,search, setisSearching,setCityAndDate ,setPancahgamTable,setMuhuratTable}}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     return useContext(AuthContext);
// };

// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Run migration / cache clear ONLY ONCE per browser
const CLEAR_VERSION = "v1_clear_location";
if (typeof window !== 'undefined') {
    if (localStorage.getItem('app_clear_version') !== CLEAR_VERSION) {
        // Clear all location-related keys to force a fresh geolocation prompt
        localStorage.removeItem('city');
        localStorage.removeItem('lat');
        localStorage.removeItem('lng');
        localStorage.removeItem('cityName');
        localStorage.removeItem('panchaka_city');
        localStorage.removeItem('panchaka_filteredData');
        localStorage.removeItem('panchaka_allMuhuratData');
        
        // Mark as cleared
        localStorage.setItem('app_clear_version', CLEAR_VERSION);
        console.log("One-time cache clear complete. Location reset.");
    }
}

// Create the AuthContext
const AuthContext = createContext();

// Elegant Self-Dismissing Toast Component for Premium User Feedback
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000); // 4000ms ensures the CSS animation has finished completely
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="toast-container">
            <div className="toast-notification">
                <span className="toast-icon">✓</span>
                <div className="toast-content">
                    <div className="toast-title">Data Loaded</div>
                    <div className="toast-message">{message}</div>
                </div>
                <button className="toast-close-btn" onClick={onClose} aria-label="Close">
                    ✕
                </button>
            </div>
        </div>
    );
};

export const AuthProvider = ({ children }) => {
    // Initialize states from localStorage/sessionStorage or provide default values
    const [localCity, setLocalCity] = useState(() => localStorage.getItem('city') || '');
    const [localDate, setLocalDate] = useState(() => sessionStorage.getItem('date') || new Date().toISOString().substring(0, 10));
    const [localLat, setLocalLat] = useState(() => {
        const savedLat = localStorage.getItem('lat');
        return savedLat ? parseFloat(savedLat) : null;
    });
    const [localLng, setLocalLng] = useState(() => {
        const savedLng = localStorage.getItem('lng');
        return savedLng ? parseFloat(savedLng) : null;
    });
    const [toast, setToast] = useState(null);

    // Function to update city, date, lat, and lng globally and in storage
    const setCityAndDate = (newCity, newDate, newLat = null, newLng = null) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        setLocalLat(newLat);
        setLocalLng(newLng);
        
        localStorage.setItem('city', newCity);
        sessionStorage.setItem('date', newDate);
        if (newLat !== null) localStorage.setItem('lat', newLat.toString());
        else localStorage.removeItem('lat');
        if (newLng !== null) localStorage.setItem('lng', newLng.toString());
        else localStorage.removeItem('lng');
    };

    // Keep storage updated if values change
    useEffect(() => {
        localStorage.setItem('city', localCity);
        sessionStorage.setItem('date', localDate);
        if (localLat !== null) localStorage.setItem('lat', localLat.toString());
        else localStorage.removeItem('lat');
        if (localLng !== null) localStorage.setItem('lng', localLng.toString());
        else localStorage.removeItem('lng');
    }, [localCity, localDate, localLat, localLng]);

    // Handle toast display
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToast({ id, message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    // Provide values to components consuming AuthContext
    return (
        <AuthContext.Provider value={{ 
            localCity, 
            localDate, 
            localLat, 
            localLng, 
            setCityAndDate,
            showToast
        }}>
            {children}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} key={toast.id} />}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

