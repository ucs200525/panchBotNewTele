import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProfileService } from '../utils/profileService';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  
  const userName = localStorage.getItem('astro_name');
  const isLoggedIn = ProfileService.isLoggedIn();

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveSubmenu(null);
  };

  // Close everything
  const closeAll = () => {
    setIsMobileMenuOpen(false);
    setActiveSubmenu(null);
  };

  // Toggle submenu on mobile
  const handleToggleSubmenu = (menuId) => {
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
  };

  // Close menu when route changes
  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  const handleLogout = () => {

    ProfileService.logout();
    navigate('/login');
  };

  return (
    <nav className="pro-navbar">
      {/* Tier 1: Brand & Actions */}
      <div className="navbar-upper">
        <div className="navbar-container">
          <div className="upper-left">
            <Link to="/" className="pro-logo" onClick={closeAll}>
              <span className="logo-text">VedicVishwa</span>
            </Link>
          </div>

          <div className="upper-right">
            {isLoggedIn ? (
              <div className="user-profile-nav desktop-only">
                <span className="user-welcome">Namaste, {userName}</span>
                <button onClick={handleLogout} className="pro-login-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button className="pro-login-btn desktop-only" onClick={() => navigate('/login')}>
                <span className="login-icon">👤</span>
                <span className="login-text">Login</span>
              </button>
            )}

            <button

              className="mobile-menu-btn mobile-only"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <span className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Navigation Links */}
      <div className={`navbar-lower ${isMobileMenuOpen ? 'mobile-show' : ''}`}>
        <div className="navbar-container">
          <div className="menu-list">

            {/* Muhurat Submenu */}
            <div className={`menu-item-container has-dropdown ${activeSubmenu === 'muhurat' ? 'expanded' : ''}`}>
              <div className="menu-link-wrapper">
                <div className="menu-link" onClick={() => handleToggleSubmenu('muhurat')}>
                  <span className="menu-icon">✨</span> MUHURAT
                  <span className="chevron-icon"></span>
                </div>
              </div>
              <div className="submenu-content">
                <Link to="/good-timings" className="submenu-link">Auspicious Timings</Link>
                <Link to="/panchaka-swiss" className="submenu-link"> Panchaka Rahitha Muhuratam</Link>
                <Link to="/" className="submenu-link">Bhargava Panchangam</Link>
                <Link to="/choghadiya-info" className="submenu-link">Choghadiya Calculator</Link>
              </div>
            </div>


            {/* Panchang Submenu */}
            <div className={`menu-item-container has-dropdown ${activeSubmenu === 'panchang' ? 'expanded' : ''}`}>
              <div className="menu-link-wrapper">
                <div className="menu-link" onClick={() => handleToggleSubmenu('panchang')}>
                  <span className="menu-icon">📅</span> PANCHANG
                  <span className="chevron-icon"></span>
                </div>
              </div>
              <div className="submenu-content">
                <Link to="/panchang" className="submenu-link">Daily Panchang</Link>
                {/* <Link to="/panchang-swiss" className="submenu-link">High Precision</Link> */}
                <Link to="/lagna" className="submenu-link">Lagna Times</Link>
                <Link to="/hora" className="submenu-link">Hora Calculator</Link>
              </div>
            </div>

            {/* Astrology Submenu */}
            <div className={`menu-item-container has-dropdown ${activeSubmenu === 'astrology' ? 'expanded' : ''}`}>
              <div className="menu-link-wrapper">
                <div className="menu-link" onClick={() => handleToggleSubmenu('astrology')}>
                  <span className="menu-icon">⚙️</span> ASTROLOGY
                  <span className="chevron-icon"></span>
                </div>
              </div>
              <div className="submenu-content">
                <Link to="/profiles" className="submenu-link">Birth Profiles 👤</Link>
                <Link to="/advisor" className="submenu-link">Personal Advisor 🌟</Link>
                <Link to="/charts" className="submenu-link">Birth Charts</Link>
                <Link to="/dasha" className="submenu-link">Vimshottari Dasha</Link>
                <Link to="/planetary" className="submenu-link">Planetary Positions</Link>
                <Link to="/sadesati" className="submenu-link">Sade Sati Report</Link>
              </div>
            </div>


            {/* Tools Submenu */}
            <div className={`menu-item-container has-dropdown ${activeSubmenu === 'tools' ? 'expanded' : ''}`}>
              <div className="menu-link-wrapper">
                <div className="menu-link" onClick={() => handleToggleSubmenu('tools')}>
                  <span className="menu-icon">🔄</span> TOOLS
                  <span className="chevron-icon"></span>
                </div>
              </div>
              <div className="submenu-content">
                <Link to="/chat" className="submenu-link">Vedic Chat Copilot 🔮</Link>
                <Link to="/combine" className="submenu-link">Combined View</Link>
                <Link to="/panchaka" className="submenu-link">Old Panchaka Tool</Link>
                <Link to="/" className="submenu-link">Bhargava Panchangam</Link>
              </div>
            </div>

            {/* Mobile Login Item */}
            <div className="menu-item-container mobile-only-item">
              {isLoggedIn ? (
                <div className="menu-link mobile-login-item" onClick={() => { closeAll(); handleLogout(); }}>
                  <span className="menu-icon">👤</span> LOGOUT ({userName || 'User'})
                </div>
              ) : (
                <div className="menu-link mobile-login-item" onClick={() => { closeAll(); navigate('/login'); }}>
                  <span className="menu-icon">👤</span> LOGIN / REGISTER
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && <div className="nav-backdrop" onClick={closeAll}></div>}
    </nav>
  );
};

export default Navbar;
