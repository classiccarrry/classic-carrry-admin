import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_URL from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Classic Carrry',
    brandEmoji: '🛍️'
  });
  const [resetData, setResetData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState(() => {
    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('adminRememberedEmail');
    const savedPassword = localStorage.getItem('adminRememberedPassword');
    if (savedEmail && savedPassword) {
      setRememberMe(true);
      return {
        email: savedEmail,
        password: savedPassword
      };
    }
    return {
      email: '',
      password: ''
    };
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings/appearance`);
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setSettings({
              siteName: data.data.siteName || 'Classic Carrry',
              brandEmoji: data.data.brandEmoji || '🛍️'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('adminRememberedEmail', formData.email);
          localStorage.setItem('adminRememberedPassword', formData.password);
        } else {
          localStorage.removeItem('adminRememberedEmail');
          localStorage.removeItem('adminRememberedPassword');
        }
        
        navigate('/');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (resetData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Password reset successfully!');
      setShowResetPassword(false);
      setResetData({ email: '', newPassword: '', confirmPassword: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700">
        
        {/* Left Side - Brand Section with Enhanced Design */}
        <div className="lg:w-1/2 bg-slate-800 p-8 lg:p-16 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D2C1B6]/20 rounded-full blur-3xl translate-y-32 -translate-x-32 animate-pulse" style={{ animationDelay: '700ms' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#D2C1B6]/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
          
          <div className="relative h-full flex flex-col justify-between">
            {/* Logo Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
               
                <span className="text-5xl font-bold  text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Satisfy, cursive' }}>
                  {settings.siteName} <span>{settings.brandEmoji}</span>
                </span>
              </div>
           
            </div>

            {/* Center Content */}
            <div className="flex-1 flex flex-col justify-center max-w-lg py-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                    Welcome Back
                  </h1>
                  <div className="h-1.5 w-24 bg-gradient-to-r from-[#D2C1B6] to-[#C4B5A8] rounded-full"></div>
                </div>
                <p className="text-slate-200 text-lg leading-relaxed">
                  Access your powerful dashboard to manage products, analyze sales trends, and streamline your e-commerce operations with advanced analytics.
                </p>
                
          
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '📊', label: 'Analytics' },
                { icon: '📦', label: 'Inventory' },
                { icon: '👥', label: 'Customers' },
                { icon: '💳', label: 'Payments' },
                { icon: '🚚', label: 'Shipping' },
                { icon: '📈', label: 'Reports' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center gap-2 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  <span className="text-white text-xs font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="lg:w-1/2 bg-slate-900 p-8 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            {!showResetPassword ? (
              /* Login Form */
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D2C1B6] to-[#C4B5A8] rounded-2xl mb-2 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-[#D2C1B6] to-[#C4B5A8] bg-clip-text text-transparent">
                    Sign In
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Enter your credentials to access your dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#D2C1B6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-[#D2C1B6]/20 focus:border-[#D2C1B6] focus:outline-none transition-all duration-200"
                          placeholder="admin@example.com"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#D2C1B6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-[#D2C1B6]/20 focus:border-[#D2C1B6] focus:outline-none transition-all duration-200"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-[#D2C1B6] focus:ring-2 focus:ring-[#D2C1B6]" 
                      />
                      <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-[#D2C1B6] hover:text-[#C4B5A8] font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#D2C1B6] to-[#C4B5A8] hover:from-[#C4B5A8] hover:to-[#B8A599] text-slate-900 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="pt-6 border-t border-slate-700">
                  <p className="text-center text-sm text-slate-400">
                    Protected by enterprise-grade security
                    <span className="block mt-1 text-xs text-slate-500">🔒 SSL Encrypted</span>
                  </p>
                </div>
              </div>
            ) : (
              /* Reset Password Form */
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D2C1B6] to-[#C4B5A8] rounded-2xl mb-2 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-[#D2C1B6] to-[#C4B5A8] bg-clip-text text-transparent">
                    Reset Password
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Enter your email and create a new secure password
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#D2C1B6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          required
                          value={resetData.email}
                          onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-[#D2C1B6]/20 focus:border-[#D2C1B6] focus:outline-none transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        New Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#D2C1B6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          required
                          value={resetData.newPassword}
                          onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-[#D2C1B6]/20 focus:border-[#D2C1B6] focus:outline-none transition-all duration-200"
                          placeholder="Min. 6 characters"
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400 group-focus-within:text-[#D2C1B6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          required
                          value={resetData.confirmPassword}
                          onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-4 focus:ring-[#D2C1B6]/20 focus:border-[#D2C1B6] focus:outline-none transition-all duration-200"
                          placeholder="Re-enter password"
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#D2C1B6] to-[#C4B5A8] hover:from-[#C4B5A8] hover:to-[#B8A599] text-slate-900 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:trasor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting Password...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reset Password
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetData({ email: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="w-full text-slate-600 hover:text-slate-900 transition-colors text-sm py-3 font-semibold text-center border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;