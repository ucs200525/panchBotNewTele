import React, { useState, useEffect } from 'react';
import { CityAutocomplete } from '../components/forms';
import TableScreenshot from '../components/TableScreenshot';
import LivePeriodTracker from '../components/LivePeriodTracker';
import { useAuth } from '../context/AuthContext';

const CombinePage = () => {
  const { localCity, localDate, setCityAndDate } = useAuth();
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
    sessionStorage.setItem('combinedData', JSON.stringify(combinedData));
    sessionStorage.setItem('weekday', weekday);
  }, [combinedData, weekday]);

  const handleCitySelect = (cityObj) => {
    setCity(cityObj.name);
    localStorage.setItem('selectedCity', cityObj.name);
  };

  const convertToDDMMYYYY = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const fetchMuhuratData = async (cityName, dateValue) => {
    setLoading(true);
    setError(null);
    try {
      const [muhurthaResponse, bharagvResponse] = await Promise.all([
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getDrikTable?city=${cityName}&date=${convertToDDMMYYYY(dateValue)}&goodTimingsOnly=${showNonBlue}`
        ),
        fetch(
          `${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${cityName}&date=${dateValue}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}`
        ),
      ]);

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
      const cData = await combinedResponse.json();
      setCombinedData(cData);

      const wDay = new Date(dateValue).toLocaleString('en-US', { weekday: 'long' });
      setWeekday(wDay);
      setCityAndDate(cityName, dateValue);
    } catch (error) {
      setError("Error fetching data. Please try again.");
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
          <div className="hero-icon">🖇️</div>
          <h1 className="hero-title">Combined Insights</h1>
          <p className="hero-subtitle">
            Unified view of Muhurat timings and Bhargava Panchang calculations
          </p>
        </div>

        {/* Hero Form */}
        <div className="hero-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            fetchMuhuratData(city, date);
          }}>
            <div className="form-group-inline">
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
                <span className="checkbox-label">Good Timings Only</span>
              </label>
            </div>

            <button
              type="submit"
              className="get-panchang-btn-hero"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Gatrhering Data...
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  Generate Combined View
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="results-section">
        {error && (
          <div className="error-box-hero">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        <div id="tableToCapture">
          {/* Live Period Tracker */}
          {bharagvData && Array.isArray(bharagvData) && bharagvData.length > 0 && (
            <div className="section-margin">
              <LivePeriodTracker data={bharagvData} selectedDate={date} />
            </div>
          )}

          {combinedData && !loading && (
            <div className="table-section">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Time & Interval</th>
                      <th>Weekday Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.sno}</td>
                        <td style={{ fontWeight: 700 }}>{row.type}</td>
                        <td>{row.description}</td>
                        <td className="time-cell">{row.timeInterval}</td>
                        <td>
                          {row.weekdays && row.weekdays.length > 0 ? (
                            <div className="mini-weekday-list">
                              {row.weekdays.map((wd, subIndex) => (
                                <div key={subIndex} className="mini-weekday-item">
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

              <div className="information">
                <span className="info-icon">ℹ️</span>
                <p className="info">This combined view merges drik-panchang muhurats with Bhargava astrological calculations for a more complete picture of the day's quality.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinePage;
