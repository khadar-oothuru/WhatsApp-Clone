import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AuthContext: Checking token on mount:", token);
    if (token) {
      // Verify token validity here if needed
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          token,
          user: JSON.parse(localStorage.getItem("user") || "{}"),
        },
      });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.login(credentials);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      dispatch({
        type: "AUTH_SUCCESS",
        payload: response,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error.response?.data?.error || "Login failed",
      });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.register(userData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      dispatch({
        type: "AUTH_SUCCESS",
        payload: response,
      });
      return response;
    } catch (error) {
      dispatch({
        type: "AUTH_ERROR",
        payload: error.response?.data?.error || "Registration failed",
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.user) {
        await authService.logout(state.user._id);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  }, [state.user]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
    }),
    [state, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
