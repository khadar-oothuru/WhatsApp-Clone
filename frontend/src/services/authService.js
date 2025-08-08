import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);

      // Store token and user data
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      throw new Error(errorMessage);
    }
  },

  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);

      // Store token and user data
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      throw new Error(errorMessage);
    }
  },

  async logout(userId) {
    try {
      const response = await api.post("/auth/logout", { userId });

      // Clear stored data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Get current token
  getToken() {
    return localStorage.getItem("token");
  },

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },
};

export default api;
