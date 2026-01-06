import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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

        {/* Navigation Links - Always visible, no hamburger */}
        <div className="navbar-menu">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link
            to="/panchaka"
            className={`nav-link ${isActive('/panchaka') ? 'active' : ''}`}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Panchaka Rahita</span>
          </Link>

          {/* <Link
            to="/panchang"
            className={`nav-link ${isActive('/panchang') ? 'active' : ''}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Panchang</span>
          </Link>

          <Link 
            to="/charts" 
            className={`nav-link ${isActive('/charts') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Charts</span>
          </Link>

          <Link 
            to="/dasha" 
            className={`nav-link ${isActive('/dasha') ? 'active' : ''}`}
          >
            <span className="nav-icon">⏳</span>
            <span className="nav-text">Dasha</span>
          </Link>

          <Link 
            to="/lagna" 
            className={`nav-link ${isActive('/lagna') ? 'active' : ''}`}
          >
            <span className="nav-icon">🌅</span>
            <span className="nav-text">Lagna</span>
          </Link>

          <Link 
            to="/hora" 
            className={`nav-link ${isActive('/hora') ? 'active' : ''}`}
          >
            <span className="nav-icon">⌛</span>
            <span className="nav-text">Hora</span>
          </Link> */}

          <Link 
            to="/combine" 
            className={`nav-link ${isActive('/combine') ? 'active' : ''}`}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Good Timings</span>
          </Link>

          {/* Removed More dropdown - uncomment if needed */}
          {/* 
          <div className="nav-dropdown">
            <button className="nav-link dropdown-trigger">
              <span className="nav-icon">📚</span>
              <span className="nav-text">More</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <Link to="/DownloadImage" className="dropdown-item">
                📥 Download Image
              </Link>
              <Link to="/drik-table-image" className="dropdown-item">
                📊 Drik Table
              </Link>
              <Link to="/bhargav-table-image" className="dropdown-item">
                📊 Bhargav Table
              </Link>
            </div>
          </div>
          */}
        </div>

        {/* Settings button - Optional */}
        {/* <div className="navbar-actions">
          <button className="action-btn" title="Settings">
            ⚙️
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
