import { useState, useEffect } from 'react';
import '../css/Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 等待动画结束
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <span className="notification-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'ℹ'}
        {type === 'warning' && '⚠'}
      </span>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}>
        ×
      </button>
    </div>
  );
};

export const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          message={notif.message}
          type={notif.type}
          duration={notif.duration}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
};

export default Notification;
