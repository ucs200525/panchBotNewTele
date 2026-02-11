import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { CityAutocomplete } from '../components/forms';
import { useAuth } from '../context/AuthContext';
import TableScreenshot from '../components/TableScreenshot';
import LivePeriodTracker from '../components/LivePeriodTracker';
import { findCurrentPeriod } from '../utils/periodHelpers';
import './hero-styles.css';

// Helper function to format time range (time to time, date)
const formatTimeRange = (start, end) => {
  if (!start || !end) return `${start || ''} to ${end || ''}`;

  // Check if dates are included (look for "Feb" or month names)
  const hasDate = start.includes('Feb') || start.includes('Jan') || start.includes('Mar') ||
    start.includes('Apr') || start.includes('May') || start.includes('Jun') ||
    start.includes('Jul') || start.includes('Aug') || start.includes('Sep') ||
    start.includes('Oct') || start.includes('Nov') || start.includes('Dec');

  if (!hasDate) {
    // Simple case: just times
    return `${start} to ${end}`;
  }

  // Extract date and time from format like "Feb 12 , 06:09 AM"
  const parseDateTime = (str) => {
    // Match pattern: "Feb 12 , 06:09 AM" or "06:09 AM"
    const match = str.trim().match(/^(?:(\w+\s+\d+)\s*,\s*)?(.+)$/);
    if (match) {
      return {
        date: match[1] || null,
        time: match[2] || str
      };
    }
    return { date: null, time: str };
  };

  const startParts = parseDateTime(start);
  const endParts = parseDateTime(end);

  // If both have dates and they're the same, show: time to time, date
  if (startParts.date && endParts.date && startParts.date === endParts.date) {
    return `${startParts.time} to ${endParts.time}, ${startParts.date}`;
  }

  // If dates are different, show: time (date) to time (date)
  if (startParts.date && endParts.date && startParts.date !== endParts.date) {
    return `${startParts.time} (${startParts.date}) to ${endParts.time} (${endParts.date})`;
  }

  // If only start has date
  if (startParts.date && !endParts.date) {
    return `${startParts.time} to ${endParts.time}, ${startParts.date}`;
  }

  // If only end has date
  if (!startParts.date && endParts.date) {
    return `${startParts.time} to ${endParts.time}, ${endParts.date}`;
  }

  // Fallback
  return `${start} to ${end}`;
};

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
  const [moonrise, setMoonrise] = useState(() => sessionStorage.getItem('moonrise') || '');
  const [moonset, setMoonset] = useState(() => sessionStorage.getItem('moonset') || '');

  const [selectedLat, setSelectedLat] = useState(() => {
    const saved = sessionStorage.getItem('selectedLat');
    return (saved === 'null' || !saved) ? null : saved;
  });
  const [selectedLng, setSelectedLng] = useState(() => {
    const saved = sessionStorage.getItem('selectedLng');
    return (saved === 'null' || !saved) ? null : saved;
  });

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
    sessionStorage.setItem('moonrise', moonrise);
    sessionStorage.setItem('moonset', moonset);
    sessionStorage.setItem('selectedLat', selectedLat);
    sessionStorage.setItem('selectedLng', selectedLng);
    sessionStorage.setItem('weekday', weekday);
  }, [data, sunriseToday, sunsetToday, sunriseTmrw, moonrise, moonset, selectedLat, selectedLng, weekday]);

  const Getpanchangam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `${process.env.REACT_APP_API_URL}/api/getSunTimesForCity/${cityName}/${currentDate}`;
      if (selectedLat && selectedLng) {
        url += `?lat=${selectedLat}&lng=${selectedLng}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch Panchangam data');
      }

      const result = await response.json();
      const sunData = result.sunTimes;

      setWeekday(result.weekday);
      setSunriseToday(sunData.sunriseToday);
      setSunsetToday(sunData.sunsetToday);
      setSunriseTmrw(sunData.sunriseTmrw);
      setMoonrise(sunData.moonriseToday || 'N/A');
      setMoonset(sunData.moonsetToday || 'N/A');

      // Fetch table data
      await fetchTableData(
        sunData.sunriseToday,
        sunData.sunsetToday,
        sunData.sunriseTmrw,
        result.weekday
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
    setSelectedLat(city.lat);
    setSelectedLng(city.lng);
    // Save to localStorage for persistence
    localStorage.setItem('selectedCity', city.name);
    localStorage.setItem('selectedLat', city.lat);
    localStorage.setItem('selectedLng', city.lng);
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
          <h1 className="hero-title">Bhargava Panchangam</h1>
          <p className="hero-subtitle">
            Ancient Vedic wisdom for modern living. Find your auspicious moments based on 24-minute precise periods.
          </p>

          <div className="hero-form-wrapper">
            <form className="hero-form" onSubmit={handleGetPanchang}>
              <div className="form-group-inline">
                <div className="input-wrapper" style={{ flex: 1 }}>
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
                  <label className="input-label">Date</label>
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
                Calculate Timings
              </button>
            </form>
          </div>

          {error && (
            <div className="error-box-hero">
              {error}
            </div>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {/* Results Section */}
      {hasData && data.length > 0 && (
        <div className="results-section">
          <div className="floating-section">
            <div className="summary-bar">
              <div className="summary-item">
                <span className="summary-label">Location</span>
                <span className="summary-value">{cityName}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">Selected Date</span>
                <span className="summary-value">{currentDate}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">Weekday</span>
                <span className="summary-value">{weekday}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">Sunrise & Sunset</span>
                <span className="summary-value">{sunriseToday} - {sunsetToday}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item">
                <span className="summary-label">Moonrise & Moonset</span>
                <span className="summary-value">{moonrise} - {moonset}</span>
              </div>
            </div>
          </div>

          {/* Live Period Tracker */}
          <LivePeriodTracker data={data} selectedDate={currentDate} />

          {/* Table Section */}
          <div id="tableToCapture">
            <div className="table-wrapper">
              <table className="panchang-table">
                <thead>
                  <tr>
                    <th>Start-End 1</th>
                    <th className="weekday-th">{weekday}</th>
                    <th>Start-End 2</th>
                    <th>S.No</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter(item => item.sNo !== '' && item.sNo !== null && item.sNo !== undefined)
                    .map((item, index) => {
                      const currentPeriod = findCurrentPeriod(data, new Date());
                      const isCurrentPeriod = currentPeriod?.index === index;

                      return (
                        <tr key={index} className={isCurrentPeriod ? 'current-period-row' : ''}>
                          <td className="time-range-cell">{formatTimeRange(item.start1, item.end1)}</td>

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
                          <td className="time-range-cell">{formatTimeRange(item.start2, item.end2)}</td>
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
      )}
    </div>
  );
};

export default TimeConverterApp;
