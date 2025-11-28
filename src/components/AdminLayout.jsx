import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Auto-open on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile/tablet
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/', icon: 'fa-dashboard', label: 'Dashboard' },
    { path: '/hero-images', icon: 'fa-images', label: 'Hero Images' },
    { path: '/categories', icon: 'fa-folder', label: 'Categories' },
    { path: '/products', icon: 'fa-box', label: 'Products' },
    { path: '/orders', icon: 'fa-shopping-cart', label: 'Orders' },
    { path: '/users', icon: 'fa-users', label: 'Users' },
    { path: '/coupons', icon: 'fa-tag', label: 'Coupons' },
    { path: '/contacts', icon: 'fa-envelope', label: 'Contacts' },
    { path: '/settings', icon: 'fa-cog', label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col z-50
        fixed inset-y-0 left-0
        ${sidebarOpen ? 'w-64' : isMobile ? '-translate-x-full w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-2xl text-white logo-font flex items-center gap-2">
                {settings.appearance.siteName} <span>{settings.appearance.brandEmoji || '🛍️'}</span>
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition"
            >
              <i className={`fas fa-${sidebarOpen ? 'angle-left' : 'angle-right'}`}></i>
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${
                    location.pathname === item.path
                      ? 'active'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  <i className={`fas ${item.icon} text-lg`}></i>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#D2C1B6] rounded-full flex items-center justify-center">
              <i className="fas fa-user text-gray-900"></i>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{user?.name}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'ml-64' : isMobile ? 'ml-0' : 'ml-20'
      }`}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <h1 className="text-white text-lg logo-font flex items-center gap-2">
              {settings.appearance.siteName} <span>{settings.appearance.brandEmoji || '🛍️'}</span>
            </h1>
            <div className="w-8"></div>
          </div>
        )}
        
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
