import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="pro-navbar">
      {/* Tier 1: Brand, Search, Login */}
      <div className="navbar-upper">
        <div className="navbar-container">
          <div className="upper-left">
            <Link to="/" className="pro-logo">
              <span className="logo-text">VedicVishwa</span>
            </Link>
          </div>

          <div className="upper-center">
            {/* Search bar removed as per user request */}
          </div>

          <div className="upper-right">
            <button className="pro-login-btn">
              <span className="login-icon">👤</span>
              <span className="login-text">Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Category Links with Hover Menus */}
      <div className="navbar-lower">
        <div className="navbar-container">
          <div className="lower-menu">
            <div className="nav-item-wrapper">
              <Link to="/" className={`lower-link ${isActive('/') ? 'active' : ''}`}>
                <span className="lower-icon">🏠</span> HOME
              </Link>
            </div>

            {/* Panchang Category with Dropdown */}
            <div className="nav-item-wrapper dropdown-hover">
              <div className="lower-link">
                <span className="lower-icon">📅</span> PANCHANG <span className="arrow-small">▼</span>
              </div>
              <div className="mega-dropdown">
                <Link to="/panchang" className="dropdown-sub-item">Daily Panchang</Link>
                <Link to="/panchang-swiss" className="dropdown-sub-item">Swiss Daily Precision</Link>
                <Link to="/lagna" className="dropdown-sub-item">Lagna (Ascendant) Times</Link>
                <Link to="/hora" className="dropdown-sub-item">Hora Calculator</Link>
              </div>
            </div>

            {/* Astrology Category with Dropdown */}
            <div className="nav-item-wrapper dropdown-hover">
              <div className="lower-link">
                <span className="lower-icon">⚙️</span> ASTROLOGY <span className="arrow-small">▼</span>
              </div>
              <div className="mega-dropdown">
                <Link to="/charts" className="dropdown-sub-item">Birth Charts (Janam Kundli)</Link>
                <Link to="/dasha" className="dropdown-sub-item">Vimshottari Dasha</Link>
                <Link to="/planetary" className="dropdown-sub-item">Planetary Positions</Link>
                <Link to="/sadesati" className="dropdown-sub-item">Sade Sati Report</Link>
              </div>
            </div>

            {/* Muhurat Category with Dropdown */}
            <div className="nav-item-wrapper dropdown-hover">
              <div className="lower-link">
                <span className="lower-icon">✨</span> MUHURAT <span className="arrow-small">▼</span>
              </div>
              <div className="mega-dropdown">
                <Link to="/good-timings" className="dropdown-sub-item">Auspicious (Good) Timings</Link>
                <Link to="/panchaka-swiss" className="dropdown-sub-item">Swiss Panchaka Guide</Link>
              </div>
            </div>

            <div className="nav-item-wrapper dropdown-hover">
              <div className="lower-link">
                <span className="lower-icon">🔄</span> TOOLS <span className="arrow-small">▼</span>
              </div>
              <div className="mega-dropdown">
                <Link to="/combine" className="dropdown-sub-item">Combined View</Link>
                <Link to="/panchaka" className="dropdown-sub-item">Old Panchaka Tool</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
