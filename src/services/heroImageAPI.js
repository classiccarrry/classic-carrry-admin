import { API_URL } from '../config/api.js';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const fullUrl = `${API_URL}${endpoint}`;
  console.log('API Request:', fullUrl); // Debug log
  
  const response = await fetch(fullUrl, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const heroImageAPI = {
  getAll: async () => {
    return apiCall('/hero-images/admin');
  },
  
  getById: async (id) => {
    return apiCall(`/hero-images/${id}`);
  },
  
  create: async (heroImageData) => {
    return apiCall('/hero-images', {
      method: 'POST',
      body: JSON.stringify(heroImageData),
    });
  },
  
  update: async (id, heroImageData) => {
    return apiCall(`/hero-images/${id}`, {
      method: 'PUT',
      body: JSON.stringify(heroImageData),
    });
  },
  
  delete: async (id) => {
    return apiCall(`/hero-images/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleStatus: async (id) => {
    return apiCall(`/hero-images/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },
};

export default heroImageAPI;
