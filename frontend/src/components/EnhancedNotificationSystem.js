import React, { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced Notification Types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Enhanced Notification Icons
const NotificationIcon = ({ type, size = 20 }) => {
  const iconStyle = { width: size, height: size, flexShrink: 0 };
  
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return (
        <svg style={iconStyle} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case NOTIFICATION_TYPES.ERROR:
      return (
        <svg style={iconStyle} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case NOTIFICATION_TYPES.WARNING:
      return (
        <svg style={iconStyle} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case NOTIFICATION_TYPES.INFO:
      return (
        <svg style={iconStyle} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    case NOTIFICATION_TYPES.LOADING:
      return (
        <svg style={iconStyle} viewBox="0 0 20 20" fill="currentColor" className="animate-spin">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2h6v8H7V4z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

// Enhanced Individual Notification Component
const EnhancedNotification = ({ 
  notification, 
  onRemove, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef();
  const progressIntervalRef = useRef();

  const { id, type, title, message, duration = 5000, persistent, action, avatar } = notification;

  useEffect(() => {
    // Entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    if (!persistent && duration > 0) {
      // Start progress countdown
      const progressStep = 100 / (duration / 50);
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressIntervalRef.current);
            return 0;
          }
          return prev - progressStep;
        });
      }, 50);

      // Auto-remove timer
      timeoutRef.current = setTimeout(() => {
        handleRemove();
      }, duration);
    }

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [duration, persistent]);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(id), 300); // Match exit animation duration
  }, [id, onRemove]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(progressIntervalRef.current);
  };

  const handleMouseLeave = () => {
    if (!persistent && duration > 0) {
      const remainingTime = (progress / 100) * duration;
      timeoutRef.current = setTimeout(handleRemove, remainingTime);
    }
  };

  const getTypeStyles = () => {
    const baseStyles = {
      background: 'white',
      border: '1px solid',
      color: 'var(--neutral-800)'
    };

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          ...baseStyles,
          borderColor: 'var(--green-200)',
          background: 'linear-gradient(135deg, var(--green-50) 0%, white 100%)',
          '--icon-color': 'var(--green-500)',
          '--progress-color': 'var(--green-400)'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          ...baseStyles,
          borderColor: 'var(--red-200)',
          background: 'linear-gradient(135deg, var(--red-50) 0%, white 100%)',
          '--icon-color': 'var(--red-500)',
          '--progress-color': 'var(--red-400)'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          ...baseStyles,
          borderColor: 'var(--yellow-200)',
          background: 'linear-gradient(135deg, var(--yellow-50) 0%, white 100%)',
          '--icon-color': 'var(--yellow-500)',
          '--progress-color': 'var(--yellow-400)'
        };
      case NOTIFICATION_TYPES.INFO:
        return {
          ...baseStyles,
          borderColor: 'var(--blue-200)',
          background: 'linear-gradient(135deg, var(--blue-50) 0%, white 100%)',
          '--icon-color': 'var(--blue-500)',
          '--progress-color': 'var(--blue-400)'
        };
      case NOTIFICATION_TYPES.LOADING:
        return {
          ...baseStyles,
          borderColor: 'var(--primary-200)',
          background: 'linear-gradient(135deg, var(--primary-50) 0%, white 100%)',
          '--icon-color': 'var(--primary-500)',
          '--progress-color': 'var(--primary-400)'
        };
      default:
        return baseStyles;
    }
  };

  const getAnimationClass = () => {
    if (isExiting) return 'notification-exit';
    if (isVisible) return 'notification-enter';
    return 'notification-hidden';
  };

  const getPositionClass = () => {
    return `notification-${position}`;
  };

  return (
    <div
      className={`enhanced-notification ${getAnimationClass()} ${getPositionClass()}`}
      style={{
        ...getTypeStyles(),
        position: 'relative',
        minWidth: '320px',
        maxWidth: '480px',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Progress bar */}
      {!persistent && duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: `${progress}%`,
            background: 'var(--progress-color)',
            transition: 'width 50ms linear',
            borderRadius: '0 0 var(--radius-xl) var(--radius-xl)'
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        {/* Avatar or Icon */}
        <div style={{ color: 'var(--icon-color)', flexShrink: 0 }}>
          {avatar ? (
            <img 
              src={avatar} 
              alt="" 
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%' 
              }} 
            />
          ) : (
            <NotificationIcon type={type} size={24} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h4 style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--neutral-900)',
              marginBottom: message ? 'var(--space-1)' : 0
            }}>
              {title}
            </h4>
          )}
          {message && (
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--neutral-700)',
              lineHeight: 1.4
            }}>
              {message}
            </p>
          )}
          
          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-3)',
                background: 'var(--icon-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleRemove}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--neutral-400)',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition-normal)',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--neutral-600)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--neutral-400)'}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Enhanced Notification Container
const NotificationContainer = ({ notifications, position = 'top-right', onRemove }) => {
  const getContainerStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      pointerEvents: 'none'
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0, flexDirection: 'column-reverse' };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0, flexDirection: 'column-reverse' };
      case 'top-center':
        return { ...baseStyles, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'column-reverse' };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  return (
    <div style={getContainerStyles()}>
      {notifications.map(notification => (
        <div key={notification.id} style={{ pointerEvents: 'auto' }}>
          <EnhancedNotification
            notification={notification}
            onRemove={onRemove}
            position={position}
          />
        </div>
      ))}
    </div>
  );
};

// Enhanced Notification Provider with Advanced Features
export const EnhancedNotificationProvider = ({ 
  children, 
  position = 'top-right',
  maxNotifications = 5,
  globalDuration = 5000 
}) => {
  const [notifications, setNotifications] = useState([]);
  const notificationId = useRef(0);

  const addNotification = useCallback((notification) => {
    const id = ++notificationId.current;
    const newNotification = {
      id,
      duration: globalDuration,
      ...notification,
      timestamp: Date.now()
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the latest maxNotifications
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [globalDuration, maxNotifications]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      title: options.title || 'Success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      title: options.title || 'Error',
      duration: options.duration || 7000, // Errors stay longer
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      title: options.title || 'Warning',
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      title: options.title || 'Info',
      ...options
    });
  }, [addNotification]);

  const showLoading = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.LOADING,
      message,
      title: options.title || 'Loading',
      persistent: true, // Loading notifications persist until manually removed
      ...options
    });
  }, [addNotification]);

  // Promise-based notification for async operations
  const notifyPromise = useCallback(async (promise, messages = {}) => {
    const loadingId = showLoading(
      messages.loading || 'Processing...',
      { title: messages.loadingTitle || 'Please wait' }
    );

    try {
      const result = await promise;
      removeNotification(loadingId);
      showSuccess(
        messages.success || 'Operation completed successfully',
        { title: messages.successTitle || 'Success' }
      );
      return result;
    } catch (error) {
      removeNotification(loadingId);
      showError(
        messages.error || error.message || 'An error occurred',
        { title: messages.errorTitle || 'Error' }
      );
      throw error;
    }
  }, [showLoading, removeNotification, showSuccess, showError]);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    updateNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    notifyPromise
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer
        notifications={notifications}
        position={position}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Context
const NotificationContext = React.createContext();

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within an EnhancedNotificationProvider');
  }
  return context;
};

// Export types for convenience
export { NOTIFICATION_TYPES };

// CSS that should be added to a stylesheet
export const NotificationStyles = `
.enhanced-notification {
  will-change: transform, opacity;
}

.notification-hidden {
  opacity: 0;
  transform: translateX(100%);
}

.notification-enter {
  animation: notification-slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.notification-exit {
  animation: notification-slide-out 0.3s ease-in forwards;
}

.notification-top-right .notification-hidden {
  transform: translateX(100%);
}

.notification-top-left .notification-hidden,
.notification-bottom-left .notification-hidden {
  transform: translateX(-100%);
}

.notification-top-center .notification-hidden,
.notification-bottom-center .notification-hidden {
  transform: translateY(-100%);
}

@keyframes notification-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes notification-slide-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Color variables for notifications */
:root {
  --green-50: #f0fdf4;
  --green-200: #bbf7d0;
  --green-400: #4ade80;
  --green-500: #22c55e;
  
  --red-50: #fef2f2;
  --red-200: #fecaca;
  --red-400: #f87171;
  --red-500: #ef4444;
  
  --yellow-50: #fffbeb;
  --yellow-200: #fef3c7;
  --yellow-400: #fbbf24;
  --yellow-500: #f59e0b;
  
  --blue-50: #eff6ff;
  --blue-200: #dbeafe;
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
}

.dark {
  --green-50: #022c22;
  --green-200: #065f46;
  
  --red-50: #2d1b1b;
  --red-200: #7f1d1d;
  
  --yellow-50: #2d2b1b;
  --yellow-200: #92400e;
  
  --blue-50: #1e2e4f;
  --blue-200: #1e3a8a;
}
`;
