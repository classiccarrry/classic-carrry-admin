import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { categoryAPI } from '../services/categoryAPI';
import { useNotification } from '../contexts/NotificationContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ showAll: 'true' });
      setCategories(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const params = { showAll: 'true' };
      if (filter !== 'all') {
        params.category = filter;
      }
      const response = await productAPI.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await productAPI.update(product.id, {
        ...product,
        isActive: !product.isActive
      });
      showNotification(
        `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
      fetchProducts();
    } catch (error) {
      showNotification('Failed to update product status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      showNotification('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      showNotification('Failed to delete product', 'error');
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
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog</p>
        </div>
        <Link
          to="/products/new"
          className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-[#D2C1B6] text-gray-900'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setFilter(category._id)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === category._id
                ? 'bg-[#D2C1B6] text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-box-open text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Product</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Category</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Price</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Stock</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Status</th>
                  <th className="text-right py-4 px-4 md:px-6 text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td className="py-4 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{product.name}</p>
                          <p className="text-gray-400 text-sm truncate">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6">
                      <span className="text-gray-300 bg-gray-700 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                        {product.categoryName || product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 md:px-6 text-[#D2C1B6] font-semibold whitespace-nowrap">
                      Rs {product.price.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 md:px-6 text-gray-300">{product.stock}</td>
                    <td className="py-4 px-4 md:px-6">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                          product.isActive
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        }`}
                      >
                        {product.isActive ? '✓ Live' : '✕ Not Live'}
                      </button>
                    </td>
                    <td className="py-4 px-4 md:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                          title="Edit Product"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm"
                          title="Delete Product"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
