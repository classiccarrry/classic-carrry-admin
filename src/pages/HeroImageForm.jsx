import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { heroImageAPI } from '../services/heroImageAPI';
import { useNotification } from '../contexts/NotificationContext';

import API_URL from '../config/api';

const HeroImageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    image: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    if (id) {
      fetchHeroImage();
    }
  }, [id]);

  const fetchHeroImage = async () => {
    try {
      const response = await heroImageAPI.getById(id);
      const data = response.data;
      setFormData({
        image: data.image,
        order: data.order,
        isActive: data.isActive
      });
      setImagePreview(data.image);
    } catch (error) {
      showNotification('Failed to fetch hero image', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showNotification('Image size must be less than 10MB', 'error');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/upload/hero`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      const imageUrl = data.data.url;
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setImagePreview(imageUrl);
      showNotification('Image uploaded successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to upload image', 'error');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      showNotification('Please upload an image', 'error');
      return;
    }

    try {
      setLoading(true);

      if (id) {
        await heroImageAPI.update(id, formData);
        showNotification('Hero image updated successfully', 'success');
      } else {
        await heroImageAPI.create(formData);
        showNotification('Hero image created successfully', 'success');
      }

      navigate('/hero-images');
    } catch (error) {
      showNotification(error.message || 'Failed to save hero image', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          {id ? 'Edit Hero Image' : 'Add Hero Image'}
        </h1>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hero Image *
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#D2C1B6] file:text-gray-900
                  hover:file:bg-[#e2c9b8]
                  file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order *
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#D2C1B6]"
              required
              min="0"
            />
            <p className="text-gray-400 text-sm mt-1">Lower numbers appear first</p>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-[#D2C1B6] bg-gray-700 border-gray-600 rounded focus:ring-[#D2C1B6]"
              />
              <span className="text-gray-300">Active</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-[#e2c9b8] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : id ? 'Update Hero Image' : 'Create Hero Image'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hero-images')}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroImageForm;
