import { useState, useEffect, useCallback, useRef } from "react";
import {
  handleAPIError,
  retryRequest,
  withTimeout,
} from "../utils/errorHandler";

// Custom hook for API calls with loading, error, and retry functionality
export const useAPI = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const lastExecutedRef = useRef(null);
  const { immediate = true, debounceMs = 0, enableLogging = false } = options;

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      if (!mountedRef.current) return;

      if (enableLogging) {
        console.log("useAPI.execute: Starting API call");
      }

      setLoading(true);
      setError(null);

      try {
        const result = await withTimeout(
          retryRequest(() => apiCall(...args)),
          15000 // 15 second timeout
        );

        if (enableLogging) {
          console.log("useAPI.execute: API call successful");
        }

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          return result;
        }
      } catch (err) {
        if (enableLogging) {
          console.error("useAPI.execute: API call failed:", err.message);
        }
        if (mountedRef.current) {
          const processedError = handleAPIError(err);
          setError(processedError);
          setLoading(false);
          throw processedError;
        }
      }
    },
    [apiCall, enableLogging]
  );

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (!immediate || !mountedRef.current) return;

    // Create a dependency signature for comparison
    const depSignature = JSON.stringify(dependencies);

    // Skip if dependencies haven't changed
    if (lastExecutedRef.current === depSignature) return;

    // Check if all dependencies are ready
    const shouldExecute =
      dependencies.length === 0 ||
      dependencies.every((dep) => dep !== null && dep !== undefined);

    if (shouldExecute) {
      lastExecutedRef.current = depSignature;

      if (enableLogging) {
        console.log("useAPI: Executing API call due to dependency change");
      }

      // Debounce if needed
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          execute().catch(() => {
            // Error already handled in execute function
            lastExecutedRef.current = null; // Reset on error to allow retry
          });
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }
  }, [execute, dependencies, immediate, debounceMs, enableLogging]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
  };
};

// Custom hook for pagination
export const usePagination = (apiCall, initialPage = 1, limit = 20) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    async (page, reset = false) => {
      if (!mountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(page, limit);

        if (mountedRef.current) {
          const newData = reset ? result.data : [...data, ...result.data];
          setData(newData);
          setCurrentPage(page);
          setTotalPages(result.totalPages || Math.ceil(result.total / limit));
          setHasMore(
            page < (result.totalPages || Math.ceil(result.total / limit))
          );
          setLoading(false);
          return result;
        }
      } catch (err) {
        if (mountedRef.current) {
          const processedError = handleAPIError(err);
          setError(processedError);
          setLoading(false);
          throw processedError;
        }
      }
    },
    [apiCall, limit, data]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(currentPage + 1);
    }
  }, [fetchPage, currentPage, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    fetchPage(initialPage, true);
  }, [fetchPage, initialPage]);

  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setTotalPages(0);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    hasMore,
    loadMore,
    refresh,
    reset,
  };
};

// Custom hook for real-time data with polling
export const usePolling = (apiCall, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const result = await apiCall();
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        const processedError = handleAPIError(err);
        setError(processedError);
      }
    }
  }, [apiCall]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    fetchData(); // Initial fetch
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  useEffect(() => {
    startPolling();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return {
    data,
    loading,
    error,
    startPolling,
    stopPolling,
    refreshData,
  };
};

// Custom hook for debounced API calls (useful for search)
export const useDebouncedAPI = (apiCall, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      if (!mountedRef.current) return;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set loading state
      setLoading(true);
      setError(null);

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await apiCall(...args);
          if (mountedRef.current) {
            setData(result);
            setLoading(false);
          }
        } catch (err) {
          if (mountedRef.current) {
            const processedError = handleAPIError(err);
            setError(processedError);
            setLoading(false);
          }
        }
      }, delay);
    },
    [apiCall, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    cancel,
  };
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = (apiCall, updateData) => {
  const [data, setData] = useState(updateData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const originalDataRef = useRef(updateData);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (optimisticData, ...apiArgs) => {
      if (!mountedRef.current) return;

      // Store original data for rollback
      originalDataRef.current = data;

      // Apply optimistic update
      setData(optimisticData);
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(...apiArgs);
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          return result;
        }
      } catch (err) {
        if (mountedRef.current) {
          // Rollback to original data
          setData(originalDataRef.current);
          const processedError = handleAPIError(err);
          setError(processedError);
          setLoading(false);
          throw processedError;
        }
      }
    },
    [apiCall, data]
  );

  return {
    data,
    loading,
    error,
    execute,
  };
};

// Custom hook for file uploads with progress
export const useFileUpload = (uploadApiCall) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const upload = useCallback(
    async (file, ...args) => {
      if (!mountedRef.current) return;

      setLoading(true);
      setError(null);
      setProgress(0);
      setData(null);

      try {
        const result = await uploadApiCall(
          file,
          {
            onUploadProgress: (progressEvent) => {
              if (mountedRef.current) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setProgress(percentCompleted);
              }
            },
          },
          ...args
        );

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setProgress(100);
          return result;
        }
      } catch (err) {
        if (mountedRef.current) {
          const processedError = handleAPIError(err);
          setError(processedError);
          setLoading(false);
          setProgress(0);
          throw processedError;
        }
      }
    },
    [uploadApiCall]
  );

  return {
    upload,
    progress,
    loading,
    error,
    data,
  };
};
