import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { CityAutocomplete } from '../components/forms';
import LivePeriodTracker from '../components/LivePeriodTracker';
import TableScreenshot from '../components/TableScreenshot';
import styles from './Combine.module.css'; // Let's use the same clean styles as Combine
import './hero-styles.css';

const PanchakaMuhurth = () => {
  const { localCity, localDate, setCityAndDate, selectedLat, selectedLng, timeZone } = useAuth();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat_old`, {
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

  return (
    <div className="content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
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
                  'Find Muhurats'
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

      <div className={`results-section ${styles.panchangResults}`}>
        {error && (
          <div className="error-box-hero">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {filteredData && filteredData.length > 0 && (
          <div id="tableToCapture">
            <LivePeriodTracker data={filteredData} selectedDate={date} />

            <div className={styles.panchangSection}>
              <h2 className={styles.sectionHeader}>Muhurat Report</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.panchangTable}>
                  <thead>
                    <tr>
                      <th>Muhurat / Category</th>
                      <th>Timings & Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const catLower = item.category.toLowerCase();
                      const isGood = catLower.includes('good') || catLower.includes('rahitam');
                      const isDanger = catLower.includes('danger') || catLower.includes('evil') || catLower.includes('bad') || catLower.includes('disease');
                      
                      let accentColor = '#3b82f6';
                      if (isGood) accentColor = '#1aae75';
                      if (isDanger) accentColor = '#ef4444';

                      return (
                        <tr key={index}>
                          <td style={{ fontWeight: '700', color: accentColor }}>
                            {item.muhurat}
                            <span className="toText">{item.category}</span>
                          </td>
                          <td className={styles.timeCell}>
                            {item.start && item.end ? (
                              <>
                                <div className={styles.timeRange} style={{ color: accentColor }}>
                                  {item.start} - {item.end}
                                </div>
                                {item.duration && <div className={styles.durationSmall}>({item.duration})</div>}
                              </>
                            ) : (
                              <div className={styles.timeRange} style={{ color: accentColor }}>{item.time}</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-footer-actions">
                <TableScreenshot
                  tableId="tableToCapture"
                  city={city}
                  date={date}
                  backendEndpoint="/api/getOldSwissTable-image"
                  backendData={{ lat: selectedLat, lng: selectedLng, timeZone }}
                />
              </div>

              <p className={styles.info}>
                Panchaka Muhurat considers five aspects of the time to determine its quality. Choose "Good" periods for important ventures and avoid "Danger" or "Risk" periods when possible.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchakaMuhurth;
