import { useState, useEffect } from 'react';

const BackendErrorPage = ({ onRetry }) => {
  const [countdown, setCountdown] = useState(30);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry();
    setIsRetrying(false);
    setCountdown(30);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-3xl text-[#D2C1B6] mb-2 flex items-center justify-center gap-2" style={{ fontFamily: 'Satisfy, cursive' }}>
            Classic Carrry <span>🛍️</span>
          </h1>
          <p className="text-gray-400 text-sm">Admin Dashboard</p>
          <div className="w-20 h-1 bg-[#D2C1B6] mx-auto rounded-full mt-2"></div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Visual */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-12 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <i className="fas fa-plug text-6xl text-[#D2C1B6]"></i>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4">Connection Issue</h2>
                <p className="text-gray-300 text-lg">
                  We're unable to reach the backend server
                </p>
              </div>
            </div>

            {/* Right Side - Information */}
            <div className="p-12 bg-slate-800">
              <h3 className="text-2xl font-bold text-white mb-6">What's happening?</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-server text-red-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Server Unavailable</h4>
                    <p className="text-gray-400 text-sm">Backend service might be under maintenance or not running</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-wifi text-orange-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Network Issue</h4>
                    <p className="text-gray-400 text-sm">Please check your internet connection</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clock text-blue-400"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Starting Up</h4>
                    <p className="text-gray-400 text-sm">Server might be starting (usually takes a few moments)</p>
                  </div>
                </div>
              </div>

         

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-[#D2C1B6] text-slate-900 px-6 py-4 rounded-xl font-semibold hover:bg-[#C4B5A8] transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt"></i>
                      Retry Connection
                    </>
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-500">
                  Auto-retrying in {countdown} seconds...
                </p>
              </div>
            </div>
          </div>
        </div>

    
      </div>
    </div>
  );
};

export default BackendErrorPage;
