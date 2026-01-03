import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🕉️</span>
            <div className="brand-text">
              <span className="brand-title">Bhargava Panchang</span>
              <span className="brand-subtitle">24-Minute Periods</span>
            </div>
          </Link>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={isMenuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
          <span className={isMenuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
          <span className={isMenuOpen ? 'hamburger-line open' : 'hamburger-line'}></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link 
            to="/panchaka" 
            className={`nav-link ${isActive('/panchaka') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Panchaka Rahita</span>
          </Link>

          <Link 
            to="/combine" 
            className={`nav-link ${isActive('/combine') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Good Timings</span>
          </Link>

          {/* More Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-link dropdown-trigger">
              <span className="nav-icon">📚</span>
              <span className="nav-text">More</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <Link to="/DownloadImage" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                📥 Download Image
              </Link>
              <Link to="/drik-table-image" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                📊 Drik Table
              </Link>
              <Link to="/bhargav-table-image" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                📊 Bhargav Table
              </Link>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="navbar-actions">
          <button className="action-btn" title="Settings">
            ⚙️
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
