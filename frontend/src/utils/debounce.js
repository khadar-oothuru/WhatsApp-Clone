// Simple debounce utility
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Custom hook for debounced values
import { useState, useEffect, useCallback } from "react";

export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Enhanced debounced API hook
export function useDebouncedAPI(apiCall, delay = 300) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    (...args) => {
      // Clear previous timeout if exists
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const result = await apiCall(...args);
          setData(result);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }, delay);

      // Cleanup function
      return () => clearTimeout(timeoutId);
    },
    [apiCall, delay]
  );

  return { data, loading, error, execute };
}
