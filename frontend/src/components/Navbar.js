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
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          className="hamburger-btn"
          onClick={() => setOpenDropdown(openDropdown === 'mobile-menu' ? null : 'mobile-menu')}
          aria-label="Toggle Menu"
        >
          <span className="hamburger-icon">☰</span>
        </button>

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

        {/* Desktop Navigation Links */}
        <div className="navbar-menu desktop-menu">
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
              className={`nav-link dropdown-trigger ${['/panchang', '/lagna', '/hora'].includes(location.pathname) ? 'active' : ''
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
            to="/good-timings"
            className={`nav-link ${isActive('/good-timings') ? 'active' : ''}`}
            onClick={closeDropdowns}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Good Timings</span>
          </Link>

          <Link
            to="/combine"
            className={`nav-link ${isActive('/combine') ? 'active' : ''}`}
            onClick={closeDropdowns}
          >
            <span className="nav-icon">🔮</span>
            <span className="nav-text">Combine</span>
          </Link>
        </div>

        {/* Mobile Sidebar */}
        <div className={`sidebar-overlay ${openDropdown === 'mobile-menu' ? 'active' : ''}`} onClick={closeDropdowns}></div>
        <div className={`mobile-sidebar ${openDropdown === 'mobile-menu' ? 'active' : ''}`}>
           <div className="sidebar-header">
              <span className="brand-title" style={{color: 'var(--color-primary)'}}>Menu</span>
              <button className="close-btn" onClick={closeDropdowns}>×</button>
           </div>
           
           <div className="sidebar-links">
              <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={closeDropdowns}>
                 <span className="nav-icon">🏠</span> Home
              </Link>
              <Link to="/panchaka" className={`sidebar-link ${isActive('/panchaka') ? 'active' : ''}`} onClick={closeDropdowns}>
                 <span className="nav-icon">⏰</span> Bhargava
              </Link>
              
              <div className="sidebar-divider">Panchang</div>
              <Link to="/panchang" className="sidebar-link" onClick={closeDropdowns}>📅 Daily Panchang</Link>
              <Link to="/lagna" className="sidebar-link" onClick={closeDropdowns}>🌅 Lagna Times</Link>
              <Link to="/hora" className="sidebar-link" onClick={closeDropdowns}>⌛ Hora</Link>

              <div className="sidebar-divider">Charts & Astrology</div>
              <Link to="/charts" className="sidebar-link" onClick={closeDropdowns}>📊 Birth Charts</Link>
              <Link to="/dasha" className="sidebar-link" onClick={closeDropdowns}>⏳ Vimshottari Dasha</Link>
              <Link to="/planetary" className="sidebar-link" onClick={closeDropdowns}>🪐 Planetary Positions</Link>
              <Link to="/sadesati" className="sidebar-link" onClick={closeDropdowns}>🪐 Sade Sati</Link>

              <div className="sidebar-divider">Tools</div>
              <Link to="/good-timings" className={`sidebar-link ${isActive('/good-timings') ? 'active' : ''}`} onClick={closeDropdowns}>
                 <span className="nav-icon">⭐</span> Good Timings
              </Link>
              <Link to="/combine" className={`sidebar-link ${isActive('/combine') ? 'active' : ''}`} onClick={closeDropdowns}>
                 Combine
              </Link>
           </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
