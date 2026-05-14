import React, { useState, useEffect } from 'react';
import TableScreenshot from '../components/TableScreenshot';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { CityAutocomplete } from '../components/forms';
// import { GanttTimeline } from '../components/GanttTimeline';
import { parseTimeToMinutes } from '../utils/periodHelpers';

const CombinePage = () => {
  const { localCity, localDate, localLat, localLng, setCityAndDate } = useAuth();
  const [city, setCity] = useState(localCity);
  const [date, setDate] = useState(localDate);
  const [lat, setLat] = useState(localLat);
  const [lng, setLng] = useState(localLng);
  const [combinedData, setCombinedData] = useState(() => {
    const storedData = localStorage.getItem('combinedData');
    return storedData ? JSON.parse(storedData) : null;
  });
  
  const [muhurthaData, setMuhurthaData] = useState(null);
  const [fetchCity, setFetchCity] = useState(false); // Track whether city was auto-fetched
  const [fetchData, setFetchData] = useState(false);
  const [bharagvData, setBharagvData] = useState(null);
  const [allBharagvData, setAllBharagvData] = useState(null); // Unfiltered, for Gantt timeline
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weekday, setWeekday] = useState(() => localStorage.getItem('weekday') || '');
  const [showNonBlue, setShowNonBlue] = useState(true);  // default to true
  const [is12HourFormat, setIs12HourFormat] = useState(true); // default to true
  const [cityError, setCityError] = useState(false);



  useEffect(() => {
    localStorage.setItem('combinedData', JSON.stringify(combinedData));
  }, [combinedData]);

  useEffect(() => {
    localStorage.setItem('weekday', weekday);
  }, [weekday]);

  useEffect(() => {
    // Sync with AuthContext and unified keys
    if (city !== localCity || date !== localDate || lat !== localLat || lng !== localLng) {
      setCityAndDate(city, date, lat, lng);
    }
  }, [city, date, lat, lng, localCity, localDate, localLat, localLng, setCityAndDate]);




  const autoGeolocation = async () => {
    alert("Please select a City and Date manually.");
  };

  const handleCityChange = (value) => {
    setCity(value);
    setLat(null);
    setLng(null);
    setFetchCity(false); // Reset fetchCity if user provides a manual input
    setCityError(false);
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setLat(selectedCity.lat);
    setLng(selectedCity.lng);
    setFetchCity(false);
    setCityError(false);
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
      setCityError(false);
      await fetchMuhuratData();
    } else if (!city) {
      setCityError(true);
    } else if (!date) {
      alert("Please select a Date manually.");
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

      const latParam = lat !== null && lat !== undefined ? `&lat=${lat}` : '';
      const lngParam = lng !== null && lng !== undefined ? `&lng=${lng}` : '';

      // Fetch Muhurat, filtered Bharagv (for table), and unfiltered Bharagv (for Gantt timeline)
      const [muhurthaResponse, bharagvResponse, allBharagvResponse] = await Promise.all([
        fetch(
            `${process.env.REACT_APP_API_URL}/api/getDrikTable?city=${city}&date=${convertToDDMMYYYY(date)}&goodTimingsOnly=${showNonBlue}&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
          ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${city}&date=${date}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
        ),
        // Always fetch ALL rows (showNonBlue=false) for the Gantt timeline so danger/good colors show correctly
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${city}&date=${date}&showNonBlue=false&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
        ),
      ]);

      // Parse the responses as JSON
      const muhurthaData = await muhurthaResponse.json();
      const bharagvData = await bharagvResponse.json();
      const allBharagvData = await allBharagvResponse.json();

      console.log("DATA Muhurat", muhurthaData);
      console.log("DATA Bharagv", bharagvData);
      console.log("DATA AllBharagv (for Gantt)", allBharagvData);

      setMuhurthaData(muhurthaData);
      setBharagvData(bharagvData);
      setAllBharagvData(allBharagvData);

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
          is12HourFormat: is12HourFormat,
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
        <CityAutocomplete
          value={city}
          onChange={handleCityChange}
          onSelect={handleCitySelect}
          placeholder="Enter city"
          hasError={cityError}
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
          12 Hour Format:
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
  
      {loading && <LoadingSpinner message="Fetching Muhurat Data..." />}
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

      {/* Gantt Timeline — uses unfiltered allBharagvData so all colored/danger rows show
      {allBharagvData && Array.isArray(allBharagvData) && allBharagvData.length > 0 && (
        <GanttTimeline 
          data={allBharagvData
            .filter(item => item.timeInterval1 && item.timeInterval1.trim() !== '')
            .map(item => ({
              muhurat: item.weekday || '-',
              category: item.isColored ? 'Danger Period' : item.isWednesdayColored ? 'Risk Period' : 'Good Timing',
              time: item.timeInterval1
            }))} 
          selectedDate={date} 
          showNonBlueOnly={showNonBlue}
        />
      )}
      */}
  
      {combinedData && !loading && (() => {
        const isSelectedToday = () => {
          if (!date) return false;
          const todayStr = new Date().toISOString().substring(0, 10);
          return date === todayStr;
        };

        const isRowCurrentPeriod = (timeInterval) => {
          if (!timeInterval || !timeInterval.includes(' to ')) return false;
          const [startStr, endStr] = timeInterval.split(' to ');
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const startMinutes = parseTimeToMinutes(startStr);
          const endMinutes = parseTimeToMinutes(endStr);
          if (startMinutes === null || endMinutes === null) return false;
          
          if (endMinutes < startMinutes) {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
          }
          return currentMinutes >= startMinutes && currentMinutes < endMinutes;
        };

        const todayActive = isSelectedToday();

        return (
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
              {combinedData.map((row, index) => {
                const isCurrentPeriod = todayActive && isRowCurrentPeriod(row.timeInterval);
                return (
                  <React.Fragment key={index}>
                    <tr style={isCurrentPeriod ? { backgroundColor: 'yellow', color: 'black' } : {}}>
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
                );
              })}
            </tbody>
          </table>
        );
      })()}
  
      {combinedData && !loading && <TableScreenshot tableId="tableToCapture" city={city} date={date} weekday={weekday} />}
    </div>
    </div>
  );
};

export default CombinePage;
