import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileService } from '../utils/profileService';

const ProfilePrompt = () => {
  const [hasProfile, setHasProfile] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      // Don't show on advisor page itself
      if (location.pathname === '/advisor') {
        setHasProfile(true);
        return;
      }

      const local = ProfileService.getLocalProfile();
      if (!local.name || !local.dob) {
        // Check DB
        const dbProfile = await ProfileService.fetchProfile();
        if (!dbProfile) {
          setHasProfile(false);
        } else {
          setHasProfile(true);
        }
      } else {
        setHasProfile(true);
      }
    };
    check();
  }, [location.pathname]);

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
          <strong style={{ color: '#c7d2fe' }}>No Login Needed!</strong> Just setup your Birth Profile once to unlock personalized Muhurats and AI Birth Charts.
        </span>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => navigate('/login')}
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
          Login / Register 🚀
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
