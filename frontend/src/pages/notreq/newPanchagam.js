import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { findClosestDay } from '../components/weekdayColumn'; // Import the new component
import LoadingSpinner from '../components/LoadingSpinner'; // Import the spinner component
import { useAuth } from '../context/AuthContext';
import TableScreenshot from '../components/TableScreenshot';

const TimeConverterApp = () => {
  const { localCity, localDate, setCityAndDate  } = useAuth();
  const [tableHtml, setTableHtml] = useState('');
  const [data, setData] = useState([]);

  const [cityName, setCityName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));
  const [sunriseToday, setSunriseToday] = useState('05:00:00');
  const [sunsetToday, setSunsetToday] = useState('18:00:00');
  const [sunriseTmrw, setSunriseTmrw] = useState('06:00:00');
  const [weekday, setWeekday] = useState('Monday');
  const [tableData, setTableData] = useState([]);
  const [is12HourFormat, setIs12HourFormat] = useState(true);

  const [fetchData, setFetchData] = useState(false);
  const [fetchSuntimes, setfetchSuntimes] = useState(false);
  const [showNonBlue, setShowNonBlue] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  // const secondsToTime = (seconds) => {
  //   seconds = Math.round(seconds % 86400); // Ensure seconds is within a day
  //   let hrs = Math.floor(seconds / 3600); // Get hours
  //   const mins = Math.floor((seconds % 3600) / 60); // Get minutes
  //   const secs = seconds % 60; // Get seconds

  //   if (is12HourFormat) {
  //     const period = hrs >= 12 ? 'PM' : 'AM'; // Determine AM/PM
  //     hrs = hrs % 12 || 12; // Convert to 12-hour format, 0 becomes 12
  //     return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} ${period}`;
  //   } else {
  //     return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; // 24-hour format
  //   }
  // };
  const secondsToTime = (seconds) => {
    console.log("currentDate",currentDate);
    const baseDate = new Date(currentDate); // Ensure currentDate is a valid Date object
  
    // If seconds exceed a day, calculate the date and time
    const daysPassed = Math.floor(seconds / 86400); // Calculate how many full days have passed
    seconds = seconds % 86400; // Ensure seconds are within a day
    seconds = Math.round(seconds * 100) / 100; // Round seconds to 2 decimal places
  
    let hrs = Math.floor(seconds / 3600); // Get hours
    const mins = Math.floor((seconds % 3600) / 60); // Get minutes
    const secs = Math.round(seconds % 60); // Get seconds, rounded to the nearest second
  
    let timeString;
  
    // Convert to 12-hour format if needed
    if (is12HourFormat) {
      const period = hrs >= 12 ? 'PM' : 'AM'; // Determine AM/PM
      hrs = hrs % 12 || 12; // Convert to 12-hour format, 0 becomes 12
      timeString = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    } else {
      timeString = `${String(hrs).padStart(2, '00')}:${String(mins).padStart(2, '00')}:${String(secs).padStart(2, '00')}`; // 24-hour format
    }
  
    // If more than 1 day has passed, append the date, else just return the time
    if (daysPassed > 0) {
      baseDate.setDate(baseDate.getDate() + 1); // Add 1 day to currentDate
      const formattedDate = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Format the date like "Nov 29"
      timeString = ` ${formattedDate} , ${timeString}`; // Append the formatted date to the time string
    }
  
    return timeString;
  };
  

  
  const timeToSeconds = (time) => {
    const [hrs, mins, secs] = time.split(':').map(Number);
    return hrs * 3600 + mins * 60 + (secs || 0);
  };

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
            setCityName(cityName);
            setfetchSuntimes(true);
            
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

  const Getpanchangam = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${cityName}/${currentDate}`);
      const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/getWeekday/${currentDate}`);

      if (!response.ok || !response1.ok) {
        
        throw new Error('Failed to fetch Panchangam data');
      }

      const sunTimes = await response.json();
      const week = await response1.json();
      console.log("sunTime",sunTimes);
      setWeekday(week.weekday);
      setSunriseToday(sunTimes.sunTimes.sunriseToday);
      setSunsetToday(sunTimes.sunTimes.sunsetToday);
      setSunriseTmrw(sunTimes.sunTimes.sunriseTmrw);
      setFetchData(true);
    } catch (error) {
      setError(error.message || 'Failed to fetch Panchangam');}
    finally {
      setIsLoading(false);
    }
  };

  const checkAndFetchPanchangam = async () => {
    if (cityName && currentDate) {
      await Getpanchangam();
      setCityAndDate(cityName,currentDate);
    } else {
      await autoGeolocation();
      setCityAndDate(cityName,currentDate);
    }
  };

  //   // Store formatted data in localStorage
  //   useEffect(() => {
  //     if (tableData.length > 0) {
  //         const formattedData = tableData.map((row) => ({
  //             ...row,
  //             timeInterval1: row.start1 && row.end1 ? `${row.start1} to ${row.end1}` : "",
  //             timeInterval2: row.start2 && row.end2 ? `${row.start2} to ${row.end2}` : "",
  //         }));
         
  //         localStorage.setItem("panchangamTableData", JSON.stringify(formattedData));
  //     }
  // }, [tableData]);

// Store formatted data in localStorage

useEffect(() => {
  if (tableData.length > 0) {
      const dummyData = [];

      // Process the first 30 rows for timeInterval1
      for (let i = 0; i < 30; i++) {
          const row = tableData[i]; // Access the original row
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
          const row = tableData[i]; // Access the original row
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
      console.log("Formatted Dummy Data:", dummyData);
  }
}, [tableData]);


useEffect(async () => {
  // const fetchTableData = async () => {
  //     const requestData = {
  //         sunriseToday: '05:00:00',
  //         sunsetToday: '18:00:00',
  //         sunriseTmrw: '06:00:00',
  //         weekday: 'Monday'  // You can change the weekday accordingly
  //     };

  //     try {
  //         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json'
  //             },
  //             body: JSON.stringify(requestData)
  //         });

  //         if (response.ok) {

  //             const html = await response.text();
  //             console.log("html",html);
  //             setTableHtml(html);  // Set the response HTML to state
  //         } else {
  //             console.error('Error fetching the table:', response.statusText);
  //         }
  //     } catch (error) {
  //         console.error('Error:', error);
  //     }
  // };
  // fetchTableData();

  /////////////////////////////////////////////////////////////////////////////////////////////
  // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     sunriseToday: '05:00:00',
  //     sunsetToday: '18:00:00',
  //     sunriseTmrw: '06:00:00',
  //     weekday: 'Monday',
  //   }),
  // });
  
  // const data = await response.json();
  // console.log(data.newTableData);
  /////////////////////////////////////////////////////////////////////////////////////////////
//   const fetchTableData = async () => {
//   const response  = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       sunriseToday: '05:00:00',
//       sunsetToday: '18:00:00',
//       sunriseTmrw: '06:00:00',
//       weekday: 'Monday',
//     }),
//   });
// const result = await response.json();
// console.log(result); // Check the structure of the response
// setData(result);

// };
// fetchTableData();

}, []);

const fetchTableData = async () => {
  const response  = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sunriseToday: '05:00:00',
      sunsetToday: '18:00:00',
      sunriseTmrw: '06:00:00',
      weekday: 'Monday',
    }),
  });
  
  const data1 = await response.json();
  console.log(data1.newTableData);
  setData(data1.newTableData || []); 
}

useEffect(() => {
    if (fetchData) {
      updateTable();
      setFetchData(false); // Reset fetchData to prevent re-fetching immediately
    }
    if(fetchSuntimes){
      Getpanchangam();
      setfetchSuntimes(false);
    }
  }, [fetchData,fetchSuntimes]); // Runs when fetchData changes

  const handleUpdateTableClick = () => {
    setFetchData(true); // Trigger the effect
  };


  // Function to update the table based on inputs
  const updateTable = () => {
    console.log("hi",sunriseToday);
    console.log("hi1",sunsetToday);
    console.log("hi2",sunriseTmrw);

    const totalSec = timeToSeconds('24:00:00');
    const sunriseTodaySec = timeToSeconds(sunriseToday) ;
    const sunsetTodaySec = timeToSeconds(sunsetToday);
    const sunriseTmrwSec = timeToSeconds(sunriseTmrw) ;

    
  console.log("hi0",sunriseTodaySec);
  console.log("hi0",sunsetTodaySec);
  console.log("hi0",sunriseTmrwSec);

    const interval1 = (sunsetTodaySec - sunriseTodaySec) / 30;
    console.log("hi3",interval1);
    const interval2 = ((totalSec + sunriseTmrwSec) - sunsetTodaySec) / 30;
    console.log("hi4",interval2);
    const newTableData = [];
    let sunrise = sunriseTodaySec;
    let sunset = sunsetTodaySec;

    for (let i = 0; i < 30; i++) {
      const start1 = secondsToTime(sunrise);
      sunrise += interval1;
      const end1 = secondsToTime(sunrise);

      const start2 = secondsToTime(sunset) 
      sunset += interval2;
      const end2 = secondsToTime(sunset);

      const weekdayRows = {
        "Monday": [0, 5, 12, 13, 21, 26, 29],
        "Tuesday": [2, 3, 7, 8, 9, 11, 12, 13, 14, 15, 18, 20, 21, 22,24],
        "Wednesday": [0, 1, 4, 5, 6, 7, 9, 19, 27, 29], //28-
        "Thursday": [2, 5, 8,  14, 15, 16, 18, 19, 20, 23, 24, 27, 28],
        "Friday": [1, 4, 6, 8, 14, 16, 18, 19, 22, 23, 24, 25, 26, 28],
        "Saturday": [0, 8, 9, 11, 12, 17, 22, 23, 25],
        "Sunday": [2, 3, 4, 5, 10, 14, 16, 19, 21, 23,24,25, 28]
    };

      const closestDay=findClosestDay(weekday) ;

      const isColored = weekdayRows[closestDay]?.includes(i);
      const isWednesdayColored = closestDay === 'Wednesday' && i === 28; // 25th row (index 24)
      const weekdayValues = {
        "Sunday": [
            "ప్రయాణకార్యసిద్ధి", "విద్యాజయం", "ఉద్యోగ కష్టం", "శత్రువృద్ధి", "చోరభయం", "దుఃఖము", "అభీష్టసిద్ధి", "సౌఖ్యం-లాభం", 
            "వివాహాదిశుభాని", "మిత్రవృద్ధి", "మృత్యుభయం", "ఆరోగ్యం", "శుభకార్యజయం", "ప్రయత్నఫలం", "విషభయం", "ఉద్యోగం", 
            "జ్వరప్రాప్తి", "రాజసన్మానం", "ప్రయాణలాభము", "వివాదము", "మిత్రత్వము", "జ్వరభయము", "ధనలాభము", "బంధనం", 
            "స్థానభ్రంశము", "విద్యాభంగము", "స్త్రీ భోగం", "ప్రయాణ జయం", "ప్రయాణ నాశము", "భూలాభము"
        ],
        "Monday": [
            "కార్యహాని", "రాజపూజ్యత", "వాహన ప్రాప్తి", "స్త్రీ సౌఖ్యము", "భూలాభము", "స్థానభ్రంశము", "గుప్తధనలాభము", "వ్యవహారజయం", 
            "ఉద్యోగము", "ప్రియభోజనం", "స్త్రీ లాభము", "రాజదర్శనం", "కార్యభంగం", "రోగపీడ", "కార్యసిద్ధి", "శత్రునాశము", 
            "గో లాభము", "కార్యజయము", "ఆరోగ్యం", "మిత్రత్వము", "సౌఖ్యము", "కార్యభంగము", "వివాహజయం", "కార్యప్రాప్తి", 
            "ధనలాభము", "విద్యాలాభము", "స్థిరకార్యనాశము", "ఉద్యోగజయం", "యాత్రా ప్రాప్తి", "రాజభయం"
        ],
        "Tuesday": [
            "ధనలాభం", "ప్రయాణజయం", "దుఃఖము", "భూతభయము", "వాహనప్రాప్తి", "పరోపకారము", "వస్త్ర ప్రాప్తి", "ప్రయాణ నష్టం", 
            "వివాదహాని", "శత్రుబాధ", "స్త్రీ లాభము", "కార్యనాశనము", "కష్టం", "జంతు భయం", "అగ్నిబాధ", "రోగపీడ", 
            "పుత్రలాభము", "కార్యజయము", "చిక్కులు", "రాజ సన్మానం", "నమ్ము అగుట", "కార్యనష్టము", "అపజయం", "శత్రుజయం", 
            "ఉద్యోగహాని", "జయప్రదము", "కార్యసిద్ధి", "కార్యలాభం", "సుఖసౌఖ్యం", "మిత్రత్వము"
        ],
        "Wednesday": [
            "దుర్వార్తలు", "మనఃక్షోభం", "ధనలాభం", "యత్నకార్యసిద్ధి", "కార్యభంగము", "మహాభయము", "మనశ్చాంచల్యం", "ఉపద్రవములు", 
            "జయప్రదము", "ప్రయాణభయము", "రాజసన్మానము", "ధనధాన్యవృద్ధి", "ఉద్యోగజయం", "లాభము", "ప్రయత్నజయం", "వస్త్ర లాభం", 
            "సంతోషం", "క్షేమం", "స్వల్పలాభం", "కలహము", "ఇష్టసిద్ధి", "పుత్రలాభము", "ఉద్యోగజయం", "ప్రయాణజయం", 
            "వ్యవహారజయం", "వివాహశుభం", "కార్యజయం", "మనఃక్లేశము", "బంధుసమాగము", "వాహనప్రమాదం"
        ],
        "Thursday": [
            "ధనలాభం", "మనోభీష్టసిద్ధి", "అనారోగ్యం", "వాహన ప్రాప్తి", "వివాహశుభం", "సుఖనాశనం", "ఉద్యోగజయం", "స్వామిదర్శనం", 
            "ప్రయాణభంగం", "కార్యసిద్ధి", "వ్యాపారజయం", "శత్రునాశం", "వివాహజయం", "రోగనాశం", "కలహప్రదం", "ఉద్యోగ నష్టం", "కోపతీవ్రత",
            "కార్యజయం", "స్థాననాశం", "చోరభయం", "వివాహకలహం", "వివాదజయం", "యాత్రాశుభం", "ధైర్యహాని", "కార్యభంగం", 
            "ప్రయాణక్షేమం", "వివాహ శుభం", "కలహప్రదం", "జ్వరశస్త్రబాధ", "విద్యాభివృద్ధి"
        ],
        "Friday": [
            "కార్యసిద్ధి", "కార్యనాశము", "ధనలాభము", "రాజానుగ్రహం", "అపజయం", "కార్యజయం", "దుఃఖం-భయం","ధైర్యం", "కష్టం-నష్టం", 
            "సౌఖ్యము", "అనుకూలము", "వస్తువాహనప్రాప్తి", "క్షేమం-లాభం", "కార్యవిజయం", "శస్త్ర భయం", "శత్రునాశం", "అతిభయము", 
            "విద్యాసిద్ధి","రోగ బాధలు", "దుఃఖము", "వాహనప్రాప్తి", "స్త్రీ లాభము", "స్పోటకపీడ", "విషజంతుభయం", "ప్రయాణకష్టం", "శత్రుభయం", 
            "కార్యనష్టం", "ప్రయాణసౌఖ్యం", "దుఃఖము", "రాజసన్మానం"  ],
        "Saturday": [
            "కార్యహాని", "సౌఖ్యము", "వివాహసిద్ధి", "మిత్రత్వం", "ప్రయాణజయం", "వాహనలాభం", "కార్యజయం", "రాజసన్మానం", 
            "కార్యనష్టం", "ప్రయాణహాని", "వస్త్ర-స్త్రీలాభాలు", "మనశ్చాంచల్యం", "మిత్రనష్టం", "మిత్రప్రాప్తి", "స్త్రీ లాభం", 
            "ధనలాభము", "ప్రయాణజయం", "ప్రయాణ నష్టం", "క్షేమం", "వాహనయోగం", "జ్ఞానవృద్ధి", "వినోదము", "కలహము", 
            "ఉద్యోగనష్టం", "ప్రయత్నజయం", "మనస్తాపం", "శత్రునాశం", "విరోధనాశనం", "ప్రయాణ లాభం","ప్రియవార్తలు"
        ]
    };
      newTableData.push({
        start1,
        end1,
        start2,
        end2,
        sNo: i + 1,
        value1:i === 0 ? secondsToTime(interval1) :i === 1 ? secondsToTime(interval2) :i === 2 ? secondsToTime(totalSec) :  i === 3 ? 'sunriseToday' : i === 4 ? 'sunsetToday' : i === 5 ? 'sunriseTmrw' : '',
        value2: i === 3 ? sunriseToday : i === 4 ? sunsetToday : i === 5 ? sunriseTmrw : '',
        isColored,
        isWednesdayColored, // Add the new state for Wednesday coloring
        weekday: weekdayValues[closestDay][i] 
      });
    }

      newTableData.push({
        start1: sunsetToday,
        end1: '',
        weekday: '',
        start2: sunriseTmrw,
        end2: '',
        sNo: '', 
        value1: '',
        value2: '',
        isColored: false 
      });
  // Filter based on `showNonBlue` and set table data
  const filteredData = showNonBlue
    ? newTableData.filter((row) => !isBlue(row))
    : newTableData;

  setTableData(filteredData);
  };

  // Function to determine if a row is blue
  const isBlue = (row) => {
    return row.isColored && !row.isWednesdayColored; // Adjust logic to match your row styling rules
  };

  // Function to check the current state (non-blue or all rows)
  const checkCurrentState = () => {
    return showNonBlue ? "Show Good Timings Only " : "All Rows";
  };

  useEffect(() => {
    console.log(`Currently showing: ${checkCurrentState()}`);
    updateTable();
    // Perform any additional actions when the state changes
  }, [showNonBlue]);

  // Toggle function for the button
  const toggleShowNonBlue = () => {
    setShowNonBlue((prev) => !prev);
  };

 
  if (isLoading) {
    return <LoadingSpinner />; // Show spinner when loading
  }

  return (
    <div className="content">
      {error && <div className="error-message">{error}</div>}
  
      <div>
        <div style={{ textAlign: "center", margin: "20px" }}>
          <label className="entercity">Enter City Name:</label>
          <input
            className="city"
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          />
          <label className="date">Enter Date:</label>
          <input
            className="enterdate"
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
          <button className="get-panchangam-button" onClick={checkAndFetchPanchangam}>
            Get Panchangam
          </button>
        </div>
  
        <div style={{ textAlign: "center", margin: "20px" }}>
          <label className="sun">Sunrise Today:</label>
          <input
            className="sun"
            type="time"
            value={sunriseToday}
            onChange={(e) => setSunriseToday(e.target.value)}
          />
          <label className="sun"> Sunset Today:</label>
          <input
            className="sun"
            type="time"
            value={sunsetToday}
            onChange={(e) => setSunsetToday(e.target.value)}
          />
          <label className="sun">Sunrise Tomorrow:</label>
          <input
            className="sun"
            type="time"
            value={sunriseTmrw}
            onChange={(e) => setSunriseTmrw(e.target.value)}
          />
          <label className="sun">Weekday:</label>
          <input
            className="sun"
            type="text"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
          />
          <button className="sun" onClick={handleUpdateTableClick}>
            Update Table
          </button>
          <button
            className="format"
            onClick={() => {
              setIs12HourFormat(!is12HourFormat);
              handleUpdateTableClick();
            }}
          >
            {is12HourFormat ? "Switch to 24-hour" : "Switch to 12-hour"}
          </button>
          <button onClick={toggleShowNonBlue}>
            {showNonBlue ? "Show All Rows" : "Show Good Timings Only"}
          </button>
  
          <div className="information">
            <p>*</p>
            <div className="color-box" style={{ backgroundColor: "rgb(0, 32, 96)" }}></div>
            <div className="info">
              is considered as <strong>ashubh</strong> (inauspicious).
            </div>
          </div>
        </div>
      </div>
  
      <table id="tableToCapture">
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>{findClosestDay(weekday)}</th>
            <th>Start</th>
            <th>End</th>
            <th>S.No</th>
            <th>Value 1</th>
            <th>Value 2</th>
          </tr>
        </thead>
        <tbody>
          {tableData
            .filter((row) => !showNonBlue || !isBlue(row))
            .map((row, index) => (
              <tr key={index}>
                <td>{row.start1}</td>
                <td>{row.end1}</td>
                <td
                  style={{
                    backgroundColor: row.isWednesdayColored
                      ? "yellow"
                      : row.isColored
                      ? "#002060"
                      : "transparent",
                    color: row.isWednesdayColored || row.isColored ? "white" : "black",
                  }}
                >
                  {row.weekday}
                </td>
                <td>{row.start2}</td>
                <td>{row.end2}</td>
                <td>{row.sNo}</td>
                <td>{row.value1}</td>
                <td>{row.value2}</td>
              </tr>
            ))}
        </tbody>
      </table>
  
      <TableScreenshot tableId="tableToCapture" city={cityName} />

      <button className="get-panchangam-button" onClick={fetchTableData}>
            Get Data
          </button>
      <div>
      <h2>Dynamic Time Table</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Start 1</th>
            <th>End 1</th>
            <th>weekday</th>
            <th>Start 2</th>
            <th>End 2</th>
            <th>sNo</th>
            <th>value 1</th>
            <th>value2</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.start1}</td>
              <td>{item.end1}</td>
              <td
                  style={{
                    backgroundColor: item.isWednesdayColored
                      ? "yellow"
                      : item.isColored
                      ? "#002060"
                      : "transparent",
                    color: item.isWednesdayColored || item.isColored ? "white" : "black",
                  }}
                >
                  {item.weekday}
                  </td>
              <td>{item.start2}</td>
              <td>{item.end2}</td>
              <td>{item.sNo}</td>
              <td>{item.value1}</td>
              <td>{item.value2}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
 
    </div>

  );
  };

export default TimeConverterApp;
