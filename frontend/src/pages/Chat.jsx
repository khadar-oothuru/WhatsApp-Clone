import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { useAPI } from "../hooks/useAPI";
import { useAppNavigation } from "../hooks/useNavigation";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import WhatsAppLoadingScreen from "../components/WhatsAppLoadingScreen";

const Chat = ({ archived = false, starred = false, isSearchMode = false }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isMedium, setIsMedium] = useState(false);
  // Loading UI state
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  // Simulate loading progress for demo (replace with real logic as needed)
  useEffect(() => {
    if (!showLoadingScreen) return;
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 8) + 4; // random step
      if (percent >= 100) {
        percent = 100;
        setLoadingPercent(percent);
        clearInterval(interval);
        setTimeout(() => setShowLoadingScreen(false), 400); // fade out
      } else {
        setLoadingPercent(percent);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [showLoadingScreen]);
  const { onUsersOnline, removeListener } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const { userId, groupId } = useParams();
  const { getCurrentRoute, getLocationState } = useAppNavigation();

  const routeInfo = getCurrentRoute();
  const locationState = getLocationState();

  // FIXED: Create a more stable function with better dependency management
  const fetchUserCallback = useCallback(() => {
    // Only make the API call if we have a userId and are authenticated
    if (!userId || !isAuthenticated || !user?._id) {
      return Promise.resolve(null);
    }
    return userService.getUserById(userId);
  }, [userId, isAuthenticated, user?._id]); // Use user._id instead of user object

  // FIXED: Use proper dependency array to prevent loops
  const {
    data: userFromUrl,
    loading: userLoading,
    error: userError,
    execute: fetchUserById,
  } = useAPI(fetchUserCallback, [userId, isAuthenticated, user?._id]);

  // Set page title based on current route
  useEffect(() => {
    let title = "WhatsApp Clone";

    if (archived) title = "Archived Chats - WhatsApp Clone";
    else if (starred) title = "Starred Messages - WhatsApp Clone";
    else if (isSearchMode) title = "Search - WhatsApp Clone";
    else if (selectedUser) title = `${selectedUser.username} - WhatsApp Clone`;
    else if (routeInfo.type === "status") title = "Status - WhatsApp Clone";
    else if (routeInfo.type === "calls") title = "Calls - WhatsApp Clone";

    document.title = title;
  }, [archived, starred, isSearchMode, selectedUser?.username, routeInfo.type]);

  // Check if mobile or medium screen
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsMedium(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Listen for online users updates
  useEffect(() => {
    if (!onUsersOnline) return;

    const handleUsersOnline = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    onUsersOnline(handleUsersOnline);

    return () => {
      if (removeListener) {
        removeListener("users-online");
      }
    };
  }, [onUsersOnline, removeListener]);

  // FIXED: Better handling of URL parameters with proper dependencies
  useEffect(() => {
    // Only fetch if we have a userId and no selected user or selected user doesn't match
    if (userId && (!selectedUser || selectedUser._id !== userId)) {
      fetchUserById();
    }
  }, [userId, selectedUser?._id, fetchUserById]);

  // FIXED: More stable effect for setting selected user
  useEffect(() => {
    if (userFromUrl && userId && userFromUrl._id === userId) {
      setSelectedUser(userFromUrl);
    }
  }, [userFromUrl?._id, userId]);

  // Clear selected user when navigating away from individual chat
  useEffect(() => {
    if (!userId && !groupId) {
      setSelectedUser(null);
    }
  }, [userId, groupId]);

  // Handle search query from location state with better memoization
  const searchQuery = useMemo(() => {
    return isSearchMode && locationState?.query ? locationState.query : "";
  }, [isSearchMode, locationState?.query]);

  // FIXED: More stable callbacks
  const handleSelectUser = useCallback((user) => {
    if (user && user._id) {
      setSelectedUser(user);
    }
  }, []);

  const handleBackToSidebar = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // FIXED: Better error handling and loading states
  // Show WhatsApp-style loading screen until loaded
  if (showLoadingScreen || !isAuthenticated || !user) {
    return <WhatsAppLoadingScreen percent={loadingPercent} />;
  }

  // Show error state if there's an error loading user
  if (userError && userId) {
    return (
      <div className="h-screen bg-wa-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load chat</p>
          <button
            onClick={() => fetchUserById()}
            className="text-wa-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state for fetching a specific chat user
  if (userLoading && userId) {
    return (
      <div className="h-screen bg-wa-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-wa-text-secondary">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-wa-bg flex overflow-hidden chat-container">
      {/* Mobile and Medium (Tablet) Layout - Show only one panel at a time */}
      {isMobile || isMedium ? (
        <div className="w-full h-full flex flex-col mobile-full-height">
          {!selectedUser ? (
            <div className="flex-1 animate-slide-up">
              <Sidebar
                onSelectUser={handleSelectUser}
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                onBackToSidebar={handleBackToSidebar}
                archived={archived}
                starred={starred}
                search={isSearchMode}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <div className="flex-1 animate-slide-up">
              <ChatArea
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                onBackToSidebar={handleBackToSidebar}
                isMobile={isMobile || isMedium}
              />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Show both panels side by side */
        <div className="flex w-full h-full bg-wa-panel-header overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-[28rem] min-w-[28rem] max-w-[36rem] border-r border-wa-border flex-shrink-0 bg-wa-panel animate-fade-in">
            <Sidebar
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              archived={archived}
              starred={starred}
              search={isSearchMode}
              searchQuery={searchQuery}
            />
          </div>

          {/* Right Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-wa-bg animate-fade-in chat-messages-container">
            <ChatArea
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              isMobile={false}
            />
          </div>
        </div>
      )}

      {/* Removed yellow connection pop-up. Loading handled by overlay. */}
    </div>
  );
};

Chat.propTypes = {
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  isSearchMode: PropTypes.bool,
};

export default Chat;
