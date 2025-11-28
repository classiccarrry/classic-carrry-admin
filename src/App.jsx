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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Checking backend connection...</p>
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
