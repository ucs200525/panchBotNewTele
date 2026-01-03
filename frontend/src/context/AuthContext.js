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
    // Initialize states from sessionStorage or provide default values
    const [localCity, setLocalCity] = useState(() => sessionStorage.getItem('city') || '');
    const [localDate, setLocalDate] = useState(() => sessionStorage.getItem('date') || '');

    // Function to update city and date globally and in sessionStorage
    const setCityAndDate = (newCity, newDate) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        sessionStorage.setItem('city', newCity);
        sessionStorage.setItem('date', newDate);
    };

    // Keep sessionStorage updated if `localCity` or `localDate` changes
    useEffect(() => {
        sessionStorage.setItem('city', localCity);
        sessionStorage.setItem('date', localDate);
    }, [localCity, localDate]);

    // Provide values to components consuming AuthContext
    return (
        <AuthContext.Provider value={{ localCity, localDate, setCityAndDate }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
