import React from 'react';
import { useBirthProfiles } from '../../context/BirthProfileContext';
import { useNavigate } from 'react-router-dom';
import './ProfileSelector.css';

const ProfileSelector = ({ onProfileChange }) => {
  const { profiles, selectedProfile, selectProfile } = useBirthProfiles();
  const navigate = useNavigate();

  const handleSelect = (e) => {
    const profileId = e.target.value;
    const profile = profiles.find(p => p._id === profileId) || null;
    selectProfile(profile);
    if (onProfileChange && profile) {
      onProfileChange(profile);
    }
  };

  // Safety guard: ensure profiles is always an array
  const safeProfiles = Array.isArray(profiles) ? profiles : [];

  return (
    <div className="profile-selector-container">
      <div className="profile-selector-inner">
        <label htmlFor="birth-profile-select" className="profile-selector-label">
          👤 Profile:
        </label>

        {safeProfiles.length === 0 ? (
          <button
            type="button"
            className="profile-selector-setup-btn"
            onClick={() => navigate('/profiles')}
          >
            ➕ Setup Birth Profile
          </button>
        ) : (
          <>
            <select
              id="birth-profile-select"
              className="profile-selector-dropdown"
              value={selectedProfile ? selectedProfile._id : ''}
              onChange={handleSelect}
            >
              <option value="">-- Select Profile --</option>
              {safeProfiles.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>

            {selectedProfile && (
              <span className="profile-selector-active-hint">
                ✦ Active
              </span>
            )}
          </>
        )}

        {safeProfiles.length > 0 && (
          <button
            type="button"
            className="profile-selector-manage-btn"
            onClick={() => navigate('/profiles')}
            title="Manage Birth Profiles"
          >
            ⚙️ Manage
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;
