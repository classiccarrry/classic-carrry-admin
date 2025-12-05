import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

import API_URL from '../config/api';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      showNotification('Failed to fetch coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCoupon 
        ? `${API_URL}/coupons/${editingCoupon._id}`
        : `${API_URL}/coupons`;
      
      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully`, 'success');
        setShowModal(false);
        resetForm();
        fetchCoupons();
      } else {
        // Show the error message from backend
        showNotification(data.message || 'Failed to save coupon', 'error');
      }
    } catch (error) {
      showNotification('Failed to save coupon', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Coupon deleted', 'success');
      fetchCoupons();
    } catch (error) {
      showNotification('Failed to delete coupon', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/coupons/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Status updated', 'success');
      fetchCoupons();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
      isActive: true
    });
    setEditingCoupon(null);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Discount Coupons</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
        >
          <i className="fas fa-plus mr-2"></i>Create Coupon
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Code</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Discount</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Min Purchase</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Usage</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Expiry</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Status</th>
              <th className="text-left py-4 px-6 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-700 transition">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-[#D2C1B6]">{coupon.code}</span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}%` 
                    : `Rs ${coupon.discountValue}`}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  Rs {coupon.minPurchase || 0}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(coupon._id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      coupon.isActive 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-400 hover:text-red-300 transition"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Coupon Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Value</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="Enter value"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Min Purchase (Optional)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="0 = No minimum"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                    placeholder="0 = Unlimited"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                  placeholder="No expiry"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D2C1B6] text-gray-900 py-2 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
