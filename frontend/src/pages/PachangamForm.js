import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import TableScreenshot from '../components/TableScreenshot';
import LivePeriodTracker from '../components/LivePeriodTracker';
import { findCurrentPeriod } from '../utils/periodHelpers';
import './hero-styles.css';

const TimeConverterApp = () => {
  const { setCityAndDate } = useAuth();

  // Load city from localStorage on mount, fallback to empty string
  const [cityName, setCityName] = useState(() => {
    return localStorage.getItem('selectedCity') || '';
  });

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().substring(0, 10));

  const [data, setData] = useState(() => {
    const storedData = sessionStorage.getItem('data');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [sunriseToday, setSunriseToday] = useState(() => sessionStorage.getItem('sunriseToday') || '05:00:00');
  const [sunsetToday, setSunsetToday] = useState(() => sessionStorage.getItem('sunsetToday') || '18:00:00');
  const [sunriseTmrw, setSunriseTmrw] = useState(() => sessionStorage.getItem('sunriseTmrw') || '06:00:00');

  const [weekday, setWeekday] = useState(() => sessionStorage.getItem('weekday') || '');
  const [is12HourFormat, setIs12HourFormat] = useState(true);
  const [showNonBlue, setShowNonBlue] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('data', JSON.stringify(data));
    sessionStorage.setItem('sunriseToday', sunriseToday);
    sessionStorage.setItem('sunsetToday', sunsetToday);
    sessionStorage.setItem('sunriseTmrw', sunriseTmrw);
    sessionStorage.setItem('weekday', weekday);
  }, [data, sunriseToday, sunsetToday, sunriseTmrw, weekday]);

  const Getpanchangam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${cityName}/${currentDate}`);
      const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/getWeekday/${currentDate}`);

      if (!response.ok || !response1.ok) {
        throw new Error('Failed to fetch Panchangam data');
      }

      const sunTimes = await response.json();
      const week = await response1.json();

      setWeekday(week.weekday);
      setSunriseToday(sunTimes.sunTimes.sunriseToday);
      setSunsetToday(sunTimes.sunTimes.sunsetToday);
      setSunriseTmrw(sunTimes.sunTimes.sunriseTmrw);

      // Fetch table data
      await fetchTableData(
        sunTimes.sunTimes.sunriseToday,
        sunTimes.sunTimes.sunsetToday,
        sunTimes.sunTimes.sunriseTmrw,
        week.weekday
      );

      setHasData(true);
    } catch (error) {
      setError(error.message || 'Failed to fetch Panchangam');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = useCallback(async (sunrise, sunset, sunriseTm, wd) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/update-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sunriseToday: sunrise,
        sunsetToday: sunset,
        sunriseTmrw: sunriseTm,
        weekday: wd,
        is12HourFormat,
        currentDate,
        showNonBlue,
      }),
    });

    const data1 = await response.json();
    setData(data1.newTableData || []);
  }, [currentDate, is12HourFormat, showNonBlue]);

  const handleCitySelect = (city) => {
    setCityName(city.name);
    // Save to localStorage for persistence
    localStorage.setItem('selectedCity', city.name);
  };

  const handleGetPanchang = async (e) => {
    e.preventDefault();
    if (cityName && currentDate) {
      await Getpanchangam();
    }
  };

  const toggleShowNonBlue = () => {
    setShowNonBlue((prev) => !prev);
  };

  useEffect(() => {
    if (hasData) {
      fetchTableData(sunriseToday, sunsetToday, sunriseTmrw, weekday);
    }
  }, [showNonBlue, is12HourFormat, hasData, sunriseToday, sunsetToday, sunriseTmrw, weekday, fetchTableData]);

  return (
    <div className="content">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">🌞</div>
          <h1 className="hero-title">Bhargava Panchang</h1>
          <p className="hero-subtitle">
            Ancient Vedic wisdom for modern living. Find your auspicious moments based on 24-minute precise periods.
          </p>

          {!hasData && (
            <div className="hero-form-wrapper">
              <form className="hero-form" onSubmit={handleGetPanchang}>
                <div className="form-group-inline">
                  <div className="input-wrapper" style={{ flex: 2 }}>
                    <label className="input-label">Select City</label>
                    <CityAutocomplete
                      value={cityName}
                      onChange={setCityName}
                      onSelect={handleCitySelect}
                      placeholder="Delhi, Mumbai, New York..."
                      showGeolocation={true}
                    />
                  </div>

                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <label className="input-label">Select Date</label>
                    <input
                      type="date"
                      className="date-input-hero"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="get-panchang-btn-hero" disabled={!cityName}>
                  <span className="btn-icon">✨</span>
                  Calculate Timings
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="error-box-hero">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {/* Results Section */}
      {hasData && data.length > 0 && (
        <div className="results-section">
          <div className="floating-section">
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">📍</div>
                <div className="card-content">
                  <div className="card-label">Location</div>
                  <div className="card-value">{cityName}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">📅</div>
                <div className="card-content">
                  <div className="card-label">Selected Date</div>
                  <div className="card-value">{currentDate}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">🎭</div>
                <div className="card-content">
                  <div className="card-label">Weekday</div>
                  <div className="card-value">{weekday}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">🌅</div>
                <div className="card-content">
                  <div className="card-label">Sunrise & Sunset</div>
                  <div className="card-value">{sunriseToday} - {sunsetToday}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Period Tracker */}
          <LivePeriodTracker data={data} selectedDate={currentDate} />

          {/* Control Buttons */}
          <div className="controls-section">
            <button
              className="control-btn"
              onClick={() => setIs12HourFormat(!is12HourFormat)}
            >
              <i className={`fas fa-clock`}></i>
              {is12HourFormat ? "Use 24h Format" : "Use 12h Format"}
            </button>
            <button
              className={`control-btn ${showNonBlue ? 'active' : ''}`}
              onClick={toggleShowNonBlue}
            >
              <i className="fas fa-filter"></i>
              {showNonBlue ? "Show All Rows" : "Show Best Timings"}
            </button>
            <button
              className="control-btn secondary"
              onClick={() => {
                setHasData(false);
                setData([]);
                setCityName('');
                localStorage.removeItem('selectedCity');
              }}
            >
              <i className="fas fa-sync-alt"></i>
              New Search
            </button>
          </div>

          <div className="floating-section">
            <div className="info-note">
              <span className="info-icon">💡</span>
              <div className="info-text-wrapper">
                <strong>Inauspicious Timing:</strong>
                <span> Cells with a dark blue background (</span>
                <span className="color-box"></span>
                <span>) are considered <strong>ashubh</strong>. Avoid starting new ventures during these periods.</span>
              </div>
            </div>

            {/* Table Section */}
            <div id="tableToCapture">
              <div className="table-wrapper">
                <table className="panchang-table">
                  <thead>
                    <tr>
                      <th>Start 1</th>
                      <th>End 1</th>
                      <th className="weekday-th">{weekday}</th>
                      <th>Start 2</th>
                      <th>End 2</th>
                      <th>S.No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const currentPeriod = findCurrentPeriod(data, new Date());
                      const isCurrentPeriod = currentPeriod?.index === index;

                      return (
                        <tr key={index} className={isCurrentPeriod ? 'current-period-row' : ''}>
                          <td>{item.start1}</td>
                          <td>{item.end1}</td>
                          <td
                            className={
                              item.isWednesdayColored
                                ? "period-special"
                                : item.isColored
                                  ? "period-ashubh"
                                  : "period-normal"
                            }
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
              <div className="table-footer-actions">
                <TableScreenshot tableId="tableToCapture" city={cityName} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeConverterApp;
