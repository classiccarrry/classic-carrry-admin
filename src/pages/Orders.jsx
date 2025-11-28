import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await orderAPI.getAll(params);
      const ordersData = response.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      showNotification('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer.email.toLowerCase().includes(query) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

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
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage customer orders</p>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <i className="fas fa-search"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, customer name, or email..."
            className="w-full px-4 py-3 pl-12 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#D2C1B6] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-gray-400 text-sm mt-2">
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-lg font-medium transition capitalize ${
              filter === status
                ? 'bg-[#D2C1B6] text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status === 'all' ? 'All Orders' : status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-4xl text-gray-600 mb-4"></i>
            <p className="text-gray-400">
              {searchQuery ? 'No orders match your search' : 'No orders found'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[#D2C1B6] hover:text-white transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Order #</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Customer</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Items</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Total</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Date</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-700 hover:bg-gray-700/30 transition">
                    <td className="py-4 px-6 text-white font-mono text-sm">{order.orderNumber}</td>
                    <td className="py-4 px-6 text-gray-300">
                      {order.customer.firstName} {order.customer.lastName}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">{order.customer.email}</td>
                    <td className="py-4 px-6 text-gray-300">{order.items.length}</td>
                    <td className="py-4 px-6 text-[#D2C1B6] font-semibold">
                      Rs {order.pricing.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-600/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-600/20 text-yellow-400' :
                        order.status === 'cancelled' ? 'bg-red-600/20 text-red-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end">
                        <Link
                          to={`/orders/${order.orderNumber}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                        >
                          <i className="fas fa-eye"></i>
                          <span>View</span>
                        </Link>
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

export default Orders;
