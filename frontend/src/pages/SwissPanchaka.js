import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { CityAutocomplete } from '../components/forms';
import LivePeriodTracker from '../components/LivePeriodTracker';
import TableScreenshot from '../components/TableScreenshot';
import styles from './SwissPanchaka.module.css';

const SwissPanchaka = () => {
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
    if (cat.includes('good')) return styles.catGood;
    if (cat.includes('danger')) return styles.catDanger;
    if (cat.includes('risk')) return styles.catRisk;
    if (cat.includes('bad') || cat.includes('disease')) return styles.catBad;
    if (cat.includes('evil')) return styles.catEvil;
    return '';
  };

  return (
    <div className={styles.content}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Panchaka Rahitam</h1>
          <p className="hero-subtitle">
            High-precision Vedic auspicious timings calculated .
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

      <div className={`${styles.resultsSection}`}>
        {error && (
          <div className="error-box-hero">
            {error}
          </div>
        )}

        {
          loading && (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
            </div>
          )
        }

        {/* Live Period Tracker */}
        {
          filteredData && filteredData.length > 0 && (
            <div className={`${styles.resultsSection}`}>
              <div className="floating-section">
                <LivePeriodTracker data={filteredData} selectedDate={date} />
              </div>

              <div id="muhurats-table" className={`table-section ${styles.tableSection}`}>
                <div className={`floating-section ${styles.floatingSection}`}>
                  <div className={`table-wrapper ${styles.tableWrapper}`}>
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
                            <td className={styles.muhuratCell}>
                              <div className={`muhurat-name ${styles.muhuratName}`}>{item.muhurat}</div>
                              <span className={`category-badge badge-${item.category.toLowerCase().replace(' ', '-')} ${styles.categoryBadge}`}>
                                {item.category}
                              </span>
                            </td>
                            <td className={styles.timeCell}>
                              {item.time || (
                                <>
                                  <div className={`time-range ${styles.timeRange}`}>{item.start} - {item.end}</div>
                                  <div className={`duration-small ${styles.durationSmall}`}>{item.duration}</div>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer-actions">
                    <TableScreenshot
                      tableId="muhurats-table"
                      city={city}
                      date={date}
                      backendEndpoint="/api/getSwissTable-image"
                    />
                  </div>

                  <div className="information">
                    <p className="info">This page uses high-precision astronomical data to calculate Panchaka Rahitam timings mathematically. Choose "Good" (Rahitam) periods for important ventures.</p>
                  </div>

                  {/* Comprehensive Technical Documentation */}
                  <div className={styles.swissDoc}>
                    <div className={styles.docSection}>
                      <h3>Transition Engine</h3>
                      <p>The logic now scans the entire <strong>Vedic Day</strong> (from today's Sunrise to tomorrow's Sunrise) and identifies every single second where a Tithi, Nakshatra, or Lagna changes.</p>
                    </div>

                    <div className={styles.docSection}>
                      <h3>Mathematical Accuracy</h3>
                      <p>For every time segment created by these transitions, it applies the traditional Vedic formula:</p>
                      <div className={styles.formulaBox}>
                        (Tithi index + Vara index + Nakshatra index + Lagna index) % 9
                      </div>
                    </div>

                    <div className={styles.docSection}>
                      <h3>Indices Used</h3>
                      <div className={styles.docGrid}>
                        <div className={styles.docItem}>
                          <span className={styles.docLabel}>Tithi</span>
                          <span className={styles.docValue}>1–15 (Cycles for both Shukla & Krishna)</span>
                        </div>
                        <div className={styles.docItem}>
                          <span className={styles.docLabel}>Vara</span>
                          <span className={styles.docValue}>1 (Sun) to 7 (Sat) from Sunrise</span>
                        </div>
                        <div className={styles.docItem}>
                          <span className={styles.docLabel}>Nakshatra</span>
                          <span className={styles.docValue}>1 (Ashwini) to 27 (Revati)</span>
                        </div>
                        <div className={styles.docItem}>
                          <span className={styles.docLabel}>Lagna</span>
                          <span className={styles.docValue}>1 (Aries) to 12 (Pisces)</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.docSection}>
                      <h3>Dosha Mapping</h3>
                      <div className="dosha-list">
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">Rem 1</span>
                          <span className="dosha-status status-danger">Mrityu (Danger)</span>
                        </div>
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">Rem 2</span>
                          <span className="dosha-status status-risk">Agni (Risk)</span>
                        </div>
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">Rem 4</span>
                          <span className="dosha-status status-bad">Raja (Bad)</span>
                        </div>
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">Rem 6</span>
                          <span className="dosha-status status-evil">Chora (Evil)</span>
                        </div>
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">Rem 8</span>
                          <span className="dosha-status status-bad">Roga (Disease)</span>
                        </div>
                        <div className="dosha-mapping-item">
                          <span className="dosha-num">0, 3, 5, 7</span>
                          <span className="dosha-status status-good">Rahitam (Good)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default SwissPanchaka;
