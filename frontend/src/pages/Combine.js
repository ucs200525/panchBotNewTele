import React, { useState, useEffect } from 'react';
import TableScreenshot from '../components/TableScreenshot';

const CombinePage = () => {
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [combinedData, setCombinedData] = useState(() => {
    const storedData = sessionStorage.getItem('combinedData');
    return storedData ? JSON.parse(storedData) : null;
  });
  
  const [muhurthaData, setMuhurthaData] = useState(null);
  const [fetchCity, setFetchCity] = useState(false); // Track whether city was auto-fetched
  const [fetchData, setFetchData] = useState(false);
  const [bharagvData, setBharagvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weekday, setWeekday] = useState(() => sessionStorage.getItem('weekday') || '');
  const [showNonBlue, setShowNonBlue] = useState(true);  // default to true
  const [is12HourFormat, setIs12HourFormat] = useState(true); // default to true


  useEffect(() => {
    sessionStorage.setItem('city', city);
    sessionStorage.setItem('date', date);
    sessionStorage.setItem('combinedData', JSON.stringify(combinedData));
    sessionStorage.setItem('weekday', weekday);
  }, [city, date, combinedData, weekday]);


  const autoGeolocation = async () => {
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
            console.log('cityData', cityData);
            setCity(cityName);
            setFetchCity(true);
            setFetchData(true);
          } catch (error) {
            setError(error.message || 'Error fetching city name');
          }
        },
        (error) => {
          setError('Geolocation error: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setFetchCity(false); // Reset fetchCity if user provides a manual input
  };


  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleShowNonBlueChange = (e) => {
    setShowNonBlue(e.target.checked);
  };

  const handle12HourFormatChange = (e) => {
    setIs12HourFormat(e.target.checked);
  };

  const convertToDDMMYYYY = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const checkAndFetchPanchangam = async () => {
    if (city && date) {
      await fetchMuhuratData();
      // setCityAndDate(cityName,currentDate);
    } else {
      await autoGeolocation();
      // setCityAndDate(cityName,currentDate);
    }
  };

    
    useEffect(() => {
        if (fetchData) {
          fetchMuhuratData();
          setFetchData(false); // Reset fetchData to prevent re-fetching immediately
       
        }
      }, [fetchData]); // Runs when fetchData changes
    
  
  // Fetch Muhurat and Bharagv Data together
  const fetchMuhuratData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Set goodTimingsOnly to true by default
      const goodTimingsOnly = true;

      // Fetch both Muhurat and Bharagv Data with updated parameters
      const [muhurthaResponse, bharagvResponse] = await Promise.all([
        fetch(
            `${process.env.REACT_APP_API_URL}/api/getDrikTable?city=${city}&date=${convertToDDMMYYYY(date)}&goodTimingsOnly=${showNonBlue}`
          ),
          
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${city}&date=${date}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}`
        ),
      ]);

      // Parse the responses as JSON
      const muhurthaData = await muhurthaResponse.json();
      const bharagvData = await bharagvResponse.json();

      console.log("DATA Muhurat", muhurthaData);
      console.log("DATA Bharagv", bharagvData);

      setMuhurthaData(muhurthaData);
      setBharagvData(bharagvData);

      // Combine the fetched data
      const combinedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/combine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          muhuratData: muhurthaData,
          panchangamData: bharagvData,
          city: city,
          date: date,
        }),
      });
      const combinedData = await combinedResponse.json();
      console.log("DATA combinedData", combinedData);
      setCombinedData(combinedData);

      // Calculate weekday
      const weekday = new Date(date).toLocaleString('en-US', { weekday: 'long' });
      setWeekday(weekday);
    } catch (error) {
      setError("Error fetching data. Please try again.");
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="content">
      {error && <div className="error-message">{error}</div>}
  
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <h1>Combined Muhurat and Bharagv Table</h1>
        <label className="entercity">Enter City Name:</label>
        <input
          className="city"
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city"
        />
      </div>
  
      <div style={{ textAlign: "center", margin: "20px" }}>
        <label className="date">Enter Date:</label>
        <input
          className="enterdate"
          type="date"
          value={date}
          onChange={handleDateChange}
          style={{
            padding: "10px",
            border: "1px solid #cccccc",
            borderRadius: "5px",
            fontSize: "16px",
            margin: "10px 0",
          }}
        />
      </div>

      <div style={{ textAlign: "center", margin: "20px" }}>
        <label className="showNonBlue">
            Good Timings only :
          <input
            type="checkbox"
            checked={showNonBlue}
            onChange={handleShowNonBlueChange}
          />
        </label>
        <label className="is12HourFormat">
          12 Hour Format(NOT WORKING AT PRESENT):
          <input
            type="checkbox"
            checked={is12HourFormat}
            onChange={handle12HourFormatChange}
          />
        </label>
      </div>
  
      <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
        <button
          className="fetch-btn"
          onClick={checkAndFetchPanchangam}
          disabled={loading}
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background-color 0.3s ease",
          }}
        >
          {loading ? "Fetching Data..." : "Get Muhurat"}
        </button>
      </div>
  
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
  <div id="tableToCapture">
      {/* Inline City, Date, Weekday Info (Compact Layout) */}
      {combinedData && !loading && (
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
      )}
  
      {combinedData && !loading && (
        <table >
          <thead>
            <tr>
              <th>SNO</th>
              <th>TYPE</th>
              <th>DESCRIPTION</th>
              <th>TIME & INTERVAL</th>
              <th>WEEKDAY</th>
            </tr>
          </thead>
          <tbody>
            {combinedData.map((row, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>{row.sno}</td>
                  <td>{row.type}</td>
                  <td>{row.description}</td>
                  <td>{row.timeInterval}</td>
                  <td>
                    {row.weekdays && row.weekdays.length > 0 ? (
                      <table>
                        <tbody>
                          {row.weekdays.map((weekday, subIndex) => (
                            <tr key={subIndex}>
                              <td><strong>{weekday.weekday}</strong>: {weekday.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
  
      {combinedData && !loading && <TableScreenshot tableId="tableToCapture" city={city} date={date} weekday={weekday} />}
    </div>
    </div>
  );
};

export default CombinePage;
