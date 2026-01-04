import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  icon,
  variant = 'default',
  hoverable = false,
  className = '',
  ...props 
}) => {
  const cardClassName = [
    'card',
    `card-${variant}`,
    hoverable && 'card-hoverable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName} {...props}>
      {(title || icon) && (
        <div className="card-header">
          {icon && <span className="card-icon">{icon}</span>}
          {title && <h3 className="card-title">{title}</h3>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
