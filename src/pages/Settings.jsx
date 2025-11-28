import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

import API_URL from '../config/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    tiktok: '',
    instagram: ''
  });

  // FAQ State
  const [faqs, setFaqs] = useState([]);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general' });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    siteName: 'Classic Carrry',
    brandEmoji: '🛍️',
    tagline: 'Premium Lifestyle Products',
    showNewsletter: true,
    showSocialMedia: true
  });

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    currency: 'PKR',
    currencySymbol: 'Rs',
    shippingFee: 200,
    freeShippingThreshold: 5000,
    taxRate: 0,
    orderPrefix: 'CC',
    enableCOD: true,
    enableOnlinePayment: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [contactRes, faqRes, appearanceRes, generalRes] = await Promise.all([
        fetch(`${API_URL}/settings/contact`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/settings/faqs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/settings/appearance`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/settings/general`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (contactRes.ok) {
        const data = await contactRes.json();
        setContactInfo(data.data || contactInfo);
      }
      if (faqRes.ok) {
        const data = await faqRes.json();
        setFaqs(data.data || []);
      }
      if (appearanceRes.ok) {
        const data = await appearanceRes.json();
        if (data.data) setAppearanceSettings(data.data);
      }
      if (generalRes.ok) {
        const data = await generalRes.json();
        if (data.data) setGeneralSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Contact Info Handlers
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/settings/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contactInfo)
      });

      if (response.ok) {
        showNotification('Contact info updated successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to update contact info', 'error');
    } finally {
      setLoading(false);
    }
  };

  // FAQ Handlers
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingFaq 
        ? `${API_URL}/settings/faqs/${editingFaq._id}`
        : `${API_URL}/settings/faqs`;
      
      const response = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(faqForm)
      });

      if (response.ok) {
        showNotification(`FAQ ${editingFaq ? 'updated' : 'created'} successfully`, 'success');
        setShowFaqModal(false);
        setFaqForm({ question: '', answer: '', category: 'general' });
        setEditingFaq(null);
        fetchSettings();
      }
    } catch (error) {
      showNotification('Failed to save FAQ', 'error');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/settings/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('FAQ deleted', 'success');
      fetchSettings();
    } catch (error) {
      showNotification('Failed to delete FAQ', 'error');
    }
  };

  // Appearance Settings Handlers
  const handleAppearanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/settings/appearance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(appearanceSettings)
      });

      if (response.ok) {
        showNotification('Appearance settings updated successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to update appearance settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // General Settings Handlers
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/settings/general`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(generalSettings)
      });

      if (response.ok) {
        showNotification('General settings updated successfully', 'success');
      }
    } catch (error) {
      showNotification('Failed to update general settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'contact', label: 'Contact Info', icon: 'fa-address-book' },
    { id: 'faq', label: 'FAQs', icon: 'fa-question-circle' },
    { id: 'appearance', label: 'Appearance', icon: 'fa-palette' },
    { id: 'general', label: 'General', icon: 'fa-cog' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage site settings, contact info, FAQs, appearance, and general settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-[#D2C1B6] border-b-2 border-[#D2C1B6]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Info Tab */}
      {activeTab === 'contact' && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-envelope mr-2"></i>Email
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="contact@classiccarrry.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-phone mr-2"></i>Phone
                </label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="+92 316 092 8206"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fab fa-whatsapp mr-2"></i>WhatsApp
                </label>
                <input
                  type="text"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="+92 316 092 8206"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-map-marker-alt mr-2"></i>Address
                </label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="Pakistan"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">
                    <i className="fab fa-tiktok mr-2"></i>TikTok
                  </label>
                  <input
                    type="url"
                    value={contactInfo.tiktok}
                    onChange={(e) => setContactInfo({...contactInfo, tiktok: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    <i className="fab fa-instagram mr-2"></i>Instagram
                  </label>
                  <input
                    type="url"
                    value={contactInfo.instagram}
                    onChange={(e) => setContactInfo({...contactInfo, instagram: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#D2C1B6] text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Contact Info'}
            </button>
          </form>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <button
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ question: '', answer: '', category: 'general' });
                setShowFaqModal(true);
              }}
              className="bg-[#D2C1B6] text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
            >
              <i className="fas fa-plus mr-2"></i>Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingFaq(faq);
                        setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category });
                        setShowFaqModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq._id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <i className="fas fa-question-circle text-6xl mb-4"></i>
                <p>No FAQs yet. Add your first FAQ!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
          <form onSubmit={handleAppearanceSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-store mr-2"></i>Site Name
                </label>
                <input
                  type="text"
                  value={appearanceSettings.siteName}
                  onChange={(e) => setAppearanceSettings({...appearanceSettings, siteName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-smile mr-2"></i>Brand Emoji
                </label>
                <input
                  type="text"
                  value={appearanceSettings.brandEmoji}
                  onChange={(e) => setAppearanceSettings({...appearanceSettings, brandEmoji: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="🛍️"
                  maxLength="2"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-tag mr-2"></i>Tagline
                </label>
                <input
                  type="text"
                  value={appearanceSettings.tagline}
                  onChange={(e) => setAppearanceSettings({...appearanceSettings, tagline: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearanceSettings.showNewsletter}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, showNewsletter: e.target.checked})}
                    className="w-5 h-5 text-[#D2C1B6] rounded focus:ring-[#D2C1B6]"
                  />
                  <span className="text-gray-300">Show Newsletter Signup</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearanceSettings.showSocialMedia}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, showSocialMedia: e.target.checked})}
                    className="w-5 h-5 text-[#D2C1B6] rounded focus:ring-[#D2C1B6]"
                  />
                  <span className="text-gray-300">Show Social Media Links</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#D2C1B6] text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Appearance Settings'}
            </button>
          </form>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
          <form onSubmit={handleGeneralSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-money-bill mr-2"></i>Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                >
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-dollar-sign mr-2"></i>Currency Symbol
                </label>
                <input
                  type="text"
                  value={generalSettings.currencySymbol}
                  onChange={(e) => setGeneralSettings({...generalSettings, currencySymbol: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-truck mr-2"></i>Shipping Fee (Rs)
                </label>
                <input
                  type="number"
                  value={generalSettings.shippingFee}
                  onChange={(e) => setGeneralSettings({...generalSettings, shippingFee: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-gift mr-2"></i>Free Shipping Threshold (Rs)
                </label>
                <input
                  type="number"
                  value={generalSettings.freeShippingThreshold}
                  onChange={(e) => setGeneralSettings({...generalSettings, freeShippingThreshold: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-percentage mr-2"></i>Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={generalSettings.taxRate}
                  onChange={(e) => setGeneralSettings({...generalSettings, taxRate: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">
                  <i className="fas fa-hashtag mr-2"></i>Order Prefix
                </label>
                <input
                  type="text"
                  value={generalSettings.orderPrefix}
                  onChange={(e) => setGeneralSettings({...generalSettings, orderPrefix: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Options</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.enableCOD}
                    onChange={(e) => setGeneralSettings({...generalSettings, enableCOD: e.target.checked})}
                    className="w-5 h-5 text-[#D2C1B6] rounded focus:ring-[#D2C1B6]"
                  />
                  <span className="text-gray-300">Enable Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generalSettings.enableOnlinePayment}
                    onChange={(e) => setGeneralSettings({...generalSettings, enableOnlinePayment: e.target.checked})}
                    className="w-5 h-5 text-[#D2C1B6] rounded focus:ring-[#D2C1B6]"
                  />
                  <span className="text-gray-300">Enable Online Payment</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#D2C1B6] text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-[#e2c9b8] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save General Settings'}
            </button>
          </form>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
            </h2>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="shipping">Shipping</option>
                  <option value="returns">Returns</option>
                  <option value="payment">Payment</option>
                  <option value="products">Products</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Question</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Answer</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg h-32"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#D2C1B6] text-gray-900 py-3 rounded-lg font-medium hover:bg-[#e2c9b8] transition"
                >
                  {editingFaq ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition"
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

export default Settings;
