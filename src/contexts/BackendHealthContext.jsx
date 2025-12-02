import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const BackendHealthContext = createContext();

export const useBackendHealth = () => {
  const context = useContext(BackendHealthContext);
  if (!context) {
    throw new Error('useBackendHealth must be used within BackendHealthProvider');
  }
  return context;
};

export const BackendHealthProvider = ({ children }) => {
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackendHealth = async (isInitialCheck = false) => {
    try {
      // Only show loading screen on initial check
      if (isInitialCheck) {
        setIsChecking(true);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(API_URL.replace('/api', ''), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsBackendHealthy(true);
        setLastChecked(new Date());
        return true;
      } else {
        setIsBackendHealthy(false);
        return false;
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsBackendHealthy(false);
      return false;
    } finally {
      if (isInitialCheck) {
        setIsChecking(false);
      }
    }
  };

  useEffect(() => {
    // Initial health check with loading screen
    checkBackendHealth(true);

    // Periodic health check every 30 seconds (without loading screen)
    const interval = setInterval(() => {
      if (isBackendHealthy) {
        checkBackendHealth(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isBackendHealthy]);

  const value = {
    isBackendHealthy,
    isChecking,
    lastChecked,
    checkBackendHealth,
  };

  return (
    <BackendHealthContext.Provider value={value}>
      {children}
    </BackendHealthContext.Provider>
  );
};

export default BackendHealthContext;
