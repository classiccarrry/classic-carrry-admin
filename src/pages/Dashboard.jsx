import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, orderAPI, userAPI } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';

const Dashboard = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
        userAPI.getAll()
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const users = usersRes.data || [];

      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

      // Calculate time-based revenue
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.setMonth(now.getMonth() - 1));

      const todayRevenue = orders.filter(o => new Date(o.createdAt) >= todayStart)
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
      const weekRevenue = orders.filter(o => new Date(o.createdAt) >= weekStart)
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
      const monthRevenue = orders.filter(o => new Date(o.createdAt) >= monthStart)
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        pendingOrders,
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue
      });

      // Low stock products (stock < 10)
      const lowStock = products.filter(p => p.stock < 10).slice(0, 5);
      setLowStockProducts(lowStock);

      // Recent orders
      setRecentOrders(orders.slice(0, 5));

      // Recent activity (combine orders and users)
      const activity = [
        ...orders.slice(0, 3).map(o => ({
          type: 'order',
          message: `New order #${o.orderNumber} from ${o.customer.firstName}`,
          time: o.createdAt,
          icon: 'fa-shopping-cart',
          color: 'green'
        })),
        ...users.slice(0, 2).map(u => ({
          type: 'user',
          message: `New user registered: ${u.firstName} ${u.lastName}`,
          time: u.createdAt,
          icon: 'fa-user-plus',
          color: 'blue'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
      setRecentActivity(activity);

      // Sales data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const salesByDay = last7Days.map(date => {
        const dayOrders = orders.filter(o => o.createdAt.startsWith(date));
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayOrders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0),
          orders: dayOrders.length
        };
      });
      setSalesData(salesByDay);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to {settings.appearance.siteName} Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalProducts}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-blue-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-shopping-cart text-green-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalUsers}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-purple-400 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold text-white">{stats.pendingOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-400 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
            <h3 className="text-4xl font-bold text-[#D2C1B6]">Rs {stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-16 h-16 bg-[#D2C1B6]/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-dollar-sign text-[#D2C1B6] text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <Link to="/orders" className="text-[#D2C1B6] hover:text-white transition">
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Order #</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="py-3 px-4 text-white font-mono text-sm">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-300">{order.customer.firstName} {order.customer.lastName}</td>
                    <td className="py-3 px-4 text-[#D2C1B6] font-semibold">Rs {order.pricing.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-600/20 text-green-400' :
                        order.status === 'shipped' ? 'bg-blue-600/20 text-blue-400' :
                        order.status === 'processing' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Sales Overview (Last 7 Days)</h2>
          <div className="space-y-4">
            {salesData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-gray-400 text-sm">{day.date}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">{day.orders} orders</span>
                    <span className="text-[#D2C1B6] font-semibold">Rs {day.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-[#D2C1B6] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((day.revenue / Math.max(...salesData.map(d => d.revenue))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">Today</p>
              <p className="text-white font-bold">Rs {stats.todayRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">This Week</p>
              <p className="text-white font-bold">Rs {stats.weekRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">This Month</p>
              <p className="text-white font-bold">Rs {stats.monthRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Low Stock Alerts</h2>
            <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-semibold">
              {lowStockProducts.length} Items
            </span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-green-400 text-4xl mb-3"></i>
              <p className="text-gray-400">All products are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition">
                  <img 
                    src={product.mainImage} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">{product.name}</h3>
                    <p className="text-gray-400 text-xs">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${product.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {product.stock} left
                    </p>
                    <Link 
                      to={`/products/edit/${product._id}`}
                      className="text-[#D2C1B6] text-xs hover:text-white transition"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-700/30 rounded-lg transition">
                <div className={`w-10 h-10 bg-${activity.color}-600/20 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <i className={`fas ${activity.icon} text-${activity.color}-400`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/products/new" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#D2C1B6] transition group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
              <i className="fas fa-plus text-blue-400 group-hover:text-white transition"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Add Product</h3>
              <p className="text-gray-400 text-sm">Create new product</p>
            </div>
          </div>
        </Link>

        <Link to="/orders" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#D2C1B6] transition group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition">
              <i className="fas fa-list text-green-400 group-hover:text-white transition"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Manage Orders</h3>
              <p className="text-gray-400 text-sm">View all orders</p>
            </div>
          </div>
        </Link>

        <Link to="/users" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#D2C1B6] transition group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition">
              <i className="fas fa-users text-purple-400 group-hover:text-white transition"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">View Users</h3>
              <p className="text-gray-400 text-sm">Manage users</p>
            </div>
          </div>
        </Link>

        <Link to="/coupons" className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#D2C1B6] transition group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition">
              <i className="fas fa-tag text-yellow-400 group-hover:text-white transition"></i>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Coupons</h3>
              <p className="text-gray-400 text-sm">Manage discounts</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
