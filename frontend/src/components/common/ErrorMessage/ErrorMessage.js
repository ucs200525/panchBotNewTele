import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
