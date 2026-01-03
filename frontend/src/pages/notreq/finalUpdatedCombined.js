import React, { useEffect, useState,useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import TableScreenshot from '../components/TableScreenshot';

const Combine = () => {
  const [showAll, setShowAll] = useState(true); 
      const [city, setCity] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
      const [date, setDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
    });

      const [sunriseToday, setSunriseToday] = useState('05:00:00');
      const [sunsetToday, setSunsetToday] = useState('18:00:00');
      const [sunriseTmrw, setSunriseTmrw] = useState('06:00:00');
      const [weekday, setWeekday] = useState('Monday');
      const [is12HourFormat, setIs12HourFormat] = useState(true);
    
      const [fetchData, setFetchData] = useState(false);
      const [fetchSuntimes, setfetchSuntimes] = useState(false);
      const [showNonBlue, setShowNonBlue] = useState(false);
    
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);
    
    const [muhuratData, setMuhuratData] = useState([]);
    const [panchangamData, setPanchangamData] = useState([]);

    const [finalData, setFinalData] = useState([]);
    const { localCity, localDate, setCityAndDate  } = useAuth();

    const [isCity, setIsCity] = useState(false);

    const [tableData, setTableData] = useState(false);
    const [BharagavaPanchagamData,setBharagavaPanchagamData] =  useState([]);

    const [DrikPanchagamData,setDrikPanchagamData] =  useState([]);


    useEffect(() => {
          const storedPanchangamData = sessionStorage.getItem("panchangamTableData");
          const storedMuhuratData = sessionStorage.getItem("muhurats");
          if (storedPanchangamData) {
            setPanchangamData(JSON.parse(storedPanchangamData));
            console.log("Stored Panchangam Data: ", JSON.parse(storedPanchangamData));
          }
               // Check if both parameters have data
        
             
               if (storedMuhuratData) {
                 setMuhuratData(JSON.parse(storedMuhuratData));
                 console.log("Stored Muhurat Data: ", JSON.parse(storedMuhuratData));
               }
      }, [BharagavaPanchagamData,DrikPanchagamData]); // The effect depends on both data arrays
    

//helper functions common
//1.autoGeolocation
//2.useeffect to get formated table

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
            setfetchSuntimes(true);
            setIsCity(true);
          } catch (error) {
            setError(error.message || 'Error fetching city name');}
          //  finally {
          //   setIsLoading(false);
          // }
        },
        (error) => {
          setError('Geolocation error: ' + error.message);
          setIsLoading(false);
        }
      );
      
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setIsCity(false);
    checkAndFetchPanchangam();
    
  }, [isCity]); 

      const createDummyTable = useCallback(() => {
          const dummyTable = DrikPanchagamData.map((row) => {
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
      }, [DrikPanchagamData]); // Memoize with filteredData and date as dependencies
  
  
//helper methods for bharagav pancahagam 
//1.Getpanchangam-- get sutimes and weekday and based on city and currentDate
//2.useeffect to get formated tabel
const Getpanchangam = async () => {
    try {
      setIsLoading(true);
  
      // Validate the date and format it
      if (!date || typeof date !== "string") {
        throw new Error("Invalid date format");
      }
  
      const parts = date.split("/");
      if (parts.length !== 3) {
        throw new Error("Date must be in dd/mm/yyyy format");
      }
  
      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to yyyy-mm-dd
  
      // Construct API URLs
      const sunTimesUrl = `${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${city}/${formattedDate}`;
      const weekdayUrl = `${process.env.REACT_APP_API_URL}/api/getWeekday/${formattedDate}`;
  
      // Fetch data
      const [response, response1] = await Promise.all([
        fetch(sunTimesUrl),
        fetch(weekdayUrl),
      ]);
  
      // Check for errors
      if (!response.ok || !response1.ok) {
        throw new Error("Failed to fetch Panchangam data");
      }
  
      // Parse JSON responses
      const sunTimes = await response.json();
      const week = await response1.json();
  
      // Log and set state
      console.log("Stored sun times:", sunTimes);
      console.log("Stored weekday:", week);
  
      setWeekday(week.weekday);
      setSunriseToday(sunTimes.sunTimes.sunriseToday);
      setSunsetToday(sunTimes.sunTimes.sunsetToday);
      setSunriseTmrw(sunTimes.sunTimes.sunriseTmrw);
      setFetchData(true);
    } catch (error) {
      setError(error.message || "Failed to fetch Panchangam");
      console.error("Error fetching Panchangam:", error);
    } finally {
      setIsLoading(false);
    }
  };
  


  useEffect(() => {
    if (BharagavaPanchagamData.length > 0) {
      const dummyData = [];

      // Process the first 30 rows for timeInterval1
      for (let i = 0; i < 30; i++) {
          const row = BharagavaPanchagamData[i]; // Access the original row
          if (row) {
            const start1 = row.start1 ? row.start1.split(",")[0].trim() : ""; // Trim date from start
            dummyData.push({
                sNo: i + 1,
                start1: row.start1 || "",
                end1: row.end1 || "",
                start2: row.start2 || "", // Set as empty if unavailable
                end2: row.end2 || "",
                timeInterval1: row.start1 && row.end1 ? `${row.start1} to ${row.end1}` : "",
                timeInterval2: "", // Leave blank for these rows
                weekday: row.weekday || "-",
                value1: row.value1 || "",
                value2: row.value2 || "",
                isColored: row.isColored || false,
                isWednesdayColored: row.isWednesdayColored || false,
            });
          }
      }

      // Process the next 30 rows for timeInterval2
      for (let i = 0; i < 30; i++) {
          const row = BharagavaPanchagamData[i]; // Access the original row
          if (row) {
              const start2 = row.start2 ? row.start2.split(",")[0].trim() : ""; // Trim date from start2
              dummyData.push({
                  sNo: i + 1,
                  start1: "", // Leave blank for these rows
                  end1: "",
                  start2: row.start2 || "",
                  end2: row.end2 || "",
                  timeInterval1: start2 && row.end2 ? `${row.start2} to ${row.end2}` : "",
                  timeInterval2: "", // Leave blank for these rows
                  weekday: row.weekday || "-",
                  value1: row.value1 || "",
                  value2: row.value2 || "",
                  isColored: row.isColored || false,
                  isWednesdayColored: row.isWednesdayColored || false,
              });
          }
      }

      // Store the formatted data in sessionStorage
      sessionStorage.setItem("panchangamTableData", JSON.stringify(dummyData));
      console.log("Formatted Bharagava Panchagam Data:", dummyData);
    }
  }, [BharagavaPanchagamData]); // Runs the effect when `BharagavaPanchagamData` changes



const checkAndFetchPanchangam = async () => {
    if (city && date) {
      await getPanchangamData();  
    } else {
      await autoGeolocation();  
    }
  };

const getPanchangamData = async () => {
    await getBharagvData();
    await Getpanchangam();
    await getDrikTable();
  }


const getBharagvData = async () => {
    
    
        const response  = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            sunriseToday,
            sunsetToday,
            sunriseTmrw,
            weekday,
            is12HourFormat,
            date,
            showNonBlue,
            }),
        });
       
        const data1 = await response.json();
        console.log("Bharagav Data",data1.newTableData);
        setBharagavaPanchagamData(data1.newTableData ); 
       
}




const getDrikTable = async () => {
    // if (!city || !date) {
    //     await autoGeolocation();
    //     return;
    // }

    // if (!city ) {
    //     alert("City value is not correct,Please Enter Manually.")
    //     return;
    // }

    
    fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, date })
    })
        .then(response => response.json())
        .then(data => {
            setDrikPanchagamData(data);  // Store all the muhurat data
            console.log("Complete data", data);
            // setFilteredData(data);  // Initially display all data
            // setShowAll(true);       // Reset to showing all rows
            createDummyTable(); // Create the dummy table and save to localStorage
              
        })
        .catch(error => {
            console.error("Error fetching data:", error);
           
        });

};





















// Helper function to parse time strings (without seconds)
const parseTime = (timeStr, baseDate, isNextDay = false) => {
    if (!timeStr) return null;

    const [time, period] = timeStr.trim().split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(baseDate);

    // Set hours and minutes
    date.setHours(
        period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours,
        minutes || 0,
        0 // Ignore seconds
    );

    // Increment day if `isNextDay` is true
    if (isNextDay) date.setDate(date.getDate() + 1);

    return date;
};

// Function to split intervals and handle incomplete intervals
const splitInterval = (interval, baseDate) => {
    if (!interval || interval.trim() === "") return [null, null];

    const [start, end] = interval.split(" to ");
    if (!start || !end) return [null, null];

    // Check if `start` or `end` specifies the next day
    const isNextDayStart = start.includes(","); // Indicates start is on the next day
    const startTime = start.replace(/.*?,/, "").trim(); // Remove date prefix if present

    const isNextDayEnd = end.includes(","); // Indicates end is on the next day
    const endTime = end.replace(/.*?,/, "").trim(); // Remove date prefix if present

    return [
        parseTime(startTime, baseDate, isNextDayStart), // Pass `isNextDay` for start
        parseTime(endTime, baseDate, isNextDayEnd),     // Pass `isNextDay` for end
    ];
};

    // Function to validate time interval
    const validateInterval = (start, end) => {
        if (!start || !end) {
            console.log("Invalid Interval:", start, end);
            return false;
        }
        console.log("Valid Interval:", start, end);
        return true;
    };
// Combine Muhurat and Panchangam data
useEffect(() => {
    const today = new Date();
    const mergedData = [];
    let i = 0;
    console.log("Processing Panchangam Data...");

    // Iterate through Muhurat Data first
    muhuratData.forEach((muhuratItem) => {
        const [muhuratStart, muhuratEnd] = splitInterval(muhuratItem.time, today);
        console.log("muhuratStart: ", muhuratStart);
        console.log("muhuratEnd: ", muhuratEnd);
        if (muhuratStart && muhuratEnd && validateInterval(muhuratStart, muhuratEnd)) {
            console.log("Valid Muhurat Interval: ", muhuratItem);

            // Temporary array to collect weekday objects for this Muhurat
            const weekdaysArray = [];

            // Now iterate through Panchangam data
            panchangamData.forEach((panchangamItem) => {
                const timeInterval = panchangamItem.timeInterval1; // Only use timeInterval1
                const [start, end] = splitInterval(timeInterval, today);
                console.log("CheckOKK: ", start);
                console.log("endcheck: ", end);
                if (start && end && validateInterval(start, end)) {
                    console.log("Valid Panchangam Interval: ", panchangamItem);

                    // Check if Panchangam falls within any Muhurat interval
                    if (start <= muhuratEnd && end >= muhuratStart) {
                        // Add unique weekday values as objects to the temporary array
                        if (!weekdaysArray.find((item) => item.weekday === panchangamItem.weekday)) {
                            weekdaysArray.push({
                                weekday: panchangamItem.weekday,
                                time: `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`,
                            });
                        }
                    }
                } else {
                    console.log("Invalid Panchangam Interval:", panchangamItem);
                }
            });

            // After collecting weekdays, add to mergedData
            mergedData.push({
                sno: i + 1,
                type: "Muhurat",
                description: `${muhuratItem.muhurat} - ${muhuratItem.category}`,
                timeInterval: muhuratItem.time,
                weekdays: weekdaysArray.length > 0 ? weekdaysArray : [{ weekday: "-", time: "-" }], // Add as nested rows
            });
            i++;
        } else {
            console.log("Invalid Muhurat Interval:", muhuratItem);
        }
    });

    console.log("Processing Muhurat Data...");
    console.log("Final Merged Data: ", mergedData);
    setFinalData(mergedData);
}, [muhuratData, panchangamData]);



    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ textAlign: "center" }}>Combined Good Timings</h1>
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

                <button onClick={checkAndFetchPanchangam}>Get Muhurat</button>
 
            </div>

            {finalData.length > 0 ? (
                <table id="muhurats-table"
                    border="1"
                    cellSpacing="0"
                    cellPadding="5"
                    style={{ width: "100%", textAlign: "left" }}
                >
                    <thead>
                        <tr>
                            <th>SNO</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Time & Interval</th>
                            <th>Weekday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.sno}</td>
                                <td>{item.type}</td>
                                <td>{item.description}</td>
                                <td>{item.timeInterval}</td>
                                <td>
                                    {item.weekdays.length === 1 && item.weekdays[0].weekday === "-" ? (
                                        "-" // Display "-" when no weekdays are available
                                    ) : (
                                        <table style={{ width: "100%", border: "none" }}>
                                            <tbody>
                                                {item.weekdays.map((weekdayItem, subIndex) => (
                                                    <tr key={subIndex}>
                                                        <td style={{ border: "none", padding: "0" }}>
                                                            <strong>{weekdayItem.weekday}</strong>:{" "}
                                                            {weekdayItem.time}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: "center" }}>
                    No data available. Please fetch data from the relevant pages.(Select Good Timings only option)
                </p>
            )}
                 <TableScreenshot tableId="muhurats-table" city={city} />
        </div>
    );
    
};

export default Combine;
