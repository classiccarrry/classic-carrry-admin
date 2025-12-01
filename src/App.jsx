import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BackendHealthProvider, useBackendHealth } from './contexts/BackendHealthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import BackendErrorPage from './components/BackendErrorPage';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import HeroImages from './pages/HeroImages';
import HeroImageForm from './pages/HeroImageForm';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';
import Contacts from './pages/Contacts';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { isBackendHealthy, isChecking, checkBackendHealth } = useBackendHealth();

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="text-center relative px-4">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D2C1B6]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#A68A6F]/10 rounded-full blur-2xl animate-pulse delay-75"></div>
          </div>

        {/* Logo/Brand */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#8B7355] to-[#A68A6F] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
              <div className="text-6xl">✨</div>
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-[#8B7355]/20 via-[#A68A6F]/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Satisfy, cursive' }}>
            Classic Carrry
          </h1>
          <p className="text-gray-400 text-lg mb-8">Admin Dashboard</p>

          {/* Circular Progress Ring */}
          <div className="relative mb-6">
            <svg className="w-8 h-8 mx-auto" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(210, 193, 182, 0.2)"
                strokeWidth="8"
              />
              {/* Animated progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#adminGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="283"
                transform="rotate(-90 50 50)"
                className="animate-progress-ring"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D2C1B6" />
                  <stop offset="100%" stopColor="#A68A6F" />
                </linearGradient>
              </defs>
            </svg>
          
          </div>

      
        </div>
      </div>
    );
  }

  if (!isBackendHealthy) {
    return <BackendErrorPage onRetry={checkBackendHealth} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="hero-images" element={<HeroImages />} />
        <Route path="hero-images/new" element={<HeroImageForm />} />
        <Route path="hero-images/edit/:id" element={<HeroImageForm />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<CategoryForm />} />
        <Route path="categories/edit/:id" element={<CategoryForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <BackendHealthProvider>
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </SettingsProvider>
        </AuthProvider>
      </BackendHealthProvider>
    </Router>
  );
}

export default App;
