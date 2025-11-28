import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
              <span className="text-white font-medium">{notification.message}</span>
            </div>
            <button onClick={hideNotification} className="text-white hover:text-gray-200 ml-4">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
