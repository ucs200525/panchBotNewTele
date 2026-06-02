import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Service to sync profile between MongoDB and localStorage
 */
export const ProfileService = {

  // --- AUTH METHODS ---
  register: async (name, email, password, dob, time, city, lat, lng) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, dob, time, city, lat, lng })
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
    const existing = ProfileService.getLocalProfile();
    localStorage.setItem('astro_name', p.name !== undefined ? p.name : existing.name);
    localStorage.setItem('astro_nakshatra', p.nakshatra !== undefined ? p.nakshatra : existing.nakshatra);
    localStorage.setItem('astro_rashi', p.rashi !== undefined ? p.rashi : existing.rashi);
    localStorage.setItem('astro_city', p.city !== undefined ? p.city : existing.city);
    localStorage.setItem('astro_birth_date', p.dob !== undefined ? p.dob : existing.dob);
    localStorage.setItem('astro_birth_time', p.time !== undefined ? p.time : existing.time);
    localStorage.setItem('astro_lat', p.lat !== undefined ? p.lat : existing.lat);
    localStorage.setItem('astro_lng', p.lng !== undefined ? p.lng : existing.lng);
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
