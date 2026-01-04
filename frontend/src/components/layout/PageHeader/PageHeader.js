import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, icon, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {icon && <span className="page-header-icon">{icon}</span>}
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
