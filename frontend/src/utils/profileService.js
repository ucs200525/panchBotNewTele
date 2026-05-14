import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Service to sync profile between MongoDB and localStorage
 */
export const ProfileService = {

  // --- AUTH METHODS ---
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    ProfileService.setToken(data.token);
    ProfileService.syncToLocal(data.user);
    return data;
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    ProfileService.setToken(data.token);
    ProfileService.syncToLocal(data.user);
    return data;
  },

  logout: () => {
    localStorage.removeItem('astro_token');
    localStorage.removeItem('astro_name');
    localStorage.removeItem('astro_nakshatra');
    localStorage.removeItem('astro_rashi');
    localStorage.removeItem('astro_birth_date');
    localStorage.removeItem('astro_birth_time');
    localStorage.removeItem('astro_guest_mode');
    window.location.href = '/login';
  },

  setToken: (token) => {
    localStorage.setItem('astro_token', token);
    localStorage.removeItem('astro_guest_mode');
  },

  getToken: () => localStorage.getItem('astro_token'),

  isLoggedIn: () => !!localStorage.getItem('astro_token'),

  // --- PROFILE METHODS ---
  fetchProfile: async () => {
    const token = ProfileService.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) ProfileService.logout();
        return null;
      }
      const data = await res.json();
      ProfileService.syncToLocal(data);
      return data;
    } catch (err) {
      return null;
    }
  },

  saveProfile: async (profileData) => {
    const token = ProfileService.getToken();
    if (!token) {
      ProfileService.syncToLocal(profileData);
      return profileData;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error('Failed to save to DB');
      const data = await res.json();
      ProfileService.syncToLocal(data.profile);
      return data.profile;
    } catch (err) {
      ProfileService.syncToLocal(profileData);
      return profileData;
    }
  },


  syncToLocal: (p) => {
    if (!p) return;
    localStorage.setItem('astro_name', p.name || '');
    localStorage.setItem('astro_nakshatra', p.nakshatra || '');
    localStorage.setItem('astro_rashi', p.rashi || '');
    localStorage.setItem('astro_city', p.city || 'Hyderabad');
    localStorage.setItem('astro_birth_date', p.dob || '');
    localStorage.setItem('astro_birth_time', p.time || '');
    localStorage.setItem('astro_lat', p.lat || '');
    localStorage.setItem('astro_lng', p.lng || '');
  },

  getLocalProfile: () => {
    return {
      name: localStorage.getItem('astro_name') || '',
      nakshatra: localStorage.getItem('astro_nakshatra') || '',
      rashi: localStorage.getItem('astro_rashi') || '',
      city: localStorage.getItem('astro_city') || 'Hyderabad',
      dob: localStorage.getItem('astro_birth_date') || '',
      time: localStorage.getItem('astro_birth_time') || '',
      lat: localStorage.getItem('astro_lat') || '',
      lng: localStorage.getItem('astro_lng') || ''
    };
  }
};
