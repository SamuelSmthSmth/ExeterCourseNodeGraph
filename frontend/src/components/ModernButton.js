import React from 'react';
import './ModernButton.css';

const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  icon = null,
  onClick,
  className = '',
  ...props 
}) => {
  const classes = [
    'modern-button',
    `button-${variant}`,
    `button-${size}`,
    disabled && 'button-disabled',
    loading && 'button-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="button-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          <span className="button-text">{children}</span>
        </>
      )}
    </button>
  );
};

export default ModernButton;
