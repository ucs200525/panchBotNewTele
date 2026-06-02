import React, { useState, useEffect } from 'react';
import TableScreenshot from '../components/TableScreenshot';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { CityAutocomplete } from '../components/forms';
// import { GanttTimeline } from '../components/GanttTimeline';
import { parseTimeToMinutes } from '../utils/periodHelpers';

const CombineSwiss = () => {
  const { localCity, localDate, localLat, localLng, setCityAndDate, showToast } = useAuth();
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic real-time clock to update the active yellow highlighted row instantly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Ticks every 10 seconds
    return () => clearInterval(timer);
  }, []);

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
    if (!date) {
      alert("Please select a Date manually.");
      return;
    }
    setCityError(false);
    await fetchMuhuratData();
  };

    
    useEffect(() => {
        if (fetchData) {
          fetchMuhuratData();
          setFetchData(false); // Reset fetchData to prevent re-fetching immediately
        }
      }, [fetchData]); // Runs when fetchData changes

    
  
  const fetchCombineFromAPI = async (fetchCity, fetchDate, fetchLat, fetchLng) => {
    setLoading(true);
    setError(null);
    try {
      const goodTimingsOnly = true;
      const latParam = fetchLat !== null && fetchLat !== undefined ? `&lat=${fetchLat}` : '';
      const lngParam = fetchLng !== null && fetchLng !== undefined ? `&lng=${fetchLng}` : '';

      const [muhurthaResponse, bharagvResponse, allBharagvResponse] = await Promise.all([
        fetch(
            `${process.env.REACT_APP_API_URL}/api/getDrikTableSwiss?city=${fetchCity}&date=${convertToDDMMYYYY(fetchDate)}&goodTimingsOnly=${showNonBlue}&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
          ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${fetchCity}&date=${fetchDate}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
        ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${fetchCity}&date=${fetchDate}&showNonBlue=false&is12HourFormat=${is12HourFormat}${latParam}${lngParam}`
        ),
      ]);

      const muhurthaData = await muhurthaResponse.json();
      const bharagvData = await bharagvResponse.json();
      const allBharagvData = await allBharagvResponse.json();

      setMuhurthaData(muhurthaData);
      setBharagvData(bharagvData);
      setAllBharagvData(allBharagvData);

      const combinedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/combine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          muhuratData: muhurthaData,
          panchangamData: bharagvData,
          city: fetchCity,
          date: fetchDate,
          is12HourFormat: is12HourFormat,
        }),
      });
      const combinedData = await combinedResponse.json();
      setCombinedData(combinedData);
      showToast(`Combined Muhurat (Bharagva panchagam + Panchaka rahitha muhurtham) successfully fetched and updated in UI for ${fetchDate}!`);

      const weekday = new Date(fetchDate).toLocaleString('en-US', { weekday: 'long' });
      setWeekday(weekday);
    } catch (error) {
      setError("Error fetching data. Please try again.");
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuhuratData = async () => {
    if (!date) {
        alert("Please select a Date manually.");
        return;
    }

    if (!city) {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const newLat = position.coords.latitude;
                    const newLng = position.coords.longitude;
                    try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCityName/${newLat}/${newLng}`);
                        if (!response.ok) throw new Error('Failed to fetch city name');
                        const data = await response.json();
                        
                        setCity(data.cityName);
                        setLat(newLat);
                        setLng(newLng);
                        setCityAndDate(data.cityName, date, newLat, newLng);
                        
                        fetchCombineFromAPI(data.cityName, date, newLat, newLng);
                    } catch (error) {
                        console.error("Error fetching city from geolocation:", error);
                        alert("Could not determine city from your location. Please enter manually.");
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Geolocation failed or permission denied. Please enter city manually.");
                    setLoading(false);
                }
            );
            return;
        } else {
            alert("Geolocation is not supported by your browser. Please enter City Manually.");
            return;
        }
    }

    fetchCombineFromAPI(city, date, lat, lng);
  };
  return (
    <div className="content">
      {error && <div className="error-message">{error}</div>}
  
      <div style={{ textAlign: 'center', margin: '20px' }}>
        <h1>Combined Muhurat (Bharagva panchagam + Panchaka rahitha muhurtham)</h1>
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

        const isRowCurrentPeriod = (timeInterval, now) => {
          if (!timeInterval || !timeInterval.includes(' to ')) return false;
          const [startStr, endStr] = timeInterval.split(' to ');
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
                const isCurrentPeriod = todayActive && isRowCurrentPeriod(row.timeInterval, currentTime);
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

export default CombineSwiss;
