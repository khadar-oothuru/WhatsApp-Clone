import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import PropTypes from "prop-types";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      socket.current = io("http://localhost:5000", {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      // Handle connection events
      socket.current.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
        setConnectionError(null);
        // Emit user online status after successful connection
        socket.current.emit("user-online", user._id);
      });

      socket.current.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
        setIsConnected(false);
      });

      socket.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      socket.current.on("reconnect", (attemptNumber) => {
        console.log("Reconnected to server after", attemptNumber, "attempts");
        setIsConnected(true);
        setConnectionError(null);
        socket.current.emit("user-online", user._id);
      });

      socket.current.on("reconnect_error", (error) => {
        console.error("Reconnection error:", error);
        setConnectionError(error.message);
      });

      // Cleanup on unmount
      return () => {
        if (socket.current) {
          socket.current.removeAllListeners();
          socket.current.disconnect();
          socket.current = null;
          setIsConnected(false);
          setConnectionError(null);
        }
      };
    } else if (socket.current) {
      // Disconnect socket if user is not authenticated
      socket.current.removeAllListeners();
      socket.current.disconnect();
      socket.current = null;
      setIsConnected(false);
      setConnectionError(null);
    }
  }, [isAuthenticated, user]);

  const sendMessage = useCallback((recipientId, message) => {
    if (socket.current?.connected) {
      socket.current.emit("send-message", {
        recipientId,
        message,
      });
      return true;
    }
    console.warn("Socket not connected. Message not sent.");
    return false;
  }, []);

  const startTyping = useCallback((recipientId) => {
    if (socket.current?.connected) {
      socket.current.emit("typing", { recipientId });
    }
  }, []);

  const stopTyping = useCallback((recipientId) => {
    if (socket.current?.connected) {
      socket.current.emit("stop-typing", { recipientId });
    }
  }, []);

  const onReceiveMessage = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("receive-message", callback);
      return () => {
        if (socket.current) {
          socket.current.off("receive-message", callback);
        }
      };
    }
    return () => {};
  }, []);

  const onUsersOnline = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("users-online", callback);
      return () => {
        if (socket.current) {
          socket.current.off("users-online", callback);
        }
      };
    }
    return () => {};
  }, []);

  const onUserTyping = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("user-typing", callback);
      return () => {
        if (socket.current) {
          socket.current.off("user-typing", callback);
        }
      };
    }
    return () => {};
  }, []);

  const onUserStopTyping = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("user-stop-typing", callback);
      return () => {
        if (socket.current) {
          socket.current.off("user-stop-typing", callback);
        }
      };
    }
    return () => {};
  }, []);

  const removeListener = useCallback((event, callback) => {
    if (socket.current) {
      if (callback) {
        socket.current.off(event, callback);
      } else {
        socket.current.off(event);
      }
    }
  }, []);

  const getConnectionStatus = useCallback(() => {
    return {
      isConnected,
      error: connectionError,
      socket: socket.current,
    };
  }, [isConnected, connectionError]);

  const value = useMemo(
    () => ({
      sendMessage,
      startTyping,
      stopTyping,
      onReceiveMessage,
      onUsersOnline,
      onUserTyping,
      onUserStopTyping,
      removeListener,
      getConnectionStatus,
      isConnected,
      connectionError,
    }),
    [
      sendMessage,
      startTyping,
      stopTyping,
      onReceiveMessage,
      onUsersOnline,
      onUserTyping,
      onUserStopTyping,
      removeListener,
      getConnectionStatus,
      isConnected,
      connectionError,
    ]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { SocketProvider, useSocket };
