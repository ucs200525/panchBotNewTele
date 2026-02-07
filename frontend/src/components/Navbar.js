import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={closeDropdowns}>
            <span className="brand-icon">🕉️</span>
            <div className="brand-text">
              <span className="brand-title">Bhargava Panchang</span>
              <span className="brand-subtitle">Vedic Astrology</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="navbar-menu">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeDropdowns}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link
            to="/panchaka"
            className={`nav-link ${isActive('/panchaka') ? 'active' : ''}`}
            onClick={closeDropdowns}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Bhargava</span>
          </Link>

          {/* Panchang Dropdown */}
          <div className="nav-dropdown">
            <button
              className={`nav-link dropdown-trigger ${['/panchang', '/lagna', '/hora', '/astronomical'].includes(location.pathname) ? 'active' : ''
                }`}
              onClick={() => toggleDropdown('panchang')}
            >
              <span className="nav-icon">📅</span>
              <span className="nav-text">Panchang</span>
              <span className={`dropdown-arrow ${openDropdown === 'panchang' ? 'open' : ''}`}>▼</span>
            </button>
            {openDropdown === 'panchang' && (
              <div className="dropdown-menu">
                <Link
                  to="/panchang"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  📅 Daily Panchang
                </Link>
                <Link
                  to="/lagna"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  🌅 Lagna Times
                </Link>
                <Link
                  to="/hora"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  ⌛ Hora
                </Link>
                <Link
                  to="/astronomical"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  🌌 Astronomical
                </Link>
              </div>
            )}
          </div>

          {/* Charts & Predictions Dropdown */}
          <div className="nav-dropdown">
            <button
              className={`nav-link dropdown-trigger ${['/charts', '/dasha', '/planetary', '/sadesati'].includes(location.pathname) ? 'active' : ''
                }`}
              onClick={() => toggleDropdown('charts')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Charts</span>
              <span className={`dropdown-arrow ${openDropdown === 'charts' ? 'open' : ''}`}>▼</span>
            </button>
            {openDropdown === 'charts' && (
              <div className="dropdown-menu">
                <Link
                  to="/charts"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  📊 Birth Charts
                </Link>
                <Link
                  to="/dasha"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  ⏳ Vimshottari Dasha
                </Link>
                <Link
                  to="/planetary"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  🪐 Planetary Positions
                </Link>
                <Link
                  to="/sadesati"
                  className="dropdown-item"
                  onClick={closeDropdowns}
                >
                  🪐 Sade Sati
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/combine"
            className={`nav-link ${isActive('/combine') ? 'active' : ''}`}
            onClick={closeDropdowns}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Good Timings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
