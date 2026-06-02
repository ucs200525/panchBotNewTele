import React, { useState } from 'react';
import { useBirthProfiles } from '../context/BirthProfileContext';
import { CityAutocomplete } from '../components/forms';
import styles from './BirthProfilesPage.module.css';

const BirthProfilesPage = () => {
  const { profiles: rawProfiles, selectedProfile, addProfile, deleteProfile, selectProfile, loading } = useBirthProfiles();
  // Safety guard: ensure profiles is always an array even if context returns unexpected data
  const profiles = Array.isArray(rawProfiles) ? rawProfiles : [];

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('12:00');
  const [cityName, setCityName] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCitySelect = (city) => {
    setCityName(city.name);
    setCoords({ lat: city.lat, lng: city.lng });
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) return setError('Please enter a name');
    if (!dob) return setError('Please enter date of birth');
    if (!time) return setError('Please enter time of birth');
    if (!cityName) return setError('Please search and select a city');

    let finalLat = coords.lat;
    let finalLng = coords.lng;

    setFormLoading(true);
    try {
      // If coordinates are not resolved, try resolving them through backend
      if (finalLat === null || finalLng === null) {
        const geoResponse = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/fetchCoordinates/${encodeURIComponent(cityName)}`);
        if (!geoResponse.ok) throw new Error('Could not find city. Please search again.');
        const data = await geoResponse.json();
        finalLat = data.lat;
        finalLng = data.lng;
      }

      await addProfile({
        name: name.trim(),
        dob,
        time,
        city: cityName,
        lat: finalLat,
        lng: finalLng
      });

      setName('');
      setDob('');
      setTime('12:00');
      setCityName('');
      setCoords({ lat: null, lng: null });
      setSuccess('Profile added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add profile');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>🌌 COSMIC ADDRESS BOOK</span>
        <h1>Birth Profiles Manager</h1>
        <p>Save and manage multiple birth details to instantly swap transits, charts, Sade Sati, and AI insights.</p>
      </div>

      <div className={styles.layout}>
        {/* Profile List */}
        <div className={styles.listSection}>
          <h2>Saved Profiles ({profiles.length})</h2>
          {loading ? (
            <div className={styles.loader}>Loading your birth profiles...</div>
          ) : profiles.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👤</div>
              <h3>No saved birth profiles</h3>
              <p>Add your details or your family members below to unlock personalized Vedic charts.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {profiles.map((p) => {
                const isActive = selectedProfile && selectedProfile._id === p._id;
                return (
                  <div 
                    key={p._id} 
                    className={`${styles.card} ${isActive ? styles.activeCard : ''} ${p.isPrimary ? styles.primaryCard : ''}`}
                    onClick={() => selectProfile(p)}
                  >
                    {p.isPrimary && <span className={styles.primaryBadge}>Primary</span>}
                    <div className={styles.cardHeader}>
                      <span className={styles.avatar}>
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3>{p.name}</h3>
                        <p className={styles.cityText}>📍 {p.city}</p>
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <div className={styles.metaRow}>
                        <span>Date:</span> <strong>{p.dob}</strong>
                      </div>
                      <div className={styles.metaRow}>
                        <span>Time:</span> <strong>{p.time}</strong>
                      </div>
                      {p.nakshatra && (
                        <div className={styles.astroRow}>
                          <span className={styles.astroBadge}>⭐ {p.nakshatra}</span>
                          {p.rashi && <span className={styles.astroBadge}>🌙 {p.rashi}</span>}
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          selectProfile(isActive ? null : p);
                        }} 
                        className={`${styles.selectBtn} ${isActive ? styles.selectedBtn : ''}`}
                      >
                        {isActive ? 'Selected' : 'Select'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete profile for ${p.name}?`)) {
                            deleteProfile(p._id);
                          }
                        }} 
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h3>➕ Add Birth Profile</h3>
            <p className={styles.formSubtitle}>Create family or friend profiles</p>
            
            <form onSubmit={handleAddProfile} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Shiva Kumar" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Date of Birth</label>
                <input 
                  type="date" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Time of Birth</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Birth City</label>
                <CityAutocomplete
                  value={cityName}
                  onSelect={handleCitySelect}
                  onChange={setCityName}
                  placeholder="Type to search birth place..."
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <button type="submit" disabled={formLoading} className={styles.submitBtn}>
                {formLoading ? 'Resolving Coordinates & Nakshatra...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthProfilesPage;
