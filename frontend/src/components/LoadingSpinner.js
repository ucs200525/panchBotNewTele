import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = "Loading, please wait..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        {/* Spinning circle */}
        <div className="spinner-circle">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        {/* Loading text */}
        <p className="loading-text">{message}</p>
        
        {/* Animated dots */}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
