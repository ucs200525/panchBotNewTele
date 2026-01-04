import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  ...props 
}) => {
  const className = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    disabled && 'btn-disabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
