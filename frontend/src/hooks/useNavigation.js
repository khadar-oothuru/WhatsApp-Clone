import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useCallback } from "react";

// Custom navigation hooks for WhatsApp-like routing
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const goToChat = useCallback(
    (userId = null) => {
      if (userId) {
        navigate(`/chat/${userId}`);
      } else {
        navigate("/chat");
      }
    },
    [navigate]
  );

  const goToGroup = useCallback(
    (groupId) => {
      navigate(`/chat/group/${groupId}`);
    },
    [navigate]
  );

  const goToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const goToSettings = useCallback(
    (settingsPage = null) => {
      if (settingsPage) {
        navigate(`/settings/${settingsPage}`);
      } else {
        navigate("/settings");
      }
    },
    [navigate]
  );

  const goToArchivedChats = useCallback(() => {
    navigate("/chat/archived");
  }, [navigate]);

  const goToStarredMessages = useCallback(() => {
    navigate("/chat/starred");
  }, [navigate]);

  const goToStatus = useCallback(() => {
    navigate("/chat/status");
  }, [navigate]);

  const goToCalls = useCallback(() => {
    navigate("/chat/calls");
  }, [navigate]);

  const goToSearch = useCallback(
    (query = "") => {
      navigate("/chat/search", { state: { query } });
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const goToRegister = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  // Get current route information
  const getCurrentRoute = useCallback(() => {
    const path = location.pathname;

    if (path === "/chat" || path === "/") {
      return { section: "chat", type: "main" };
    }

    if (path.startsWith("/chat/")) {
      const segments = path.split("/");
      if (segments[2] === "group") {
        return { section: "chat", type: "group", id: segments[3] };
      } else if (
        ["archived", "starred", "status", "calls", "search"].includes(
          segments[2]
        )
      ) {
        return { section: "chat", type: segments[2] };
      } else {
        return { section: "chat", type: "user", id: segments[2] };
      }
    }

    if (path === "/profile") {
      return { section: "profile", type: "main" };
    }

    if (path.startsWith("/settings")) {
      const segments = path.split("/");
      return {
        section: "settings",
        type: segments[2] || "main",
      };
    }

    if (path === "/login") {
      return { section: "auth", type: "login" };
    }

    if (path === "/register") {
      return { section: "auth", type: "register" };
    }

    return { section: "unknown", type: "unknown" };
  }, [location.pathname]);

  // Check if we're in a specific section
  const isInSection = useCallback(
    (section) => {
      return getCurrentRoute().section === section;
    },
    [getCurrentRoute]
  );

  // Get URL parameters
  const getParams = useCallback(() => {
    return params;
  }, [params]);

  // Get query parameters
  const getQueryParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  // Get state from location
  const getLocationState = useCallback(() => {
    return location.state || {};
  }, [location.state]);

  return {
    // Navigation functions
    goToChat,
    goToGroup,
    goToProfile,
    goToSettings,
    goToArchivedChats,
    goToStarredMessages,
    goToStatus,
    goToCalls,
    goToSearch,
    goBack,
    goToLogin,
    goToRegister,

    // Route information
    getCurrentRoute,
    isInSection,
    getParams,
    getQueryParams,
    getLocationState,

    // Direct access to react-router hooks
    navigate,
    location,
    params,
  };
};

// Hook for managing browser history
export const useBrowserHistory = () => {
  const navigate = useNavigate();

  const pushState = useCallback(
    (path, state = {}) => {
      navigate(path, { state, replace: false });
    },
    [navigate]
  );

  const replaceState = useCallback(
    (path, state = {}) => {
      navigate(path, { state, replace: true });
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  const canGoBack = window.history.length > 1;

  return {
    pushState,
    replaceState,
    goBack,
    goForward,
    canGoBack,
  };
};

// Hook for managing route-based state
export const useRouteState = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const updateState = useCallback(
    (newState) => {
      navigate(location.pathname, {
        state: { ...location.state, ...newState },
        replace: true,
      });
    },
    [navigate, location.pathname, location.state]
  );

  const clearState = useCallback(() => {
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);

  return {
    state: location.state || {},
    updateState,
    clearState,
  };
};

// Hook for handling deep links and external navigation
export const useDeepLinks = () => {
  const { goToChat, goToGroup } = useAppNavigation();

  const handleDeepLink = useCallback(
    (url) => {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;

        // Handle different types of deep links
        if (path.startsWith("/chat/")) {
          const segments = path.split("/");
          if (segments[2] === "group") {
            goToGroup(segments[3]);
          } else {
            goToChat(segments[2]);
          }
          return true;
        }

        return false;
      } catch (error) {
        console.error("Invalid deep link URL:", error);
        return false;
      }
    },
    [goToChat, goToGroup]
  );

  const generateShareLink = useCallback((type, id) => {
    const baseUrl = window.location.origin;

    switch (type) {
      case "chat":
        return `${baseUrl}/chat/${id}`;
      case "group":
        return `${baseUrl}/chat/group/${id}`;
      default:
        return baseUrl;
    }
  }, []);

  return {
    handleDeepLink,
    generateShareLink,
  };
};

export default useAppNavigation;
