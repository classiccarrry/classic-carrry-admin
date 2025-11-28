import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { categoryAPI } from '../services/categoryAPI';
import { useNotification } from '../contexts/NotificationContext';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    stock: '',
    category: '',
    mainImage: '',
    images: [],
    description: '',
    colors: [],
    sizes: [],
    features: '',
    isHot: false,
    isActive: true
  });

  // Predefined options
  const availableColors = [
    'Black', 'White', 'Gray', 'Navy Blue', 'Light Blue', 'Blue',
    'Red', 'Maroon', 'Pink', 'Rose Gold',
    'Brown', 'Tan', 'Beige', 'Cream',
    'Green', 'Olive', 'Army Green',
    'Yellow', 'Orange', 'Purple',
    'Gold', 'Silver', 'Bronze'
  ];
  
  const availableSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'
  ];

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ showAll: 'true' });
      setCategories(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch categories', 'error');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      const product = response.data;
      
      // Handle category - it might be populated as an object or just an ID
      const categoryId = typeof product.category === 'object' 
        ? product.category._id 
        : product.category;
      
      setFormData({
        id: product.id || '',
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: categoryId,
        mainImage: product.mainImage,
        images: product.images || [],
        description: product.description || '',
        colors: product.colors || [],
        sizes: product.sizes || [],
        features: product.features?.join(', ') || '',
        isHot: product.isHot || false,
        isActive: product.isActive !== false
      });
    } catch (error) {
      showNotification('Failed to fetch product', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (name === 'category') {
      console.log('Category changed to:', newValue);
    }
    
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
      }

      setUploadingMainImage(true);

      try {
        // Upload image to server
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const token = localStorage.getItem('adminToken');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/upload/product`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });

        const data = await response.json();

        if (response.ok) {
          // Use the Cloudinary URL directly
          setFormData(prev => ({ ...prev, mainImage: data.data.url }));
          showNotification('Image uploaded successfully', 'success');
        } else {
          showNotification(data.message || 'Failed to upload image', 'error');
        }
      } catch (error) {
        showNotification('Failed to upload image', 'error');
        console.error('Upload error:', error);
      } finally {
        setUploadingMainImage(false);
      }
    }
  };

  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showNotification('Some images are larger than 5MB', 'error');
      return;
    }

    if (files.length === 0) return;

    setUploadingAdditionalImages(true);

    try {
      // Upload images to server
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('images', file);
      });

      const token = localStorage.getItem('adminToken');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/upload/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (response.ok) {
        // Add Cloudinary URLs to images array
        const imageUrls = data.data.images.map(img => img.url);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
        showNotification(`${files.length} image(s) uploaded successfully`, 'success');
      } else {
        showNotification(data.message || 'Failed to upload images', 'error');
      }
    } catch (error) {
      showNotification('Failed to upload images', 'error');
      console.error('Upload error:', error);
    } finally {
      setUploadingAdditionalImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        id: formData.id,
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        mainImage: formData.mainImage,
        images: formData.images,
        description: formData.description,
        colors: formData.colors,
        sizes: formData.sizes,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        isHot: formData.isHot,
        isActive: formData.isActive
      };

      console.log('Submitting product with category:', productData.category);

      if (id) {
        await productAPI.update(id, productData);
        showNotification('Product updated successfully', 'success');
      } else {
        await productAPI.create(productData);
        showNotification('Product created successfully', 'success');
      }
      navigate('/products');
    } catch (error) {
      showNotification(error.message || 'Failed to save product', 'error');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="text-gray-400 hover:text-white transition"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-400">
            {id ? 'Update product information' : 'Create a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Product ID and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Product ID *
              </label>
              <input
                type="text"
                name="id"
                required
                disabled={!!id}
                value={formData.id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., cap-summer-001"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for the product</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
                placeholder="e.g., Classic Baseball Cap"
              />
            </div>
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-yellow-500 mt-1">
                  No categories available. Please create a category first.
                </p>
              )}
              {formData.category && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {categories.find(c => c._id === formData.category)?.name || formData.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Price (Rs) *
              </label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
                placeholder="2999"
                min="0"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Quantity (Stock) *
            </label>
            <input
              type="number"
              name="stock"
              required
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition"
              placeholder="100"
              min="0"
            />
          </div>

          {/* Colors and Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Available Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        colors: prev.colors.includes(color)
                          ? prev.colors.filter(c => c !== color)
                          : [...prev.colors, color]
                      }));
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      formData.colors.includes(color)
                        ? 'bg-[#D2C1B6] text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {color}
                    {formData.colors.includes(color) && (
                      <i className="fas fa-check ml-2"></i>
                    )}
                  </button>
                ))}
              </div>
              {formData.colors.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {formData.colors.join(', ')}
                </p>
              )}
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        sizes: prev.sizes.includes(size)
                          ? prev.sizes.filter(s => s !== size)
                          : [...prev.sizes, size]
                      }));
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      formData.sizes.includes(size)
                        ? 'bg-[#D2C1B6] text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {size}
                    {formData.sizes.includes(size) && (
                      <i className="fas fa-check ml-2"></i>
                    )}
                  </button>
                ))}
              </div>
              {formData.sizes.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {formData.sizes.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition resize-none"
              placeholder="Detailed product description..."
            />
          </div>

          {/* Features/Specifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Features / Specifications (comma-separated)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition resize-none"
              placeholder="Premium Quality, Durable Material, Water Resistant"
            />
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Main Product Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageChange}
              disabled={uploadingMainImage}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#D2C1B6] file:text-gray-900 file:font-semibold hover:file:bg-[#e2c9b8] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadingMainImage && (
              <div className="mt-4 flex items-center gap-2 text-[#D2C1B6]">
                <i className="fas fa-spinner fa-spin"></i>
                <span className="text-sm">Uploading image...</span>
              </div>
            )}
            {formData.mainImage && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <img 
                  src={formData.mainImage} 
                  alt="Main product" 
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Additional Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              disabled={uploadingAdditionalImages}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#D2C1B6] file:text-gray-900 file:font-semibold hover:file:bg-[#e2c9b8] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadingAdditionalImages && (
              <div className="mt-4 flex items-center gap-2 text-[#D2C1B6]">
                <i className="fas fa-spinner fa-spin"></i>
<span className="text-sm">Uploading images...</span>
              </div>
            )}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Additional Images ({formData.images.length}):</p>
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
              <input
                type="checkbox"
                id="isHot"
                name="isHot"
                checked={formData.isHot}
                onChange={handleChange}
                className="w-6 h-6 rounded border-gray-600 text-[#D2C1B6] focus:ring-[#D2C1B6] cursor-pointer"
              />
              <label htmlFor="isHot" className="cursor-pointer flex-1">
                <span className="text-gray-100 font-semibold block">Hot Selling Product</span>
                <span className="text-gray-400 text-sm">Mark this product as a hot seller</span>
              </label>
            </div>

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
                <span className="text-gray-100 font-semibold block">Product is Live</span>
                <span className="text-gray-400 text-sm">Make this product visible to customers</span>
              </label>
            </div>
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
                <span>{id ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="bg-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
