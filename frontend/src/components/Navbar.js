import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import BotPromotion from './BotPromotion';

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

          {/* <Link
            to="/panchaka"
            className={`nav-link ${isActive('/panchaka') ? 'active' : ''}`}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Panchaka Rahita</span>
          </Link> */}

          <Link
            to="/panchaka-swiss"
            className={`nav-link ${isActive('/panchaka-swiss') ? 'active' : ''}`}
          >
            <span className="nav-icon">🔬</span>
            <span className="nav-text">Panchaka </span>
          </Link>

          {/* <Link 
            to="/combine" 
            className={`nav-link ${isActive('/combine') ? 'active' : ''}`}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">Good Timings</span>
          </Link> */}

          <Link 
            to="/combine-swiss" 
            className={`nav-link ${isActive('/combine-swiss') ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            <span className="nav-text">Good Timings </span>
          </Link>

          {/* <Link 
            to="/panchang-details" 
            className={`nav-link ${isActive('/panchang-details') ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Panchang Details</span>
          </Link>
 */}


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

        {/* Telegram Bot Promo Icon */}
        {/* <div className="navbar-actions">
          <BotPromotion />
        </div> */}

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
