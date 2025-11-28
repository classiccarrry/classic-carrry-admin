import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../config/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    appearance: {
      siteName: 'Classic Carrry',
      brandEmoji: '🛍️',
      tagline: 'Premium Lifestyle Products',
      showNewsletter: true,
      showSocialMedia: true
    },
    general: {
      currency: 'PKR',
      currencySymbol: 'Rs',
      shippingFee: 200,
      freeShippingThreshold: 5000,
      taxRate: 0,
      orderPrefix: 'CC',
      enableCOD: true,
      enableOnlinePayment: false
    },
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      tiktok: '',
      instagram: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [appearanceRes, generalRes, contactRes] = await Promise.all([
        fetch(`${API_URL}/settings/appearance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/settings/general`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/settings/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const appearance = appearanceRes.ok ? await appearanceRes.json() : null;
      const general = generalRes.ok ? await generalRes.json() : null;
      const contact = contactRes.ok ? await contactRes.json() : null;

      setSettings({
        appearance: appearance?.data || settings.appearance,
        general: general?.data || settings.general,
        contact: contact?.data || settings.contact
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
