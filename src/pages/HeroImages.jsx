import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { heroImageAPI } from '../services/heroImageAPI';
import { useNotification } from '../contexts/NotificationContext';

const HeroImages = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const response = await heroImageAPI.getAll();
      setHeroImages(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch hero images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await heroImageAPI.toggleStatus(id);
      showNotification('Status updated successfully', 'success');
      fetchHeroImages();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      await heroImageAPI.delete(id);
      showNotification('Hero image deleted successfully', 'success');
      fetchHeroImages();
    } catch (error) {
      showNotification('Failed to delete hero image', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Hero Images</h1>
        <Link
          to="/hero-images/new"
          className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Hero Image
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {heroImages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No hero images found. Add your first hero image!
                  </td>
                </tr>
              ) : (
                heroImages.map((image) => (
                  <tr key={image._id} className="hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <img
                        src={image.image}
                        alt="Hero"
                        className="w-32 h-20 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{image.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(image._id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          image.isActive
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {image.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/hero-images/edit/${image._id}`}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(image._id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HeroImages;
