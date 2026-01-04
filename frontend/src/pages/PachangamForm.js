import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import TableScreenshot from '../components/TableScreenshot';
import LivePeriodTracker from '../components/LivePeriodTracker';
import PanchangInfo from '../components/PanchangInfo';
import { findCurrentPeriod } from '../utils/periodHelpers';

const TimeConverterApp = () => {
  const { localCity, localDate, setCityAndDate } = useAuth();
  const [tableHtml, setTableHtml] = useState('');
  const [cityName, setCityName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));

  const [data, setData] = useState(() => {
    const storedData = sessionStorage.getItem('data');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [sunriseToday, setSunriseToday] = useState(() => sessionStorage.getItem('sunriseToday') || '05:00:00');
  const [sunsetToday, setSunsetToday] = useState(() => sessionStorage.getItem('sunsetToday') || '18:00:00');
  const [sunriseTmrw, setSunriseTmrw] = useState(() => sessionStorage.getItem('sunriseTmrw') || '06:00:00');

  const [weekday, setWeekday] = useState(() => sessionStorage.getItem('weekday') || '');
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


  useEffect(() => {
    sessionStorage.setItem('data', JSON.stringify(data));
    sessionStorage.setItem('sunriseToday', sunriseToday);
    sessionStorage.setItem('sunsetToday', sunsetToday);
    sessionStorage.setItem('sunriseTmrw', sunriseTmrw);
    sessionStorage.setItem('weekday', weekday);
  }, [data, sunriseToday, sunsetToday, sunriseTmrw, weekday]);

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
            console.log("cityData", cityData);
            console.log("cityResponse", cityResponse);
            setCityName(cityName);
            setfetchSuntimes(true);

          } catch (error) {
            setError(error.message || 'Error fetching city name');
          }
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
      console.log("API URL:", process.env.REACT_APP_API_URL);
      console.log("City:", cityName);
      console.log(" Date:", currentDate);
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${cityName}/${currentDate}`;
      console.log("Constructed API URL:", apiUrl);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${cityName}/${currentDate}`);
      const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/getWeekday/${currentDate}`);

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
    if (cityName && currentDate) {
      await Getpanchangam();
      // setCityAndDate(cityName,currentDate);
    } else {
      await autoGeolocation();
      // setCityAndDate(cityName,currentDate);
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
        if (!cityName || !currentDate) return;
        
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/getPanchangData?city=${encodeURIComponent(cityName)}&date=${currentDate}`
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
        currentDate,
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
      <div id="tableToCapture">
        <div className="info-inline">
          <div className="info-inline-item">
            <strong>City:</strong> {cityName}
          </div>
          <div className="info-inline-item">
            <strong>Date:</strong> {currentDate}
          </div>
          <div className="info-inline-item">
            <strong>Weekday:</strong> {weekday}
          </div>
        </div>

        {/* Phase 2: Live Period Tracker - Only shows for TODAY */}
        {data && data.length > 0 && <LivePeriodTracker data={data} selectedDate={currentDate} />}

        {/* Phase 1: Panchang Information Display */}
        {panchangData && <PanchangInfo data={panchangData} />}

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
                {/* <th>value 1</th>
            <th>value2</th> */}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                // Check if this row is the current period
                const currentPeriod = findCurrentPeriod(data, new Date());
                const isCurrentPeriod = currentPeriod?.index === index;
                
                return (
                <tr key={index} className={isCurrentPeriod ? 'current-period-row' : ''}>
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
                  {/* <td>{item.value1}</td>
              <td>{item.value2}</td> */}

                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <TableScreenshot tableId="tableToCapture" city={cityName} />

    </div>

  );
};

export default TimeConverterApp;
