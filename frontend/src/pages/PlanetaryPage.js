import React, { useState, useEffect } from 'react';
import styles from './PlanetaryPage.module.css';
import '../pages/hero-styles.css';
import { CityAutocomplete } from '../components/forms';
import LoadingSpinner from '../components/LoadingSpinner';
import { saveProfile, getProfile, getAllProfiles } from '../utils/profileStorage';

import { useAuth } from '../context/AuthContext';

const PlanetaryPage = () => {
  const { localCity, localDate, setCityAndDate, setLocationDetails, selectedLat, selectedLng, timeZone } = useAuth();

  const [name, setName] = useState('');
  const [selectedCity, setSelectedCity] = useState(localCity ? { name: localCity, lat: selectedLat, lng: selectedLng } : null);
  const [date, setDate] = useState(localDate || new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState('12:00');

  const [planetaryData, setPlanetaryData] = useState(null);
  const [birthDetails, setBirthDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);

  useEffect(() => {
    setSavedProfiles(getAllProfiles());
  }, []);

  // Sync when context updates (e.g. from another tab/page)
  useEffect(() => {
    if (localCity) {
      setSelectedCity(prev => (prev?.name === localCity ? prev : { name: localCity, lat: selectedLat, lng: selectedLng }));
    }
    if (localDate) setDate(localDate);
  }, [localCity, localDate, selectedLat, selectedLng]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setLocationDetails({
      name: city.name,
      lat: city.lat,
      lng: city.lng
    });
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

      let coords = { ...selectedCity };

      // If missing lat/lng or timezone, try to use from AuthContext if matches
      if ((!coords.lat || !coords.lng || !coords.timeZone || !coords.tzone) && selectedCity.name === localCity && selectedLat && selectedLng) {
        coords.lat = selectedLat;
        coords.lng = selectedLng;
        coords.timeZone = timeZone;
      }

      // If still missing crucial data, fetch from backend
      if (!coords.lat || !coords.lng || (!coords.timeZone && !coords.tzone)) {
        const geoResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCoordinates/${selectedCity.name}`);
        if (!geoResponse.ok) throw new Error('Could not find city details');
        const fetchedCoords = await geoResponse.json();
        coords = { ...coords, ...fetchedCoords };
      }

      // Ensure tzone property exists (sometimes called timeZone)
      coords.tzone = coords.tzone || coords.timeZone;

      const [planetsResponse, birthResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/planetary/positions`, {
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
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/planetary/birth-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            time,
            lat: coords.lat,
            lng: coords.lng,
            tzone: coords.timeZone
          })
        })
      ]);

      if (!planetsResponse.ok || !birthResponse.ok) {
        throw new Error('Failed to fetch complete birth data');
      }

      const pData = await planetsResponse.json();
      const bData = await birthResponse.json();

      setPlanetaryData(pData);
      setBirthDetails(bData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTableSection = (title, subtitle, headers, rows) => (
    <div className={styles.panchangSection}>
      <h2 className={styles.sectionHeader}>{title}</h2>
      {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      <div className={styles.tableWrapper}>
        <table className={styles.panchangTable}>
          <thead>
            <tr>
              {headers.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={row.className || ''}>
                {row.cells.map((cell, j) => (
                  <td key={j} className={cell.className || ''}>{cell.content}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🪐</span> Planetary Positions
          </h1>
          <p className="hero-subtitle">
            Precise sidereal positions of all nine planets with high-accuracy astronomical metadata
          </p>
        </div>

        {/* Hero Form */}
        <div className="hero-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-wrapper">
                <label className="input-label">Name</label>
                <input
                  type="text"
                  list="profiles-list"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Enter name..."
                  required
                />
                <datalist id="profiles-list">
                  {savedProfiles.map((p, i) => (
                    <option key={i} value={p.name}>{p.cityName} - {p.birthDate}</option>
                  ))}
                </datalist>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Location</label>
                <CityAutocomplete
                  value={selectedCity?.name || ''}
                  onSelect={handleCitySelect}
                  onChange={(val) => setSelectedCity({ name: val })}
                  placeholder="Search for a city..."
                  showGeolocation={true}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <label className="input-label">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="get-panchang-btn-hero" disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Get Planetary Positions'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className={`results-section ${styles.panchangResults}`}>
        {error && <div className="error-box-hero">{error}</div>}

        {/* Saved Profiles Quick Select */}
        {savedProfiles.length > 0 && !planetaryData && !isLoading && !error && (
          <div className={styles.panchangSection}>
            <h2 className={styles.sectionHeader}>Quick Load Profile</h2>
            <div className={styles.profilePills}>
              {savedProfiles.slice(0, 8).map((p, i) => (
                <button
                  key={i}
                  className={styles.profilePill}
                  onClick={() => loadProfile(p)}
                >
                  <span className={styles.pillName}>{p.name}</span>
                  <span className={styles.pillMeta}>{p.cityName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {planetaryData && !isLoading && (
          <div className="planetary-results">
            {birthDetails && (
              renderTableSection(
                "Birth Panchanga Details",
                "Core Vedic pointers calculated for the birth time",
                ["Element", "Description / Value"],
                [
                  { cells: [{ content: "Tithi", className: styles.labelCell }, { content: <div><span className={styles.valueCell}>{birthDetails.tithi?.name}</span> <span className={styles.metaCell}>({birthDetails.tithi?.paksha})</span></div> }] },
                  { cells: [{ content: "Nakshatra", className: styles.labelCell }, { content: <div><span className={styles.valueCell}>{birthDetails.nakshatra?.name}</span> <span className={styles.metaCell}>Pada {birthDetails.nakshatra?.pada} ({birthDetails.nakshatra?.lord})</span></div> }] },
                  { cells: [{ content: "Yoga", className: styles.labelCell }, { content: birthDetails.yoga?.name, className: styles.valueCell }] },
                  { cells: [{ content: "Karana", className: styles.labelCell }, { content: birthDetails.karana?.name, className: styles.valueCell }] },
                  { cells: [{ content: "Birth Hora", className: styles.labelCell }, { content: birthDetails.hora?.lord, className: styles.valueCell }] }
                ]
              )
            )}

            {renderTableSection(
              "Planetary Positions",
              "Individual planetary placements in the zodiac",
              ["Planet", "Rashi (Sign)", "Degree", "Status / Dignity"],
              planetaryData.planets?.map(p => ({
                cells: [
                  { content: p.name, className: styles.planetNameCell },
                  { content: p.rashi, className: styles.rashiCell },
                  { content: p.formatted, className: styles.degreeCell },
                  {
                    content: (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={p.isRetrograde ? styles.statusVakri : styles.statusMarga}>
                          {p.isRetrograde ? 'Vakri (R)' : 'Marga (F)'}
                        </span>
                        {p.dignity !== 'Neutral' && (
                          <span className={styles.combustBadge} style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                            {p.dignity}
                          </span>
                        )}
                        {p.isCombust && <span className={styles.combustBadge}>Combust</span>}
                      </div>
                    )
                  }
                ]
              })) || []
            )}

            {/* Detailed Table for Professionals */}
            {renderTableSection(
              "Detailed Planetary Metadata",
              "Technical ephemeris data including combustion and retrograde status",
              ["Planet", "Rashi", "Degree", "Status", "Dignity", "Combust"],
              planetaryData.planets?.map((planet, idx) => ({
                cells: [
                  { content: planet.name, className: styles.nameCell },
                  { content: planet.rashi, className: styles.rashiCell },
                  { content: planet.formatted, className: styles.degreeCell },
                  { content: planet.isRetrograde ? 'Vakri (R)' : 'Marga', className: planet.isRetrograde ? styles.statusVakri : styles.statusMarga },
                  { content: planet.dignity, className: styles.valueCell },
                  { content: planet.isCombust ? <span className={styles.combustBadge}>Yes</span> : 'No' }
                ]
              })) || []
            )}

            <div className="info-note">
              <div>
                <p>All positions are calculated using the <strong>Sidereal Zodiac</strong> with high-accuracy astronomical algorithms.</p>
                {planetaryData.planets?.[0] && (
                  <p className="ayanamsa-meta" style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                    Current Ayanamsa: <strong>{planetaryData.ayanamsa || '24° 0\' 0"'}</strong> (Lahiri)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetaryPage;
