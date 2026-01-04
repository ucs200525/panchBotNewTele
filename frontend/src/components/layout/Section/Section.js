import React from 'react';
import './Section.css';

const Section = ({ title, icon, children, className = '' }) => {
  return (
    <section className={`section ${className}`}>
      {(title || icon) && (
        <div className="section-header">
          {icon && <span className="section-icon">{icon}</span>}
          {title && <h2 className="section-title">{title}</h2>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};

export default Section;
