import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import TableScreenshot from '../components/TableScreenshot';
import PanchangInfo from '../components/PanchangInfo';
import { findCurrentPeriod } from '../utils/periodHelpers';
import { CityAutocomplete } from '../components/forms';
// import { GanttTimeline } from '../components/GanttTimeline';

const TimeConverterApp = () => {
  const { localCity, localDate, localLat, localLng, setCityAndDate } = useAuth();
  const [tableHtml, setTableHtml] = useState('');
  const [city, setCity] = useState(localCity);
  const [date, setDate] = useState(localDate);
  const [lat, setLat] = useState(localLat);
  const [lng, setLng] = useState(localLng);

  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem('data');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [sunriseToday, setSunriseToday] = useState(() => localStorage.getItem('sunriseToday') || '05:00:00');
  const [sunsetToday, setSunsetToday] = useState(() => localStorage.getItem('sunsetToday') || '18:00:00');
  const [sunriseTmrw, setSunriseTmrw] = useState(() => localStorage.getItem('sunriseTmrw') || '06:00:00');

  const [weekday, setWeekday] = useState(() => localStorage.getItem('weekday') || '');
  const [tableData, setTableData] = useState([]);
  const [is12HourFormat, setIs12HourFormat] = useState(true);

  const [fetchData, setFetchData] = useState(false);
  const [fetchSuntimes, setfetchSuntimes] = useState(false);
  const [showNonBlue, setShowNonBlue] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Phase 2: Live Period Tracker States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(null);

  // Phase 1: Panchang Data State
  const [panchangData, setPanchangData] = useState(null);
  const [cityError, setCityError] = useState(false);


  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('sunriseToday', sunriseToday);
  }, [sunriseToday]);

  useEffect(() => {
    localStorage.setItem('sunsetToday', sunsetToday);
  }, [sunsetToday]);

  useEffect(() => {
    localStorage.setItem('sunriseTmrw', sunriseTmrw);
  }, [sunriseTmrw]);

  useEffect(() => {
    localStorage.setItem('weekday', weekday);
  }, [weekday]);

  useEffect(() => {
    // Sync with AuthContext and unified localStorage keys
    if (city !== localCity || date !== localDate || lat !== localLat || lng !== localLng) {
      setCityAndDate(city, date, lat, lng);
    }
  }, [city, date, lat, lng, localCity, localDate, localLat, localLng, setCityAndDate]);

  useEffect(() => {
    // Cleanup old keys if they exist
    localStorage.removeItem('cityName');
    localStorage.removeItem('currentDate');
  }, []);

  const autoGeolocation = async () => {
    alert("Please select a City and Date manually.");
  };

  const Getpanchangam = async () => {
    setIsLoading(true);
    try {
      console.log("API URL:", process.env.REACT_APP_API_URL);
      console.log("City:", city);
      console.log(" Date:", date);
      
      const queryParams = lat && lng ? `?lat=${lat}&lng=${lng}` : '';
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${city}/${date}${queryParams}`;
      console.log("Constructed API URL:", apiUrl);

      const response = await fetch(apiUrl);
      const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/getWeekday/${date}`);

      if (!response.ok || !response1.ok) {
        throw new Error('Failed to fetch Panchangam data');
      }

      const sunTimes = await response.json();
      const week = await response1.json();
      console.log("sunTime", sunTimes);
      setWeekday(week.weekday);
      setSunriseToday(sunTimes.sunTimes.sunriseToday);
      setSunsetToday(sunTimes.sunTimes.sunsetToday);
      setSunriseTmrw(sunTimes.sunTimes.sunriseTmrw);
      setFetchData(true);
    } catch (error) {
      setError(error.message || 'Failed to fetch Panchangam');
    }
    finally {
      setIsLoading(false);
    }
  };

  const checkAndFetchPanchangam = async () => {
    if (city && date) {
      setCityError(false);
      await Getpanchangam();
    } else if (!city) {
      setCityError(true);
    } else if (!date) {
      alert("Please select a Date manually.");
    }
  };




  useEffect(() => {
    if (fetchData) {
      fetchTableData();
      setFetchData(false); // Reset fetchData to prevent re-fetching immediately
    }
    if (fetchSuntimes) {
      Getpanchangam();
      // Fetch Panchang data (Tithi, Nakshatra, Rahu Kaal, etc.)
      async function fetchPanchangData() {
        if (!city || !date) return;
        
        try {
          const queryParams = lat && lng ? `&lat=${lat}&lng=${lng}` : '';
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(city)}&date=${date}${queryParams}`
          );
          const panchangResult = await response.json();
          setPanchangData(panchangResult);
          console.log('Panchang data:', panchangResult);
        } catch (error) {
          console.error('Error fetching Panchang data:', error);
        }
      }
      fetchPanchangData(); // Call the function
      setfetchSuntimes(false);
    }
  }, [fetchData, fetchSuntimes]); // Runs when fetchData changes

  const handleUpdateTableClick = () => {
    setFetchData(true); // Trigger the effect
  };

  // Function to check the current state (non-blue or all rows)
  const checkCurrentState = () => {
    return showNonBlue ? "Show Good Timings Only " : "All Rows";
  };
  const fetchTableData = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
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
        currentDate: date,
        showNonBlue,
      }),
    });

    const data1 = await response.json();
    console.log(data1.newTableData);
    setData(data1.newTableData || []);
  }

  useEffect(() => {
    console.log(`Currently showing: ${checkCurrentState()}`);
    fetchTableData();
    // Perform any additional actions when the state changes
  }, [showNonBlue]);

  // Toggle function for the button
  const toggleShowNonBlue = () => {
    setShowNonBlue((prev) => !prev);
  };

  const handleCityChange = (value) => {
    setCity(value);
    setLat(null);
    setLng(null);
    setCityError(false);
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setLat(selectedCity.lat);
    setLng(selectedCity.lng);
    setCityError(false);
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
          <CityAutocomplete
            value={city}
            onChange={handleCityChange}
            onSelect={handleCitySelect}
            placeholder="Enter city"
            hasError={cityError}
          />
          <label className="date">Enter Date:</label>
          <input
            className="enterdate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
      <div id="tableToCapture">
        <div className="info-inline">
          <div className="info-inline-item">
            <strong>City:</strong> {city}
          </div>
          <div className="info-inline-item">
            <strong>Date:</strong> {date}
          </div>
          <div className="info-inline-item">
            <strong>Weekday:</strong> {weekday}
          </div>
        </div>

        {/* Gantt Timeline
        {data && data.length > 0 && (
          <GanttTimeline
            data={(() => {
              const timelineData = [];
              data.forEach(item => {
                const category = item.isColored ? 'Danger Period' : item.isWednesdayColored ? 'Risk Period' : 'Good Timing';
                if (item.start1 && item.end1 && item.start1 !== '-' && item.end1 !== '-') {
                  timelineData.push({
                    muhurat: item.weekday,
                    category: category,
                    time: `${item.start1} to ${item.end1}`
                  });
                }
                if (item.start2 && item.end2 && item.start2 !== '-' && item.end2 !== '-') {
                  timelineData.push({
                    muhurat: item.weekday,
                    category: category,
                    time: `${item.start2} to ${item.end2}`
                  });
                }
              });
              return timelineData;
            })()}
            selectedDate={date}
          />
        )}
        */}
        {/* Panchang data moved to dedicated /panchang page */}

        <div>

          <table>
            <thead>
              <tr>
                <th>Start 1</th>
                <th>End 1</th>
                <th>{weekday}</th>
                <th>Start 2</th>
                <th>End 2</th>
                <th>S.No</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                // Check if this row is the current period
                const isSelectedToday = () => {
                  if (!date) return false;
                  const todayStr = new Date().toISOString().substring(0, 10);
                  return date === todayStr;
                };
                const currentPeriod = findCurrentPeriod(data, new Date());
                const isCurrentPeriod = isSelectedToday() && currentPeriod?.index === index;
                
                return (
                <tr 
                  key={index} 
                  style={isCurrentPeriod ? { backgroundColor: 'yellow', color: 'black' } : {}}
                >
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
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <TableScreenshot tableId="tableToCapture" city={city} />

    </div>

  );
};

export default TimeConverterApp;
