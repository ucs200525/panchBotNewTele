import React, { createContext, useState, useContext, useEffect } from 'react';
import { ProfileService } from '../utils/profileService';

const BirthProfileContext = createContext();

const LOCAL_PROFILES_KEY = 'vva_user_profiles';
const ACTIVE_PROFILE_KEY = 'vva_active_profile';

const getLocalProfilesArray = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).map((p, index) => ({
        ...p,
        _id: p._id || `guest_migrated_${index}_${Date.now()}`,
        name: p.name || 'Guest Seeker',
        city: p.city || p.cityName || 'Hyderabad',
        dob: p.dob || p.birthDate || '',
        time: p.time || p.birthTime || '12:00',
        lat: p.lat || 17.3850,
        lng: p.lng || 78.4867
      }));
    }
    return [];
  } catch (e) {
    console.error('Error parsing local profiles:', e);
    return [];
  }
};

export const BirthProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = ProfileService.isLoggedIn();

  // Load profiles on mount or when auth state changes
  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const token = ProfileService.getToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/user/birth-profiles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Defensive: API should return array, but guard just in case
          const profilesArray = Array.isArray(data) ? data : (data?.profiles || []);
          setProfiles(profilesArray);
          // Set selected profile from saved active or default to primary
          const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY);
          let active = profilesArray.find(p => p._id === savedActiveId);
          if (!active) {
            active = profilesArray.find(p => p.isPrimary) || profilesArray[0] || null;
          }
          setSelectedProfile(active);
        }
      } else {
        // Guest mode - load from localStorage
        const local = getLocalProfilesArray();
        setProfiles(local);
        const savedActiveName = localStorage.getItem(ACTIVE_PROFILE_KEY);
        let active = local.find(p => p.name === savedActiveName);
        if (!active) {
          active = local.find(p => p.isPrimary) || local[0] || null;
        }
        setSelectedProfile(active);
      }
    } catch (err) {
      console.error('Error fetching birth profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProfile = async (profileData) => {
    try {
      if (isLoggedIn) {
        const token = ProfileService.getToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/user/birth-profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save profile');
        }
        await fetchProfiles();
      } else {
        // Guest Mode
        // Auto-calculate Nakshatra & Rashi first
        let nakshatra = '';
        let rashi = '';
        try {
          const calcRes = await fetch(
            `${process.env.REACT_APP_API_URL || ''}/api/calculate-birth-details?dob=${profileData.dob}&time=${profileData.time}&lat=${profileData.lat}&lng=${profileData.lng}`
          );
          if (calcRes.ok) {
            const calcData = await calcRes.json();
            nakshatra = calcData.nakshatra || '';
            rashi = calcData.rashi || '';
          }
        } catch (e) {
          console.error('Error calculating birth details for guest:', e);
        }

        const local = getLocalProfilesArray();
        const isPrimary = local.length === 0;
        const newProfile = {
          ...profileData,
          _id: `guest_${Date.now()}`,
          nakshatra,
          rashi,
          isPrimary
        };

        const updated = [newProfile, ...local];
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(updated));
        setProfiles(updated);
        if (isPrimary) {
          setSelectedProfile(newProfile);
          localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.name);
        }
      }
    } catch (err) {
      console.error('Error adding profile:', err);
      throw err;
    }
  };

  const updateProfile = async (id, profileData) => {
    try {
      if (isLoggedIn) {
        const token = ProfileService.getToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/user/birth-profiles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });
        if (!res.ok) throw new Error('Failed to update profile');
        await fetchProfiles();
      } else {
        // Guest Mode
        let local = getLocalProfilesArray();
        
        let nakshatra = profileData.nakshatra;
        let rashi = profileData.rashi;
        
        // Recalculate if birth details changed
        const existing = local.find(p => p._id === id);
        if (existing && (profileData.dob !== existing.dob || profileData.time !== existing.time || profileData.lat !== existing.lat || profileData.lng !== existing.lng)) {
          try {
            const calcRes = await fetch(
              `${process.env.REACT_APP_API_URL || ''}/api/calculate-birth-details?dob=${profileData.dob || existing.dob}&time=${profileData.time || existing.time}&lat=${profileData.lat || existing.lat}&lng=${profileData.lng || existing.lng}`
            );
            if (calcRes.ok) {
              const calcData = await calcRes.json();
              nakshatra = calcData.nakshatra || '';
              rashi = calcData.rashi || '';
            }
          } catch (e) {
            console.error('Error calculating birth details:', e);
          }
        }

        const updated = local.map(p => {
          if (p._id === id) {
            const updatedProfile = {
              ...p,
              ...profileData,
              nakshatra: nakshatra || p.nakshatra,
              rashi: rashi || p.rashi
            };
            if (profileData.isPrimary) {
              updatedProfile.isPrimary = true;
            }
            return updatedProfile;
          }
          return profileData.isPrimary ? { ...p, isPrimary: false } : p;
        });

        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(updated));
        setProfiles(updated);
        
        // Update selected profile if it's the one that was updated
        const currentActive = updated.find(p => p._id === id);
        if (selectedProfile && selectedProfile._id === id) {
          setSelectedProfile(currentActive);
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const deleteProfile = async (id) => {
    try {
      if (isLoggedIn) {
        const token = ProfileService.getToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/user/birth-profiles/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete profile');
        await fetchProfiles();
      } else {
        // Guest Mode
        let local = getLocalProfilesArray();
        const toDelete = local.find(p => p._id === id);
        const updated = local.filter(p => p._id !== id);
        
        if (toDelete && toDelete.isPrimary && updated.length > 0) {
          updated[0].isPrimary = true;
        }

        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(updated));
        setProfiles(updated);

        // Update selected if we deleted the selected one
        if (selectedProfile && selectedProfile._id === id) {
          const nextActive = updated.find(p => p.isPrimary) || updated[0] || null;
          setSelectedProfile(nextActive);
          if (nextActive) {
            localStorage.setItem(ACTIVE_PROFILE_KEY, nextActive.name);
          } else {
            localStorage.removeItem(ACTIVE_PROFILE_KEY);
          }
        }
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      throw err;
    }
  };

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
    if (profile) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, isLoggedIn ? profile._id : profile.name);
      // Synchronize back to simple ProfileService local storage keys for backward compatibility
      ProfileService.syncToLocal({
        name: profile.name,
        dob: profile.dob,
        time: profile.time,
        city: profile.city,
        lat: profile.lat,
        lng: profile.lng,
        nakshatra: profile.nakshatra,
        rashi: profile.rashi
      });
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  };

  return (
    <BirthProfileContext.Provider value={{
      profiles,
      selectedProfile,
      loading,
      fetchProfiles,
      addProfile,
      updateProfile,
      deleteProfile,
      selectProfile
    }}>
      {children}
    </BirthProfileContext.Provider>
  );
};

export const useBirthProfiles = () => {
  return useContext(BirthProfileContext);
};
