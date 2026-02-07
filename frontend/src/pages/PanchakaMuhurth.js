import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { CityAutocomplete } from '../components/forms';
import LivePeriodTracker from '../components/LivePeriodTracker';
import TableScreenshot from '../components/TableScreenshot';

const PanchakaMuhurth = () => {
  const { localCity, localDate, setCityAndDate } = useAuth();
  const [city, setCity] = useState(localCity || '');
  const [date, setDate] = useState(localDate || new Date().toISOString().substring(0, 10));
  const [allMuhuratData, setAllMuhuratData] = useState([]);
  const [filteredData, setFilteredData] = useState(() => {
    const storedData = sessionStorage.getItem('filteredData');
    return storedData ? JSON.parse(storedData) : [];
  });

  const [showAll, setShowAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('filteredData', JSON.stringify(filteredData));
  }, [filteredData]);


  const getMuhuratData = async (cityName, dateValue) => {
    if (!cityName || !dateValue) return;

    setLoading(true);
    setError(null);
    try {
      const ddmmvvyy = dateValue.split("-").reverse().join("/");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityName, date: ddmmvvyy })
      });

      if (!response.ok) throw new Error('Failed to fetch muhurat data');
      const data = await response.json();
      setAllMuhuratData(data);
      setFilteredData(data);
      setShowAll(true);
      setCityAndDate(cityName, dateValue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowAllRows = () => {
    if (showAll) {
      const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase().includes("good"));
      setFilteredData(goodTimings);
    } else {
      setFilteredData(allMuhuratData);
    }
    setShowAll(!showAll);
  };

  const handleCitySelect = (cityObj) => {
    setCity(cityObj.name);
    localStorage.setItem('selectedCity', cityObj.name);
  };

  // Get category color class
  const getCategoryClass = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('good')) return 'cat-good';
    if (cat.includes('danger')) return 'cat-danger';
    if (cat.includes('risk')) return 'cat-risk';
    if (cat.includes('bad')) return 'cat-bad';
    if (cat.includes('evil')) return 'cat-evil';
    return '';
  };

  return (
    <div className="content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">🔱</div>
          <h1 className="hero-title">Panchaka Muhurat</h1>
          <p className="hero-subtitle">
            Comprehensive daily guide to auspicious and inauspicious time intervals
          </p>
        </div>

        {/* Hero Form */}
        <div className="hero-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            getMuhuratData(city, date);
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

            <div className="form-actions-hero">
              <button
                type="submit"
                className="get-panchang-btn-hero"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Calculating...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✨</span>
                    Find Muhurats
                  </>
                )}
              </button>

              {allMuhuratData.length > 0 && (
                <button
                  type="button"
                  onClick={toggleShowAllRows}
                  className="secondary-btn-hero"
                >
                  {showAll ? "Filter Good Only" : "Show All Periods"}
                </button>
              )}
            </div>
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

        {/* Live Period Tracker */}
        {filteredData && filteredData.length > 0 && (
          <div className="results-section">
            <div className="floating-section">
              <LivePeriodTracker data={filteredData} selectedDate={date} />
            </div>

            <div id="muhurats-table" className="table-section">
              <div className="floating-section">
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Muhurat / Category</th>
                        <th>Timings & Interval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr key={index} className={getCategoryClass(item.category)}>
                          <td className="muhurat-cell">
                            <div className="muhurat-name">{item.muhurat}</div>
                            <span className={`category-badge badge-${item.category.toLowerCase().replace(' ', '-')}`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="time-cell">{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer-actions">
                  <TableScreenshot tableId="muhurats-table" city={city} />
                </div>

                <div className="information">
                  <span className="info-icon">ℹ️</span>
                  <p className="info">Panchaka Muhurat considers five aspects of the time to determine its quality. Choose "Good" periods for important ventures and avoid "Danger" or "Risk" periods when possible.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchakaMuhurth;
