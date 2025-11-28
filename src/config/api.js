// Centralized API configuration for Admin Panel
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_URL}/products/${id}`,
  
  // Categories
  CATEGORIES: `${API_URL}/categories`,
  CATEGORY_BY_ID: (id) => `${API_URL}/categories/${id}`,
  
  // Orders
  ORDERS: `${API_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_URL}/orders/${id}`,
  
  // Users
  USERS: `${API_URL}/users`,
  USER_LOGIN: `${API_URL}/users/login`,
  USER_PROFILE: `${API_URL}/users/profile`,
  USER_BY_ID: (id) => `${API_URL}/users/${id}`,
  USER_RESET_PASSWORD: `${API_URL}/users/reset-password`,
  
  // Coupons
  COUPONS: `${API_URL}/coupons`,
  COUPON_BY_ID: (id) => `${API_URL}/coupons/${id}`,
  
  // Settings
  SETTINGS_GENERAL: `${API_URL}/settings/general`,
  SETTINGS_APPEARANCE: `${API_URL}/settings/appearance`,
  SETTINGS_CONTACT: `${API_URL}/settings/contact`,
  SETTINGS_FAQS: `${API_URL}/settings/faqs`,
  
  // Hero Images
  HERO_IMAGES: `${API_URL}/hero-images`,
  HERO_IMAGE_BY_ID: (id) => `${API_URL}/hero-images/${id}`,
  
  // Contacts
  CONTACTS: `${API_URL}/contacts`,
  CONTACT_BY_ID: (id) => `${API_URL}/contacts/${id}`,
  CONTACT_STATS: `${API_URL}/contacts/stats`,
  CONTACT_REPLY: (id) => `${API_URL}/contacts/${id}/reply`,
  
  // Upload
  UPLOAD: `${API_URL}/upload`,
};

export default API_URL;
