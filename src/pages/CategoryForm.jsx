import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI } from '../services/categoryAPI';
import { useNotification } from '../contexts/NotificationContext';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 1,
    isActive: true
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await categoryAPI.getById(id);
      const category = response.data;
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        displayOrder: category.displayOrder || 1,
        isActive: category.isActive !== false
      });
    } catch (error) {
      showNotification('Failed to fetch category', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
      }

      // Show loading state
      setLoading(true);

      try {
        // Upload image to server
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('adminToken');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/upload/category`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          // Use the Cloudinary URL directly
          setFormData(prev => ({ ...prev, image: data.data.url }));
          showNotification('Image uploaded successfully', 'success');
        } else {
          showNotification(data.message || 'Failed to upload image', 'error');
        }
      } catch (error) {
        showNotification('Failed to upload image', 'error');
        console.error('Upload error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        displayOrder: Number(formData.displayOrder)
      };

      if (id) {
        await categoryAPI.update(id, categoryData);
        showNotification('Category updated successfully', 'success');
      } else {
        await categoryAPI.create(categoryData);
        showNotification('Category created successfully', 'success');
      }
      navigate('/categories');
    } catch (error) {
      showNotification(error.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/categories')}
          className="text-gray-400 hover:text-white transition"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {id ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-gray-400">
            {id ? 'Update category information' : 'Create a new product category'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
              placeholder="e.g., Summer Caps, Leather Wallets"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Category Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#D2C1B6] file:text-gray-900 file:font-semibold hover:file:bg-[#e2c9b8] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {loading && !formData.image && (
              <div className="mt-4 flex items-center gap-2 text-[#D2C1B6]">
                <i className="fas fa-spinner fa-spin"></i>
                <span className="text-sm">Uploading image...</span>
              </div>
            )}
            {formData.image && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <img 
                  src={formData.image} 
                  alt="Category preview" 
                  className="w-48 h-36 object-cover rounded-lg border-2 border-gray-600"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Upload a category image (recommended: 800x600px or 16:9 ratio)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Category Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition resize-none"
              placeholder="Brief description of this category..."
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Display Order *
            </label>
            <input
              type="number"
              name="displayOrder"
              required
              value={formData.displayOrder}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
              placeholder="1"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first (e.g., 1 will show before 2)
            </p>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-6 h-6 rounded border-gray-600 text-[#D2C1B6] focus:ring-[#D2C1B6] cursor-pointer"
            />
            <label htmlFor="isActive" className="cursor-pointer flex-1">
              <span className="text-gray-100 font-semibold block">Category is Live</span>
              <span className="text-gray-400 text-sm">
                Make this category visible to customers on the website
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D2C1B6] text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>{id ? 'Update Category' : 'Create Category'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="bg-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
