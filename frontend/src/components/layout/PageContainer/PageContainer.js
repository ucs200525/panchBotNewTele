import React from 'react';
import './PageContainer.css';

const PageContainer = ({ children, maxWidth = '1200px', className = '' }) => {
  return (
    <div className={`page-container ${className}`} style={{ maxWidth }}>
      {children}
    </div>
  );
};

export default PageContainer;
