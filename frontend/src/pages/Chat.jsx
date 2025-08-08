
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

const Chat = ({ archived = false, starred = false, isSearchMode = false }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
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

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
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
  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen bg-wa-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-wa-text-secondary">Loading...</p>
        </div>
      </div>
    );
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
      {/* Mobile Layout */}
      {isMobile ? (
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
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex w-full h-full bg-wa-panel-header overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-96 min-w-[24rem] max-w-[30rem] border-r border-wa-border flex-shrink-0 bg-wa-panel animate-fade-in">
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
              isMobile={isMobile}
            />
          </div>
        </div>
      )}

      {/* FIXED: Better connection status handling */}
      {user && user._id && !onlineUsers.includes(user._id) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-wa-lg text-sm animate-bounce-gentle z-50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="font-medium">Connecting to WhatsApp...</span>
          </div>
        </div>
      )}
    </div>
  );
};

Chat.propTypes = {
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  isSearchMode: PropTypes.bool,
};

export default Chat;