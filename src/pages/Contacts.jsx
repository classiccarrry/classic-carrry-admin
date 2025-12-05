import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import API_URL from '../config/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = filter === 'all' 
        ? `${API_URL}/contacts`
        : `${API_URL}/contacts?status=${filter}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/contacts/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/contacts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchContacts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/contacts/${selectedContact._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyMessage('');
        setSelectedContact(null);
        fetchContacts();
        fetchStats();
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchContacts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      read: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      replied: 'bg-green-500/20 text-green-400 border border-green-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    };
    return badges[status] || badges.new;
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
        <p className="text-gray-400">Manage customer inquiries and messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-blue-500/30 p-4">
          <div className="text-sm text-blue-400">New</div>
          <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-4">
          <div className="text-sm text-yellow-400">Read</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.read}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-green-500/30 p-4">
          <div className="text-sm text-green-400">Replied</div>
          <div className="text-2xl font-bold text-green-400">{stats.replied}</div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-600 p-4">
          <div className="text-sm text-gray-400">Archived</div>
          <div className="text-2xl font-bold text-gray-300">{stats.archived}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 font-medium capitalize transition ${
                filter === status
                  ? 'bg-gray-700 text-[#D2C1B6] border-b-2 border-[#D2C1B6]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">No contacts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">{contact.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-[#D2C1B6] hover:text-[#C4B5A8] transition"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowReplyModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Reply"
                        >
                          <i className="fas fa-reply"></i>
                        </button>
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 focus:border-[#D2C1B6] focus:outline-none"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete"
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

      {/* Contact Detail Modal */}
      {selectedContact && !showReplyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Contact Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-400">Name</span>
                      <p className="text-white mt-1">{selectedContact.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-400">Email</span>
                      <p className="text-white mt-1">{selectedContact.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-400">Status</span>
                      <p className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedContact.status)}`}>
                          {selectedContact.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-400">Date</span>
                      <p className="text-white mt-1">
                        {new Date(selectedContact.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <span className="text-sm font-semibold text-gray-400">Subject</span>
                  <p className="text-white mt-2 text-lg">{selectedContact.subject}</p>
                </div>

                {/* Message */}
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                  <span className="text-sm font-semibold text-gray-400">Message</span>
                  <p className="text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                {/* Reply Info (if replied) */}
                {selectedContact.replied && selectedContact.replyMessage && (
                  <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-check-circle text-green-400"></i>
                      <span className="text-sm font-semibold text-green-400">Reply Sent</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {new Date(selectedContact.repliedAt).toLocaleString()}
                    </p>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedContact.replyMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="flex-1 bg-[#D2C1B6] text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-[#C4B5A8] transition"
                >
                  <i className="fas fa-reply mr-2"></i>
                  {selectedContact.replied ? 'Reply Again' : 'Send Reply'}
                </button>
                <select
                  value={selectedContact.status}
                  onChange={(e) => {
                    handleStatusChange(selectedContact._id, e.target.value);
                    setSelectedContact({ ...selectedContact, status: e.target.value });
                  }}
                  className="px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-[#D2C1B6] focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => {
                    handleDelete(selectedContact._id);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Reply to {selectedContact.name}</h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                    setSelectedContact(null);
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <span className="font-semibold text-gray-400">From:</span> 
                  <span className="text-white ml-2">{selectedContact.email}</span>
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-400">Subject:</span> 
                  <span className="text-white ml-2">{selectedContact.subject}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-400">Message:</span>
                  <p className="mt-2 text-gray-300 leading-relaxed">{selectedContact.message}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-[#D2C1B6] focus:outline-none"
                  placeholder="Type your reply here..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim()}
                  className="flex-1 bg-[#D2C1B6] text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-[#C4B5A8] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                    setSelectedContact(null);
                  }}
                  className="px-6 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
