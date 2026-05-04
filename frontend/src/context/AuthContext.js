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

// Create the AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize states from localStorage or provide default values
    const [localCity, setLocalCity] = useState(() => localStorage.getItem('city') || '');
    const [localDate, setLocalDate] = useState(() => localStorage.getItem('date') || new Date().toISOString().substring(0, 10));
    const [localLat, setLocalLat] = useState(() => {
        const savedLat = localStorage.getItem('lat');
        return savedLat ? parseFloat(savedLat) : null;
    });
    const [localLng, setLocalLng] = useState(() => {
        const savedLng = localStorage.getItem('lng');
        return savedLng ? parseFloat(savedLng) : null;
    });

    // Function to update city, date, lat, and lng globally and in localStorage
    const setCityAndDate = (newCity, newDate, newLat = null, newLng = null) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        setLocalLat(newLat);
        setLocalLng(newLng);
        
        localStorage.setItem('city', newCity);
        localStorage.setItem('date', newDate);
        if (newLat !== null) localStorage.setItem('lat', newLat.toString());
        else localStorage.removeItem('lat');
        if (newLng !== null) localStorage.setItem('lng', newLng.toString());
        else localStorage.removeItem('lng');
    };

    // Keep localStorage updated if values change
    useEffect(() => {
        localStorage.setItem('city', localCity);
        localStorage.setItem('date', localDate);
        if (localLat !== null) localStorage.setItem('lat', localLat.toString());
        else localStorage.removeItem('lat');
        if (localLng !== null) localStorage.setItem('lng', localLng.toString());
        else localStorage.removeItem('lng');
    }, [localCity, localDate, localLat, localLng]);

    // Provide values to components consuming AuthContext
    return (
        <AuthContext.Provider value={{ 
            localCity, 
            localDate, 
            localLat, 
            localLng, 
            setCityAndDate 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
