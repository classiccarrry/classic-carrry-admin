import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../services/categoryAPI';
import { useNotification } from '../contexts/NotificationContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ showAll: 'true' });
      setCategories(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      await categoryAPI.update(category._id, {
        ...category,
        isActive: !category.isActive
      });
      showNotification(
        `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
      fetchCategories();
    } catch (error) {
      showNotification('Failed to update category status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await categoryAPI.delete(id);
      showNotification('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      showNotification(error.message || 'Failed to delete category', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage product categories</p>
        </div>
        <Link
          to="/categories/new"
          className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          <span>Add Category</span>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-[#D2C1B6] transition-all duration-300"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleStatus(category);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    category.isActive
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {category.isActive ? '✓ Live' : '✕ Not Live'}
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-700 px-2 py-1 rounded">
                      Order: {category.displayOrder}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                <Link
                  to={`/categories/edit/${category._id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-center text-sm font-medium"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(category._id, category.name)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <i className="fas fa-folder-open text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 mb-4">No categories found</p>
          <Link
            to="/categories/new"
            className="inline-block bg-[#D2C1B6] text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
          >
            Create First Category
          </Link>
        </div>
      )}
    </div>
  );
};

export default Categories;
