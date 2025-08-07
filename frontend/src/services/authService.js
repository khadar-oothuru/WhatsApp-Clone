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

export const authService = {
  async login(credentials) {
    console.log("AuthService: Attempting login with:", credentials);
    try {
      const response = await api.post("/auth/login", credentials);
      console.log("AuthService: Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error("AuthService: Login error:", error);
      throw error;
    }
  },

  async register(userData) {
    console.log("AuthService: Attempting registration with:", userData);
    try {
      const response = await api.post("/auth/register", userData);
      console.log("AuthService: Registration response:", response.data);
      return response.data;
    } catch (error) {
      console.error("AuthService: Registration error:", error);
      throw error;
    }
  },

  async logout(userId) {
    console.log("AuthService: Attempting logout for user:", userId);
    try {
      const response = await api.post("/auth/logout", { userId });
      console.log("AuthService: Logout response:", response.data);
      return response.data;
    } catch (error) {
      console.error("AuthService: Logout error:", error);
      throw error;
    }
  },
};

export default api;
