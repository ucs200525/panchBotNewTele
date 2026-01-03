import React from 'react';
// import styles from './LoadingSpinner.module.css'; // Import the CSS module

const LoadingSpinner = () => {
  return (
    <div
      id="loadingMessage"
      style={{
        textAlign: 'center',
        margin: '20px',
        fontSize: '20px',
        color: '#ff0000',
      }}
    >
      Loading, please wait...
    </div>
  );
};

export default LoadingSpinner;
