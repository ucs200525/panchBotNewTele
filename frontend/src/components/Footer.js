import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [stats, setStats] = useState({ totalVisits: 0, onlineUsers: 3 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || '';
        const res = await fetch(`${apiUrl}/api/public/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalVisits: data.totalVisits,
            onlineUsers: data.onlineUsers
          });
        }
      } catch (err) {
        console.error('Failed to fetch site stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <footer className="cosmic-footer">
      <div className="footer-container">
        
        {/* Section 1: Brand & Explanations */}
        <div className="footer-column brand-column">
          <h3 className="footer-logo">VedicVishwa</h3>
          <p className="footer-desc">
            VedicVishwa bridges ancient wisdom and modern physics. We use high-precision Swiss Ephemeris data to deliver real-time astrological transits and calculations.
          </p>
          <div className="stats-box">
            <div className="stat-item">
              <span className="stat-indicator pulse"></span>
              <span className="stat-label"><strong>{stats.onlineUsers}</strong> Seekers Online</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-label"><strong>{stats.totalVisits}</strong> Cosmic Visits</span>
            </div>
          </div>
        </div>

        {/* Section 2: Services Explanations */}
        <div className="footer-column services-column">
          <h4>Vedic Services & Tools</h4>
          <ul className="footer-services-list">
            <li>
              <Link to="/advisor"><strong>Personal Advisor:</strong></Link>
              <span> Real-time Tara Bala and Chandra Bala auspiciousness guide.</span>
            </li>
            <li>
              <Link to="/charts"><strong>Divisional Charts:</strong></Link>
              <span> Shodashvarga - 16 divisional charts for detailed life areas.</span>
            </li>
            <li>
              <Link to="/dasha"><strong>Vimshottari Dasha:</strong></Link>
              <span> 120-year planetary time periods based on your natal Moon position.</span>
            </li>
            <li>
              <Link to="/sadesati"><strong>Sade Sati Report:</strong></Link>
              <span> Lifecycle analysis of Saturn transits through your zodiac.</span>
            </li>
            <li>
              <Link to="/chat"><strong>AI Chat Copilot:</strong></Link>
              <span> Converse with our Vedic AI Astrologer trained on classical texts.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Contact & Links */}
        <div className="footer-column contact-column">
          <h4>Get in Touch</h4>
          <p>Have questions or feedback? Connect with us for support and inquiries.</p>
          <a href="mailto:support@vedicvishwa.com" className="email-link">
            ✉️ support@vedicvishwa.com
          </a>
          <div className="footer-links">
            <Link to="/profiles" className="footer-link">Manage Profiles</Link>
            <span className="divider">•</span>
            <Link to="/" className="footer-link">Bhargava Panchangam</Link>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} VedicVishwa. All rights reserved. Precision computations powered by Swiss Ephemeris.</p>
      </div>
    </footer>
  );
};

export default Footer;
