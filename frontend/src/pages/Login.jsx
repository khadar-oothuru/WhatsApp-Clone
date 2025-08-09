import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaWhatsapp } from "react-icons/fa";
import qrCodeImage from "../assets/qr.png";

const Login = () => {
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
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
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <header className="bg-[#00a884] py-4">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center gap-2">
            <FaWhatsapp className="text-white text-xl" />
            <span className="text-white text-lg font-normal">WHATSAPP WEB</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="max-w-6xl w-full">
          {/* Download Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v14h14V5H5z" />
                    <path d="M7 7h10v2H7zM7 11h10v2H7zM7 15h6v2H7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-normal text-gray-800 mb-1">
                    Download WhatsApp for Windows
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Make calls, share your screen and get a faster experience
                    when you download the Windows app.
                  </p>
                </div>
              </div>
              <button className="bg-[#00a884] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#008f72] transition-colors">
                Download ↓
              </button>
            </div>
          </div>

          {/* Login Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {!showPhoneLogin ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Instructions */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-3xl font-light text-gray-800 mb-8">
                    Steps to log in
                  </h1>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 bg-white">
                        1
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800">Open WhatsApp</span>
                        <div className="w-6 h-6 bg-[#00a884] rounded flex items-center justify-center">
                          <FaWhatsapp className="text-white text-sm" />
                        </div>
                        <span className="text-gray-800">on your phone</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 bg-white">
                        2
                      </div>
                      <div>
                        <span className="text-gray-800">
                          On Android tap Menu{" "}
                        </span>
                        <span className="text-gray-500">⋮</span>
                        <span className="text-gray-800">
                          {" "}
                          · On iPhone tap Settings{" "}
                        </span>
                        <span className="text-gray-500">⚙</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 bg-white">
                        3
                      </div>
                      <span className="text-gray-800">
                        Tap Linked devices, then Link device
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 bg-white">
                        4
                      </div>
                      <span className="text-gray-800">
                        Scan the QR code to confirm
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepSignedIn"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 text-[#00a884] bg-white border border-gray-300 rounded focus:ring-[#00a884] focus:ring-2"
                    />
                    <label
                      htmlFor="keepSignedIn"
                      className="text-gray-700 text-sm cursor-pointer"
                    >
                      Stay logged in on this browser
                    </label>
                    <svg
                      className="w-4 h-4 text-gray-400 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right Side - QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-80 h-80 bg-white rounded-lg flex items-center justify-center mb-4">
                    {loading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00a884] border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                      </div>
                    ) : (
                      <img
                        src={qrCodeImage}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    )}
                  </div>
                  {/* Move the login with phone number button here */}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowPhoneLogin(true)}
                      className="text-[#00a884] hover:underline text-sm font-medium"
                    >
                      Log in with phone number →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Phone Login Form */
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => setShowPhoneLogin(false)}
                  className="mb-6 text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to QR code
                </button>

                <h3 className="text-2xl font-light text-gray-800 mb-8">
                  Log in with phone number
                </h3>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone number or Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
                      placeholder="Enter your phone or username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-colors"
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
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9.878 9.878m4.242 4.242l4.242 4.242M9.878 9.878l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepSignedInPhone"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 text-[#00a884] bg-white border border-gray-300 rounded focus:ring-[#00a884] focus:ring-2"
                    />
                    <label
                      htmlFor="keepSignedInPhone"
                      className="text-gray-700 text-sm cursor-pointer"
                    >
                      Keep me signed in
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#00a884] hover:bg-[#008f72] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a884] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-[#00a884] hover:underline"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm mb-4">
              Don't have a WhatsApp account?{" "}
              <Link
                to="/register"
                className="text-[#00a884] hover:underline font-medium"
              >
                Get started →
              </Link>
            </p>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Your personal messages are end-to-end encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
