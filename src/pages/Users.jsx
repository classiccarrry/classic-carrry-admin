import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, orderAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const fetchUserOrders = async (userEmail) => {
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getAll();
      // Filter orders for this specific user by email
      const orders = response.data?.filter(order => 
        order.customer?.email?.toLowerCase() === userEmail?.toLowerCase()
      ) || [];
      setUserOrders(orders);
    } catch (error) {
      showNotification('Failed to fetch user orders', 'error');
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    await fetchUserOrders(user.email);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.delete(id);
      showNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      showNotification('Failed to delete user', 'error');
    }
  };

  const calculateUserStats = (userId) => {
    const orders = userOrders.filter(order => 
      order.user === userId || order.user?._id === userId
    );
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    return { totalOrders, totalSpent, completedOrders };
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
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">Manage registered users</p>
        </div>
        <div className="text-gray-400">
          <span className="text-2xl font-bold text-white">{filteredUsers.length}</span> users
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <i className="fas fa-search"></i>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 rounded-lg bg-gray-700 text-gray-100 border-2 border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Email</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Phone</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 md:px-6 text-gray-400 font-semibold">Joined</th>
                  <th className="text-right py-4 px-4 md:px-6 text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D2C1B6] rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-gray-900"></i>
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{user.email}</td>
                    <td className="py-4 px-6 text-gray-300">{user.phone || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-600/20 text-purple-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition text-sm"
                            title="Delete User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div 
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#D2C1B6] rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-900 text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Phone</p>
                <p className="text-white font-semibold">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Role</p>
                <p className="text-white font-semibold capitalize">{selectedUser.role}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Member Since</p>
                <p className="text-white font-semibold">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Order Statistics */}
            {!loadingOrders && userOrders.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm mb-1">Total Orders</p>
                  <p className="text-white text-2xl font-bold">{userOrders.length}</p>
                </div>
                <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm mb-1">Completed Orders</p>
                  <p className="text-white text-2xl font-bold">
                    {userOrders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <div className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4">
                  <p className="text-purple-400 text-sm mb-1">Total Spent</p>
                  <p className="text-white text-2xl font-bold">
                    Rs {userOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Order History */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Order History</h3>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-700 rounded-lg">
                  <i className="fas fa-shopping-bag text-4xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <Link 
                      key={order._id} 
                      to={`/orders/${order.orderNumber}`}
                      className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">Order #{order.orderNumber || order._id.slice(-6)}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#D2C1B6] font-bold">Rs {order.pricing?.total?.toLocaleString()}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                            order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                            order.status === 'processing' ? 'bg-blue-600/20 text-blue-400' :
                            order.status === 'shipped' ? 'bg-purple-600/20 text-purple-400' :
                            order.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                            'bg-yellow-600/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-gray-400 text-sm">
                          <p>{order.items?.length || 0} item(s)</p>
                          {order.customer && (
                            <p className="mt-1">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {order.customer.city}, {order.customer.province}
                            </p>
                          )}
                        </div>
                        <div className="text-blue-400 text-sm flex items-center gap-1">
                          <span>View Details</span>
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
