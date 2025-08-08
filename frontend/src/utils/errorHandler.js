import React from "react";

// API Error Handler
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.error || data?.message || "An error occurred";

    switch (status) {
      case 400:
        throw new APIError("Bad Request: " + message, status, data);
      case 401:
        // Handle unauthorized - redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new APIError("Unauthorized: " + message, status, data);
      case 403:
        throw new APIError("Forbidden: " + message, status, data);
      case 404:
        throw new APIError("Not Found: " + message, status, data);
      case 429:
        throw new APIError("Too Many Requests: " + message, status, data);
      case 500:
        throw new APIError("Internal Server Error: " + message, status, data);
      case 502:
        throw new APIError(
          "Bad Gateway: Server is temporarily unavailable",
          status,
          data
        );
      case 503:
        throw new APIError(
          "Service Unavailable: Server is temporarily unavailable",
          status,
          data
        );
      default:
        throw new APIError(message, status, data);
    }
  } else if (error.request) {
    // Network error
    throw new APIError("Network error: Unable to connect to server", 0);
  } else {
    // Other error
    throw new APIError(error.message || "An unexpected error occurred", 0);
  }
};

// Retry logic for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry for certain error types
      if (
        error.status === 401 ||
        error.status === 403 ||
        error.status === 404
      ) {
        throw error;
      }

      // If this is the last retry, throw the error
      if (i === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw lastError;
};

// Request timeout handler
export const withTimeout = (promise, timeoutMs = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new APIError("Request timeout", 408));
      }, timeoutMs);
    }),
  ]);
};

// Offline detection
export const isOnline = () => {
  return navigator.onLine;
};

// Queue for offline requests
class OfflineRequestQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    this.isProcessing = false;

    // Listen for online events
    window.addEventListener("online", () => {
      this.processQueue();
    });
  }

  add(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    });
    localStorage.setItem("offlineQueue", JSON.stringify(this.queue));
  }

  async processQueue() {
    if (this.isProcessing || !isOnline() || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const requests = [...this.queue];
      this.queue = [];
      localStorage.setItem("offlineQueue", JSON.stringify(this.queue));

      for (const request of requests) {
        try {
          // Process request based on type
          // This would need to be implemented based on your specific needs
          console.log("Processing offline request:", request);
        } catch (error) {
          console.error("Failed to process offline request:", error);
          // Optionally re-add to queue
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  clear() {
    this.queue = [];
    localStorage.removeItem("offlineQueue");
  }
}

export const offlineQueue = new OfflineRequestQueue();

// Connection status hooks
export const useConnectionStatus = () => {
  const [isOnlineStatus, setIsOnlineStatus] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnlineStatus;
};

// Request interceptor for handling common scenarios
export const requestInterceptor = {
  onRequest: (config) => {
    // Add timestamp to prevent caching
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Add correlation ID for debugging
    config.headers["X-Correlation-ID"] = Math.random()
      .toString(36)
      .substr(2, 9);

    return config;
  },

  onResponse: (response) => {
    return response;
  },

  onError: (error) => {
    // Log error for debugging
    console.error("API Request Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    return handleAPIError(error);
  },
};

export default {
  APIError,
  handleAPIError,
  retryRequest,
  withTimeout,
  isOnline,
  offlineQueue,
  useConnectionStatus,
  requestInterceptor,
};
