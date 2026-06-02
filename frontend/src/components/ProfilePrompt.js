import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileService } from '../utils/profileService';
import { useBirthProfiles } from '../context/BirthProfileContext';

const ProfilePrompt = () => {
  const { profiles, loading } = useBirthProfiles();
  const [hasProfile, setHasProfile] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't show on advisor or profiles page itself
    if (location.pathname === '/advisor' || location.pathname === '/profiles') {
      setHasProfile(true);
      return;
    }

    if (!loading) {
      setHasProfile(profiles.length > 0);
    }
  }, [location.pathname, profiles, loading]);

  if (hasProfile || localStorage.getItem('astro_guest_mode') === 'true') return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1e1b4b 0%, #4338ca 100%)',
      padding: '10px 24px',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.88rem',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      zIndex: 1000,
      position: 'relative',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.3rem' }}>✨</span>
        <span>
          <strong style={{ color: '#c7d2fe' }}>Unlock Personalized Vedic Astrology!</strong> Setup your Birth Profile once to unlock custom Muhurats, Sade Sati transits, and AI birth charts.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => navigate(ProfileService.isLoggedIn() ? '/profiles' : '/login')}
          style={{
            background: '#fff',
            color: '#4338ca',
            border: 'none',
            padding: '5px 14px',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}
        >
          {ProfileService.isLoggedIn() ? 'Setup Birth Profile 🚀' : 'Login / Register 🚀'}
        </button>

        <button 
          onClick={() => {
            localStorage.setItem('astro_guest_mode', 'true');
            setHasProfile(true);
          }}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '5px 12px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}
        >
          Stay as Guest
        </button>
      </div>
    </div>
  );
};

export default ProfilePrompt;
