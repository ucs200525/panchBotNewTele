import React, { useState, useEffect } from 'react';
import { CityAutocomplete } from '../components/forms';
import TableScreenshot from '../components/TableScreenshot';
import LivePeriodTracker from '../components/LivePeriodTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import styles from './Combine.module.css';

const CombinePage = () => {
  const { localCity, localDate, setCityAndDate, selectedLat, selectedLng, setLocationDetails, timeZone } = useAuth();
  const [city, setCity] = useState(localCity || '');
  const [date, setDate] = useState(localDate || new Date().toISOString().substring(0, 10));
  const [combinedData, setCombinedData] = useState(() => {
    const storedData = sessionStorage.getItem('combinedData');
    return storedData ? JSON.parse(storedData) : null;
  });

  const [bharagvData, setBharagvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weekday, setWeekday] = useState(() => sessionStorage.getItem('weekday') || '');
  const [showNonBlue, setShowNonBlue] = useState(true);
  const [is12HourFormat] = useState(true);

  useEffect(() => {
    if (localCity) setCity(localCity);
    if (localDate) setDate(localDate);
  }, [localCity, localDate]);

  useEffect(() => {
    sessionStorage.setItem('combinedData', JSON.stringify(combinedData));
    sessionStorage.setItem('weekday', weekday);
  }, [combinedData, weekday]);

  const handleCitySelect = (cityObj) => {
    setCity(cityObj.name);
    setLocationDetails({
      name: cityObj.name,
      lat: cityObj.lat,
      lng: cityObj.lng
    });
  };

  const convertToDDMMYYYY = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const fetchMuhuratData = async (cityName, dateValue) => {
    if (!cityName) {
      setError("Please select a city first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let drikUrl = `${process.env.REACT_APP_API_URL}/api/getDrikTable?city=${cityName}&date=${convertToDDMMYYYY(dateValue)}&goodTimingsOnly=${showNonBlue}`;
      let bharagvUrl = `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${cityName}&date=${dateValue}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}`;

      if (selectedLat && selectedLng && cityName === localCity) {
        const coordParams = `&lat=${selectedLat}&lng=${selectedLng}`;
        drikUrl += coordParams;
        bharagvUrl += coordParams;
        if (timeZone) {
          drikUrl += `&timeZone=${timeZone}`;
          bharagvUrl += `&timeZone=${timeZone}`;
        }
      }

      const [muhurthaResponse, bharagvResponse] = await Promise.all([
        fetch(drikUrl),
        fetch(bharagvUrl),
      ]);

      if (!muhurthaResponse.ok || !bharagvResponse.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const mData = await muhurthaResponse.json();
      const bData = await bharagvResponse.json();

      setBharagvData(bData);

      const combinedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/combine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          muhuratData: mData,
          panchangamData: bData,
          city: cityName,
          date: dateValue,
        }),
      });

      if (!combinedResponse.ok) throw new Error('Failed to process combined data');

      const cData = await combinedResponse.json();
      setCombinedData(cData);

      const wDay = new Date(dateValue).toLocaleString('en-US', { weekday: 'long' });
      setWeekday(wDay);
      setCityAndDate(cityName, dateValue);
    } catch (error) {
      setError("Error fetching data. Please ensure the backend is running and the city exists.");
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🔄</span> Combined Insights
          </h1>
          <p className="hero-subtitle">
            Unified high-precision view of Muhurat timings and Bhargava calculations
          </p>
        </div>

        {/* Hero Form */}
        <div className="hero-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            fetchMuhuratData(city, date);
          }}>
            <div className="form-row">
              <div className="input-wrapper">
                <label className="input-label">Location</label>
                <CityAutocomplete
                  value={city}
                  onSelect={handleCitySelect}
                  placeholder="Select city..."
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="date-input-hero"
                />
              </div>
            </div>

            <div className="form-options-inline">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={showNonBlue}
                  onChange={(e) => setShowNonBlue(e.target.checked)}
                />
                <span className="checkbox-label">Auspicious (Good) Periods Only</span>
              </label>
            </div>

            <button
              type="submit"
              className="get-panchang-btn-hero"
              disabled={loading}
            >
              {loading ? 'Gathering Insights...' : 'Generate Combined View'}
            </button>
          </form>
        </div>
      </div>

      <div className={`results-section ${styles.panchangResults}`}>
        {error && <div className="error-box-hero">{error}</div>}

        {loading && <LoadingSpinner />}

        <div id="tableToCapture">
          {/* Live Period Tracker */}
          {bharagvData && Array.isArray(bharagvData) && bharagvData.length > 0 && (
            <div className={styles.panchangSection}>
              <h2 className={styles.sectionHeader}>Live Progress Tracker</h2>
              <LivePeriodTracker data={bharagvData} selectedDate={date} />
            </div>
          )}

          {combinedData && !loading && (
            <div className={styles.panchangSection}>
              <h2 className={styles.sectionHeader}>Unified Muhurat Report</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.panchangTable}>
                  <thead>
                    <tr>
                      <th className={styles.sno}>#</th>
                      <th className={styles.typeCell}>Type</th>
                      <th>Description</th>
                      <th>Interval</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row, index) => (
                      <tr key={index}>
                        <td className={styles.sno}>{row.sno}</td>
                        <td className={styles.typeCell}>{row.type}</td>
                        <td className={styles.descCell}>{row.description}</td>
                        <td className={styles.timeCell}>{row.timeInterval}</td>
                        <td>
                          {row.weekdays && row.weekdays.length > 0 ? (
                            <div className={styles.weekdaysContainer}>
                              {row.weekdays.map((wd, subIndex) => (
                                <div key={subIndex} className={styles.miniWeekdayItem}>
                                  <strong>{wd.weekday}</strong>: {wd.time}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="dim-text">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-footer-actions">
                <TableScreenshot tableId="tableToCapture" city={city} date={date} weekday={weekday} />
              </div>

              <p className={styles.info}>
                This combined report fuses <strong>professional astronomical</strong> based Muhurat calculations with Bhargava Panchang timings for high-precision planning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinePage;
