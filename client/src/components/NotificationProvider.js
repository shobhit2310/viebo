import React, { createContext, useContext, useState, useCallback } from 'react';
import { Heart, MessageCircle, Bell, X, Check, Info, AlertTriangle } from 'lucide-react';

// Notification Context
const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification types and their icons/colors
const notificationConfig = {
  match: {
    icon: Heart,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.3)'
  },
  message: {
    icon: MessageCircle,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  success: {
    icon: Check,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  default: {
    icon: Bell,
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.3)'
  }
};

// Toast Component
const Toast = ({ notification, onDismiss }) => {
  const config = notificationConfig[notification.type] || notificationConfig.default;
  const Icon = config.icon;

  return (
    <div 
      className={`toast-notification ${notification.exiting ? 'exiting' : ''}`}
      style={{
        '--toast-color': config.color,
        '--toast-bg': config.bgColor,
        '--toast-border': config.borderColor
      }}
      onClick={notification.onClick}
    >
      <div className="toast-icon">
        <Icon size={20} fill={notification.type === 'match' ? config.color : 'none'} />
      </div>
      
      <div className="toast-content">
        {notification.title && (
          <div className="toast-title">{notification.title}</div>
        )}
        <div className="toast-message">{notification.message}</div>
      </div>

      <button 
        className="toast-close" 
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
      >
        <X size={16} />
      </button>

      <div className="toast-progress" style={{ animationDuration: `${notification.duration}ms` }} />

      <style jsx>{`
        .toast-notification {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--toast-bg);
          border: 1px solid var(--toast-border);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          cursor: ${notification.onClick ? 'pointer' : 'default'};
          position: relative;
          overflow: hidden;
          animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform: translateX(100%);
        }

        .toast-notification.exiting {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .toast-notification:hover {
          border-color: var(--toast-color);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .toast-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--toast-bg);
          border: 2px solid var(--toast-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--toast-color);
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-weight: 600;
          font-size: 14px;
          color: #f8fafc;
          margin-bottom: 2px;
        }

        .toast-message {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .toast-close {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: rgba(100, 116, 139, 0.2);
          color: #f8fafc;
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--toast-color), transparent);
          animation: progress linear forwards;
          width: 100%;
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @media (max-width: 480px) {
          .toast-notification {
            padding: 12px;
            border-radius: 12px;
          }

          .toast-icon {
            width: 32px;
            height: 32px;
          }

          .toast-title {
            font-size: 13px;
          }

          .toast-message {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(({
    type = 'default',
    title,
    message,
    duration = 5000,
    onClick
  }) => {
    const id = Date.now() + Math.random();
    
    setNotifications(prev => [...prev, {
      id,
      type,
      title,
      message,
      duration,
      onClick,
      exiting: false
    }]);

    // Request browser notification permission (for future use)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    // Mark as exiting for animation
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, exiting: true } : n)
    );
    
    // Remove after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, exiting: true })));
    setTimeout(() => {
      setNotifications([]);
    }, 300);
  }, []);

  // Convenience methods
  const notifyMatch = useCallback((name, onClick) => {
    return addNotification({
      type: 'match',
      title: "It's a Match! 💕",
      message: `You and ${name} both liked each other!`,
      duration: 8000,
      onClick
    });
  }, [addNotification]);

  const notifyMessage = useCallback((senderName, preview, onClick) => {
    return addNotification({
      type: 'message',
      title: `New message from ${senderName}`,
      message: preview,
      duration: 5000,
      onClick
    });
  }, [addNotification]);

  const notifySuccess = useCallback((message) => {
    return addNotification({
      type: 'success',
      message,
      duration: 3000
    });
  }, [addNotification]);

  const notifyInfo = useCallback((message) => {
    return addNotification({
      type: 'info',
      message,
      duration: 4000
    });
  }, [addNotification]);

  const notifyWarning = useCallback((message) => {
    return addNotification({
      type: 'warning',
      message,
      duration: 5000
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      addNotification,
      dismissNotification,
      clearAll,
      notifyMatch,
      notifyMessage,
      notifySuccess,
      notifyInfo,
      notifyWarning
    }}>
      {children}
      
      {/* Notification Container */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <Toast 
            key={notification.id} 
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>

      <style jsx global>{`
        .notification-container {
          position: fixed;
          top: 80px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 380px;
          width: calc(100% - 40px);
          pointer-events: none;
        }

        .notification-container > * {
          pointer-events: auto;
        }

        @media (max-width: 480px) {
          .notification-container {
            top: auto;
            bottom: 20px;
            right: 10px;
            left: 10px;
            max-width: none;
            width: auto;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
