import React, { useState, useEffect } from 'react';
import { CityAutocomplete } from '../components/forms';
import { Section } from '../components/layout';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';
import './PlanetaryPage.css';

const PlanetaryPage = () => {
  const [name, setName] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState('12:00');
  const [planetaryData, setPlanetaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);

  useEffect(() => {
    setSavedProfiles(getAllProfiles());
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    const profile = getProfile(value);
    if (profile) {
      setSelectedCity({ name: profile.cityName });
      setDate(profile.birthDate);
      setTime(profile.birthTime);
    }
  };

  const loadProfile = (profile) => {
    setName(profile.name);
    setSelectedCity({ name: profile.cityName });
    setDate(profile.birthDate);
    setTime(profile.birthTime);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      saveProfile(name, { cityName: selectedCity.name, birthDate: date, birthTime: time });
      setSavedProfiles(getAllProfiles());

      // First, get exact coordinates and timezone from backend if not already fully populated
      const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${selectedCity.name}`);
      if (!geoResponse.ok) throw new Error('Could not find city details');
      const coords = await geoResponse.json();

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/planetary/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity.name,
          lat: coords.lat,
          lng: coords.lng,
          tzone: coords.timeZone,
          date,
          time
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch planetary data');
      }
      const data = await response.json();
      setPlanetaryData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanetIcon = (planet) => {
    const icons = {
      'Sun': '☀️',
      'Moon': '🌙',
      'Mercury': '☿️',
      'Venus': '♀️',
      'Mars': '♂️',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Rahu': '🐉',
      'Ketu': '☄️'
    };
    return icons[planet] || '⭐';
  };

  return (
    <div className="planetary-page">
      {/* Hero Section */}
      <div className="page-hero planetary-hero">
        <div className="hero-content">
          <div className="hero-icon">🪐</div>
          <h1 className="hero-title">Planetary Positions</h1>
          <p className="hero-subtitle">
            Precise sidereal positions of all nine planets in zodiac signs with degrees
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-card">
          <h2 className="section-title">Enter Birth Details</h2>
          <form onSubmit={handleSubmit} className="planetary-form">
            <div className="form-row-modern">
              <div className="form-group-modern">
                <label className="form-label-modern">Name</label>
                <input
                  type="text"
                  list="profiles-list"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter name..."
                  className="date-input-modern"
                  required
                />
                <datalist id="profiles-list">
                  {savedProfiles.map((p, i) => (
                    <option key={i} value={p.name}>{p.cityName} - {p.birthDate}</option>
                  ))}
                </datalist>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Location</label>
                <CityAutocomplete
                  value={selectedCity?.name || ''}
                  onSelect={handleCitySelect}
                  onChange={(val) => setSelectedCity({ name: val })}
                  placeholder="Search for a city..."
                  showGeolocation={true}
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="date-input-modern"
                />
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="date-input-modern"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn-modern" disabled={isLoading}>
              {isLoading ? '🔄 Calculating...' : '✨ Get Planetary Positions'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {error && (
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
            <button onClick={() => setError(null)} className="error-dismiss">Dismiss</button>
          </div>
        )}

        {/* Saved Profiles Quick Select */}
        {savedProfiles.length > 0 && !planetaryData && !isLoading && !error && (
          <div className="floating-section" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
            <Section title="Quick Load Profile" icon="👥">
              <div className="profile-pills">
                {savedProfiles.slice(0, 5).map((p, i) => (
                  <button
                    key={i}
                    className="profile-pill"
                    onClick={() => loadProfile(p)}
                  >
                    <span className="pill-name">{p.name}</span>
                    <span className="pill-meta">{p.cityName}</span>
                  </button>
                ))}
              </div>
            </Section>
          </div>
        )}

        {!planetaryData && !isLoading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🌌</div>
            <h3 className="empty-title">No Data Yet</h3>
            <p className="empty-text">
              Enter a location, date, and time above to calculate planetary positions
            </p>
          </div>
        )}

        {isLoading && (
          <div className="loading-state">
            <div className="spinner-modern"></div>
            <p className="loading-text">Calculating planetary positions...</p>
          </div>
        )}

        {planetaryData && !isLoading && (
          <div className="planetary-results">
            <div className="planets-grid">
              {planetaryData.planets?.map((planet, idx) => (
                <div key={idx} className="planet-card">
                  <div className="planet-header">
                    <div className="planet-icon">{getPlanetIcon(planet.name)}</div>
                    <h3 className="planet-name">{planet.name}</h3>
                  </div>

                  <div className="planet-details">
                    <div className="detail-row">
                      <span className="detail-label">Rashi</span>
                      <span className="detail-value rashi">{planet.rashi}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Degree</span>
                      <span className="detail-value">{planet.formatted}</span>
                    </div>

                    {planet.isRetrograde && (
                      <div className="retrograde-badge">
                        ↩️ Retrograde
                      </div>
                    )}
                  </div>

                  <div className="degree-bar">
                    <div
                      className="degree-fill"
                      style={{ width: `${(planet.degrees / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="info-note">
              <div className="note-icon">ℹ️</div>
              <p>All positions are calculated using the sidereal zodiac (Lahiri ayanamsa). Degrees shown are within the current rashi.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetaryPage;
