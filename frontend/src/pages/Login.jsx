import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaWhatsapp, FaApple, FaWindows } from "react-icons/fa";
import { AiFillAndroid } from "react-icons/ai";
import { IoQrCode } from "react-icons/io5";
import { HiOutlineDeviceMobile } from "react-icons/hi";

const Login = () => {
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#00a884] py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3">
            <FaWhatsapp className="text-white text-2xl" />
            <span className="text-white text-lg font-medium uppercase tracking-wide">WhatsApp Web</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Download Section */}
            <div className="bg-[#f0f2f5] p-8 lg:p-12">
              <div className="max-w-md">
                <h2 className="text-2xl font-light text-gray-800 mb-6">
                  Download WhatsApp for Windows
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Make calls, share your screen and get a faster experience when you download the Windows app.
                </p>
                
                <button className="bg-[#00a884] text-white px-6 py-3 rounded-full font-medium hover:bg-[#008f70] transition-colors mb-12">
                  Get the app
                </button>

                <div className="border-t border-gray-300 pt-8">
                  <p className="text-sm text-gray-600 mb-4">Download WhatsApp for</p>
                  <div className="flex gap-4">
                    <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors">
                      <FaApple className="text-gray-700 text-xl" />
                    </button>
                    <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors">
                      <AiFillAndroid className="text-gray-700 text-xl" />
                    </button>
                    <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors">
                      <FaWindows className="text-gray-700 text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - QR Login Section */}
            <div className="p-8 lg:p-12">
              {!showPhoneLogin ? (
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-light text-gray-800 mb-8">
                    Use WhatsApp on your computer
                  </h3>
                  
                  {/* QR Code */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-lg p-4">
                        {/* Simulated QR Code - In production, this would be a real QR code */}
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <IoQrCode className="text-6xl text-gray-400" />
                        </div>
                      </div>
                      {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-[#00a884] mx-auto mb-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-gray-600">Loading...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">1</span>
                      <p className="text-gray-700">Open WhatsApp on your phone</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">2</span>
                      <p className="text-gray-700">
                        Tap <span className="font-medium">Menu</span> <span className="text-gray-500">⋮</span> or <span className="font-medium">Settings</span> <span className="text-gray-500">⚙</span> and select <span className="font-medium">Linked Devices</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">3</span>
                      <p className="text-gray-700">
                        Tap on <span className="font-medium">Link a Device</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">4</span>
                      <p className="text-gray-700">Point your phone to this screen to capture the QR code</p>
                    </div>
                  </div>

                  {/* Keep me signed in checkbox */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="w-4 h-4 text-[#00a884] rounded focus:ring-[#00a884] focus:ring-offset-0 focus:ring-2"
                      />
                      <span className="text-sm text-gray-600">Keep me signed in</span>
                    </label>
                  </div>

                  {/* Link to phone login */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowPhoneLogin(true)}
                      className="text-[#00a884] hover:underline text-sm font-medium inline-flex items-center gap-2"
                    >
                      <HiOutlineDeviceMobile className="text-lg" />
                      Log in with phone number
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                /* Phone Login Form */
                <div className="max-w-md mx-auto">
                  <button
                    onClick={() => setShowPhoneLogin(false)}
                    className="mb-6 text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to QR code
                  </button>
                  
                  <h3 className="text-2xl font-light text-gray-800 mb-8">
                    Log in with phone number
                  </h3>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone number or Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
                        placeholder="Enter your phone or username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878m4.242 4.242l4.242 4.242M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Keep me signed in checkbox for phone login */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={keepSignedIn}
                          onChange={(e) => setKeepSignedIn(e.target.checked)}
                          className="w-4 h-4 text-[#00a884] rounded focus:ring-[#00a884] focus:ring-offset-0 focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">Keep me signed in</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#00a884] hover:bg-[#008f70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a884] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </button>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{" "}
                      <Link to="/register" className="font-medium text-[#00a884] hover:underline">
                        Create account
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-800">About</a>
            <a href="#" className="hover:text-gray-800">Features</a>
            <a href="#" className="hover:text-gray-800">Download</a>
            <a href="#" className="hover:text-gray-800">Privacy</a>
            <a href="#" className="hover:text-gray-800">Terms</a>
            <a href="#" className="hover:text-gray-800">Help</a>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            © 2024 WhatsApp Clone. Made with ❤️ for learning purposes.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
