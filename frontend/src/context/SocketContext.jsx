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

  // ============ WhatsApp Socket Methods ============

  const sendWhatsAppMessage = useCallback(
    (phoneNumber, message, type = "text") => {
      if (socket.current?.connected) {
        socket.current.emit("send-whatsapp-message", {
          phoneNumber,
          message,
          type,
        });
        return true;
      }
      console.warn("Socket not connected. WhatsApp message not sent.");
      return false;
    },
    []
  );

  const onWhatsAppMessage = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("whatsapp-message-received", callback);
      return () => {
        if (socket.current) {
          socket.current.off("whatsapp-message-received", callback);
        }
      };
    }
    return () => {};
  }, []);

  const onWhatsAppStatusUpdate = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("whatsapp-status-update", callback);
      return () => {
        if (socket.current) {
          socket.current.off("whatsapp-status-update", callback);
        }
      };
    }
    return () => {};
  }, []);

  const onWhatsAppWebhook = useCallback((callback) => {
    if (socket.current) {
      socket.current.on("whatsapp-webhook-processed", callback);
      return () => {
        if (socket.current) {
          socket.current.off("whatsapp-webhook-processed", callback);
        }
      };
    }
    return () => {};
  }, []);

  const subscribeToWhatsAppContact = useCallback((phoneNumber) => {
    if (socket.current?.connected) {
      socket.current.emit("subscribe-whatsapp-contact", { phoneNumber });
      return true;
    }
    return false;
  }, []);

  const unsubscribeFromWhatsAppContact = useCallback((phoneNumber) => {
    if (socket.current?.connected) {
      socket.current.emit("unsubscribe-whatsapp-contact", { phoneNumber });
      return true;
    }
    return false;
  }, []);

  const joinWhatsAppConversation = useCallback((conversationId) => {
    if (socket.current?.connected) {
      socket.current.emit("join-whatsapp-conversation", { conversationId });
      return true;
    }
    return false;
  }, []);

  const leaveWhatsAppConversation = useCallback((conversationId) => {
    if (socket.current?.connected) {
      socket.current.emit("leave-whatsapp-conversation", { conversationId });
      return true;
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({
      // Regular socket methods
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

      // WhatsApp socket methods
      sendWhatsAppMessage,
      onWhatsAppMessage,
      onWhatsAppStatusUpdate,
      onWhatsAppWebhook,
      subscribeToWhatsAppContact,
      unsubscribeFromWhatsAppContact,
      joinWhatsAppConversation,
      leaveWhatsAppConversation,
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
      sendWhatsAppMessage,
      onWhatsAppMessage,
      onWhatsAppStatusUpdate,
      onWhatsAppWebhook,
      subscribeToWhatsAppContact,
      unsubscribeFromWhatsAppContact,
      joinWhatsAppConversation,
      leaveWhatsAppConversation,
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
