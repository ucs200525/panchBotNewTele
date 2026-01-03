import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the spinner component
import TableScreenshot from '../components/TableScreenshot';
import CityAndDateInput from '../components/CityAndDateInput';


const PanchakaMuhurth = () => {
    
    const [city, setCity] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
    });

    const { localCity, localDate, setCityAndDate  } = useAuth();
    const [allMuhuratData, setAllMuhuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showAll, setShowAll] = useState(true); // State to toggle between all rows and filtered rows
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null);
    const [fetchCity, setfetchCity] = useState(false);
    // const saveToLocalStorage = (data) => {
    //     localStorage.setItem("muhurats", JSON.stringify(data));
    // };
    const handleCityChange = (newCity) => {
        setCity(newCity);
      };
    
      const handleDateChange = (newDate) => {
        setDate(newDate);
       
      };

    const createDummyTable = useCallback(() => {
        const dummyTable = filteredData.map((row) => {
            const [startTime, endTime] = row.time.split(" to ");

            let endTimeWithoutDate, endDatePart;

            if (endTime.includes(", ")) {
                [endTimeWithoutDate, endDatePart] = endTime.split(", ");
            } else {
                endTimeWithoutDate = endTime; // If no comma, the entire string is the time
                endDatePart = null;          // No date part available
            }

            const currentDate = new Date(date);
            let adjustedStartTime = startTime.includes("PM")
                ? `${startTime}`
                : startTime.includes("AM") && endTime.includes(",")
                    ? `${endDatePart} , ${startTime}`
                    : startTime;

            let adjustedEndTime = endTime.includes("AM") && endTime.includes(",")
                ? `${endDatePart} , ${endTimeWithoutDate}`
                : endTime.includes("PM")
                    ? `${endTimeWithoutDate}`
                    : endTime;

            const timeIntervalFormatted = `${adjustedStartTime} to ${adjustedEndTime}`;

            return {
                category: row.category,
                muhurat: row.muhurat,
                time: timeIntervalFormatted,
            };
        });

        // Save the dummy table in sessionStorage
        sessionStorage.setItem("muhurats", JSON.stringify(dummyTable));
        console.log("Dummy Table Saved: ", dummyTable);
    }, [filteredData, date]); // Memoize with filteredData and date as dependencies

    const autoGeolocation = async () => {
        // setIsLoading(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              try {
                const cityResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCityName/${lat}/${lng}`);
                if (!cityResponse.ok) {
                  throw new Error('Failed to fetch city name');
                }
                const cityData = await cityResponse.json();
                const cityName = cityData.cityName;
                console.log("cityData",cityData);
                setCity(cityName);
                setfetchCity(true);
              } catch (error) {
                setError(error.message || 'Error fetching city name');}
              //  finally {
              //   setIsLoading(false);
              // }
            },
            (error) => {
              setError('Geolocation error: ' + error.message);
           
            }
          );
          
        } else {
          setError('Geolocation is not supported by this browser.');
         
        }
      };
    
    const getMuhuratData = async () => {
        if (!city || !date) {
            await autoGeolocation();
            
            return;
        }

        if (!city ) {
            alert("City value is not correct,Please Enter Manually.")
            return;
        }

        setLoading(true); // Set loading to true before fetching data
        fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city, date })
        })
            .then(response => response.json())
            .then(data => {
                setAllMuhuratData(data);  // Store all the muhurat data
                console.log("Complete data", data);
                setFilteredData(data);  // Initially display all data
                setShowAll(true);       // Reset to showing all rows
                createDummyTable(); // Create the dummy table and save to localStorage
                setLoading(false);  // Set loading to false after data is fetched
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);  // Set loading to false in case of an error
            });
    };

    useEffect(() => {
        if (fetchCity) {
            getMuhuratData();
          setfetchCity(false); // Reset fetchData to prevent re-fetching immediately
        }
      }, [fetchCity]); // Runs when fetchData changes
    
    
  const checkAndFetchPanchangam = async () => {
    if (city && date) {
      await getMuhuratData();
      
    } else {
      await autoGeolocation();
      
    }
  };

    const filterGoodTimings = () => {
        const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
        setFilteredData(goodTimings);  // Render the table with filtered data
        setShowAll(false);             // Switch to filtered view
        createDummyTable(); // Create the dummy table for filtered data
    };

    const toggleShowAllRows = () => {
        if (showAll) {
            filterGoodTimings(); // If currently showing all rows, filter "Good Timings"
        } else {
            setFilteredData(allMuhuratData); // Reset to show all rows
            createDummyTable(); // Create the dummy table for all data
        }
        setShowAll(!showAll); // Toggle the state
    };

    const renderTableRows = (data) => {
        return data.map((item, index) => (
            <tr key={index}>
                <td>{`${item.muhurat} - ${item.category}`}</td>
                <td>{item.time}</td>
            </tr>
        ));
    };
    useEffect(() => {
        // Sync the state with AuthContext whenever city or date changes
        if (city !== localCity || date !== localDate) {
            setCityAndDate(city, date);
        }
    }, [city, date, localCity, localDate, setCityAndDate]);

    useEffect(() => {
        if (filteredData.length > 0) {
            createDummyTable(); // Save the dummy table to localStorage every time the filtered data is updated
        }
    }, [filteredData, createDummyTable]); // Now including createDummyTable in the dependency array



    return (
        <div className="PanchakaMuhurthContent">
            <h1>Panchaka Muhurat</h1>
            <div className="cityAndDate">
                <label htmlFor="city">City:</label>
                <input
                    type="text"
                    id="city"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <br />
                <label htmlFor="date">Date (DD/MM/YYYY):</label>
                <input
                    type="text"
                    id="date"
                    placeholder="Enter date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <br />

                {/* <CityAndDateInput
                        onCityChange={handleCityChange}
                        onDateChange={handleDateChange}
                        initialCity={city}
                        initialDate={date}
                    /> */}
                {/* <button onClick={getMuhuratData}>Get Muhurat</button> */}
                <button onClick={checkAndFetchPanchangam}>Get Muhurat</button>
                <button onClick={toggleShowAllRows}>
                    {showAll ? "Good Timings Only" : "Show All Rows"}
                </button>
            </div>

            {loading && <LoadingSpinner />} {/* Show the spinner when loading */}

            <h2>Result</h2>
            <table id="muhurats-table" border="1" cellspacing="0" cellpadding="5">
                <thead>
                    <tr>
                        <th>Muhurat and Category</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableRows(filteredData)}
                </tbody>
            </table>
            <TableScreenshot tableId="muhurats-table" city={city} />
        </div>
    );
};

export default PanchakaMuhurth;
