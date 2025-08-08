import React, { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaSearch,
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaThumbtack,
  FaWhatsapp,
  FaPhone,
  FaPlus,
  FaCog,
  FaLink,
  FaUnlink,
} from "react-icons/fa";
import { MdChatBubble } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import Avatar from "./Avatar";
import { formatLastSeen, truncateText } from "../utils/helpers";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";
import { whatsappService } from "../services/whatsappService";
import { useAPI } from "../hooks/useAPI";
import { useDebouncedAPI } from "../utils/debounce";

const Sidebar = ({
  onSelectUser,
  selectedUser,
  onlineUsers = [],
  archived = false,
  starred = false,
  searchQuery = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");
  const [activeFilter, setActiveFilter] = useState(() => {
    if (archived) return "archived";
    if (starred) return "favourites";
    return "all";
  });
  const [showProfile, setShowProfile] = useState(false);

  // WhatsApp-specific state
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [showPhoneSearch, setShowPhoneSearch] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");
  const [isWhatsAppLinked, setIsWhatsAppLinked] = useState(false);
  const [whatsappProfile, setWhatsappProfile] = useState(null);

  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();

  // Update search term when external searchQuery changes
  useEffect(() => {
    if (searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery, searchTerm]);

  // Update filter when props change
  useEffect(() => {
    let newFilter = "all";
    if (archived) newFilter = "archived";
    else if (starred) newFilter = "favourites";

    if (newFilter !== activeFilter) {
      setActiveFilter(newFilter);
    }
  }, [archived, starred, activeFilter]);

  // Create stable API call functions
  const getConversationsAPI = useCallback(() => {
    return messageService.getConversations();
  }, []);

  const getUsersAPI = useCallback(() => {
    return userService.getUsers();
  }, []);

  // Fetch conversations with stable dependencies
  const {
    data: conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useAPI(getConversationsAPI, [user?._id], {
    immediate: Boolean(isAuthenticated && user?._id),
    enableLogging: false,
    debounceMs: 100,
  });

  // Fetch all users as fallback with stable dependencies
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useAPI(getUsersAPI, [user?._id], {
    immediate: Boolean(isAuthenticated && user?._id),
    enableLogging: false,
    debounceMs: 100,
  });

  // Create stable search API function
  const searchUsersAPI = useCallback((query) => {
    return userService.searchUsers(query);
  }, []);

  // Debounced search - only if authenticated
  const {
    data: searchResults,
    loading: searchLoading,
    execute: executeSearch,
  } = useDebouncedAPI(searchUsersAPI, 300);

  // Handle filter change with stable callback
  const handleFilterChange = useCallback((newFilter) => {
    setActiveFilter(newFilter);
  }, []);

  // More intelligent loading state
  const loading = useMemo(() => {
    if (authLoading) return false;
    if (!isAuthenticated || !user) return false;

    const dataLoading = conversationsLoading || usersLoading;
    const searchingLoading = searchLoading && searchTerm.trim().length >= 2;

    return dataLoading || searchingLoading;
  }, [
    authLoading,
    isAuthenticated,
    user,
    conversationsLoading,
    usersLoading,
    searchLoading,
    searchTerm,
  ]);

  // FIXED: Removed duplicate filter logic and improved the filtering
  const filteredItems = useMemo(() => {
    if (authLoading || !isAuthenticated || !user) {
      return [];
    }

    const safeConversations = Array.isArray(conversations) ? conversations : [];
    const safeUsers = Array.isArray(users) ? users : [];

    let items = [];

    // Use search results if searching
    if (searchTerm.trim() && searchResults) {
      if (Array.isArray(searchResults)) {
        items = searchResults.map((searchUser) => ({
          id: searchUser._id,
          user: searchUser,
          lastMessage: {
            content: searchUser.status || "Available to chat",
            createdAt: searchUser.lastSeen || new Date(),
          },
          unreadCount: 0,
          isOnline: onlineUsers.includes(searchUser._id),
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isGroup: false,
        }));
      }
    } else {
      // Use conversations if available
      const validConversations = safeConversations.filter(
        (conv) => conv && conv.user && conv.user._id
      );

      if (validConversations.length > 0) {
        items = validConversations.map((conv) => ({
          id: conv._id,
          user: conv.user,
          lastMessage: conv.lastMessage || {
            content: "No messages yet",
            createdAt: new Date(),
          },
          unreadCount: conv.unreadCount || 0,
          isOnline: onlineUsers.includes(conv.user?._id),
          isPinned: conv.isPinned || false,
          isArchived: conv.isArchived || false,
          isMuted: conv.isMuted || false,
          isGroup: conv.isGroup || false,
          groupName: conv.groupName,
          groupAvatar: conv.groupAvatar,
        }));
      } else if (safeUsers.length > 0) {
        // Fallback to users if no conversations
        items = safeUsers.map((availableUser) => ({
          id: availableUser._id,
          user: availableUser,
          lastMessage: {
            content: availableUser.status || "Available to chat",
            createdAt: availableUser.lastSeen || new Date(),
          },
          unreadCount: 0,
          isOnline: onlineUsers.includes(availableUser._id),
          isPinned: false,
          isArchived: false,
          isMuted: false,
          isGroup: false,
        }));
      }
    }

    // Apply filters only once and only if not searching
    if (!searchTerm.trim()) {
      switch (activeFilter) {
        case "unread":
          items = items.filter((chat) => chat.unreadCount > 0);
          break;
        case "archived":
          items = items.filter((chat) => chat.isArchived);
          break;
        case "favourites":
          items = items.filter((chat) => chat.isPinned);
          break;
        case "groups":
          items = items.filter((chat) => chat.isGroup);
          break;
        case "all":
        default:
          if (!archived) {
            items = items.filter((chat) => !chat.isArchived);
          }
          break;
      }
    }

    // Sort items: pinned first, then by last message time
    return items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = new Date(a.lastMessage?.createdAt || 0);
      const bTime = new Date(b.lastMessage?.createdAt || 0);
      return bTime - aTime;
    });
  }, [
    searchTerm,
    searchResults,
    conversations,
    users,
    onlineUsers,
    activeFilter,
    authLoading,
    isAuthenticated,
    user,
    archived,
  ]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (value) => {
      setSearchTerm(value);

      if (!value.trim()) {
        return;
      }

      if (
        value.trim().length >= 2 &&
        isAuthenticated &&
        user &&
        !authLoading &&
        executeSearch
      ) {
        executeSearch(value.trim());
      }
    },
    [executeSearch, isAuthenticated, user, authLoading]
  );

  // Handle user selection with stable callback
  const handleUserSelect = useCallback(
    (chat) => {
      onSelectUser(chat.user);

      // Mark messages as read when opening a conversation
      if (chat.unreadCount > 0) {
        messageService
          .markMessagesAsRead(chat.user._id)
          .then(() => {
            if (conversations) {
              refetchConversations();
            }
          })
          .catch((error) => {
            console.error("Failed to mark messages as read:", error);
          });
      }
    },
    [onSelectUser, conversations, refetchConversations]
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // FIXED: More stable logging effects with proper dependencies
  // Debug logging with reduced verbosity
  useEffect(() => {
    if (users && Array.isArray(users) && users.length > 0) {
      console.log(`[Sidebar] Users loaded: ${users.length}`);
    }
  }, [users]);

  useEffect(() => {
    if (
      conversations &&
      Array.isArray(conversations) &&
      conversations.length > 0
    ) {
      console.log(`[Sidebar] Chats loaded: ${conversations.length}`);
    }
  }, [conversations]);

  // Search results logging (only when searching)
  useEffect(() => {
    if (searchTerm.trim() && searchResults && Array.isArray(searchResults)) {
      console.log(
        `[Sidebar] Search: ${searchResults.length} results for "${searchTerm}"`
      );
    }
  }, [searchResults, searchTerm]);

  // ============ WhatsApp Integration useEffect Hooks ============

  // Check WhatsApp linking status
  useEffect(() => {
    if (user) {
      const linked = userService.isWhatsAppLinked();
      setIsWhatsAppLinked(linked);

      if (linked) {
        const profile = userService.getWhatsAppProfile();
        setWhatsappProfile(profile);
      }
    }
  }, [user]);

  // WhatsApp handlers
  const handleLinkWhatsApp = useCallback(async (whatsappData) => {
    try {
      await userService.linkWhatsAppAccount(whatsappData);
      setIsWhatsAppLinked(true);
      const profile = userService.getWhatsAppProfile();
      setWhatsappProfile(profile);
      setShowWhatsAppSettings(false);
    } catch (error) {
      console.error("Failed to link WhatsApp account:", error);
      alert("Failed to link WhatsApp account: " + error.message);
    }
  }, []);

  const handleUnlinkWhatsApp = useCallback(async () => {
    try {
      await userService.unlinkWhatsAppAccount();
      setIsWhatsAppLinked(false);
      setWhatsappProfile(null);
    } catch (error) {
      console.error("Failed to unlink WhatsApp account:", error);
      alert("Failed to unlink WhatsApp account: " + error.message);
    }
  }, []);

  const handlePhoneSearch = useCallback(
    async (phoneNumber) => {
      try {
        const user = await userService.getUserByPhone(phoneNumber);
        if (user && onSelectUser) {
          onSelectUser(user);
          setShowPhoneSearch(false);
          setPhoneSearchQuery("");
        } else {
          alert("No user found with that phone number");
        }
      } catch (error) {
        console.error("Phone search failed:", error);
        alert("Phone search failed: " + error.message);
      }
    },
    [onSelectUser]
  );

  if (showProfile) {
    return (
      <div className="w-full md:w-80 bg-wa-panel-header flex flex-col h-full">
        {/* Profile Header */}
        <div className="bg-wa-primary p-4 text-white flex items-center">
          <button
            onClick={() => setShowProfile(false)}
            className="mr-4 p-2 hover:bg-wa-primary-dark rounded-full transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-lg font-medium">Profile</h2>
        </div>

        {/* Profile Content */}
        <div className="flex-1 bg-wa-bg p-6">
          <div className="text-center">
            <Avatar
              src={user?.profilePicture}
              username={user?.username}
              size="2xl"
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-medium text-wa-text mb-2">
              {user?.username}
            </h3>
            <p className="text-wa-text-secondary mb-4">{user?.email}</p>
            <p className="text-sm text-wa-text-secondary bg-wa-panel p-3 rounded-lg">
              {user?.status || "Hey there! I am using WhatsApp"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-8 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-wa-panel flex flex-col">
      {/* Header */}
      <div className="bg-wa-panel-header">
        <div className="px-4 py-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-wa-text">
            {archived ? "Archived" : starred ? "Starred" : "WhatsApp"}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors"
              onClick={() => setShowPhoneSearch(true)}
              title="Search by phone number"
            >
              <FaPhone className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${
                isWhatsAppLinked
                  ? "text-green-600 hover:bg-green-100"
                  : "text-wa-text-secondary hover:bg-wa-input-panel"
              }`}
              onClick={() => setShowWhatsAppSettings(true)}
              title={
                isWhatsAppLinked ? "WhatsApp linked" : "Link WhatsApp account"
              }
            >
              <FaWhatsapp className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <FaUsers className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors"
            >
              <FaUser className="w-4 h-4" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <MdChatBubble className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <BsThreeDotsVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-wa-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchTerm}
              className="w-full pl-10 pr-4 py-2 bg-wa-input-panel rounded-lg text-wa-text placeholder-wa-text-secondary focus:outline-none focus:bg-wa-input transition-all duration-200"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs - Hide when in specific modes */}
        {!archived && !starred && (
          <div className="px-3 py-2 flex items-center space-x-2 border-b border-wa-border">
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleFilterChange("all")}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-wa-primary",
                activeFilter === "all"
                  ? "bg-wa-primary/20 text-wa-primary"
                  : "text-wa-text-secondary hover:bg-wa-input-panel"
              )}
              aria-pressed={activeFilter === "all"}
            >
              <MdChatBubble className="w-4 h-4" /> All
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleFilterChange("unread")}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-wa-primary",
                activeFilter === "unread"
                  ? "bg-wa-primary/20 text-wa-primary"
                  : "text-wa-text-secondary hover:bg-wa-input-panel"
              )}
              aria-pressed={activeFilter === "unread"}
            >
              <span className="inline-block w-2 h-2 bg-wa-primary rounded-full mr-1"></span>
              Unread
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleFilterChange("favourites")}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-wa-primary",
                activeFilter === "favourites"
                  ? "bg-wa-primary/20 text-wa-primary"
                  : "text-wa-text-secondary hover:bg-wa-input-panel"
              )}
              aria-pressed={activeFilter === "favourites"}
            >
              <FaThumbtack className="w-3 h-3" /> Favourites
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => handleFilterChange("groups")}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-wa-primary",
                activeFilter === "groups"
                  ? "bg-wa-primary/20 text-wa-primary"
                  : "text-wa-text-secondary hover:bg-wa-input-panel"
              )}
              aria-pressed={activeFilter === "groups"}
            >
              <FaUsers className="w-3 h-3" /> Groups
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-wa-bg">
        {/* Show loading only when actually loading data, not during auth loading */}
        {!authLoading && loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-wa-text-secondary">Loading chats...</p>
          </div>
        ) : null}

        {/* Show auth loading state */}
        {authLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-wa-text-secondary">Authenticating...</p>
          </div>
        ) : null}

        {/* Show empty state when not loading and no data */}
        {!authLoading && !loading && filteredItems.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-wa-text-secondary mb-4">
              {(() => {
                if (searchTerm) return "No results found";
                if (archived) return "No archived chats";
                if (starred) return "No starred messages";
                if (activeFilter === "unread") return "No unread chats";
                if (activeFilter === "groups") return "No groups";
                if (activeFilter === "favourites") return "No favourite chats";
                return "No chats available";
              })()}
            </div>

            {/* Show error message if there are API errors */}
            {(conversationsError || usersError) && (
              <div className="text-red-500 text-sm mb-4">
                {conversationsError && (
                  <div>
                    Failed to load conversations: {conversationsError.message}
                  </div>
                )}
                {usersError && (
                  <div>Failed to load users: {usersError.message}</div>
                )}
              </div>
            )}

            {!searchTerm && !archived && !starred && isAuthenticated && (
              <div className="mt-4 space-y-2">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={refetchUsers}
                    className="text-wa-primary hover:underline"
                  >
                    Refresh Users
                  </button>
                  <span className="text-wa-text-secondary">|</span>
                  <button
                    onClick={refetchConversations}
                    className="text-wa-primary hover:underline"
                  >
                    Refresh Chats
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show chat list when data is available */}
        {!authLoading && !loading && filteredItems.length > 0 && (
          <div>
            {filteredItems.map((chat) => {
              const isSelected =
                selectedUser && selectedUser._id === chat.user._id;
              const timeStr = formatLastSeen(
                chat.lastMessage?.createdAt || new Date()
              );

              return (
                <button
                  key={chat.id}
                  onClick={() => handleUserSelect(chat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleUserSelect(chat);
                    }
                  }}
                  className={clsx(
                    "w-full flex items-center px-3 py-3 hover:bg-wa-input-panel cursor-pointer transition-colors text-left",
                    isSelected && "bg-wa-input-panel"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative mr-3">
                    <Avatar
                      src={chat.user.profilePicture}
                      username={chat.user.username}
                      size="lg"
                      showOnline={true}
                      isOnline={chat.isOnline}
                    />
                    {chat.isPinned && (
                      <div className="absolute -top-1 -right-1 bg-wa-primary rounded-full p-1">
                        <FaThumbtack className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-wa-text truncate flex items-center">
                        {chat.isGroup && (
                          <FaUsers className="w-4 h-4 mr-1 text-wa-text-secondary" />
                        )}
                        {chat.user.username}
                        {chat.user.phone_number && (
                          <FaWhatsapp
                            className="w-3 h-3 ml-1 text-green-500"
                            title="WhatsApp User"
                          />
                        )}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <span
                          className={clsx(
                            "text-xs",
                            chat.unreadCount > 0
                              ? "text-wa-primary font-semibold"
                              : "text-wa-text-secondary"
                          )}
                        >
                          {timeStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm text-wa-text-secondary truncate pr-2">
                          {truncateText(chat.lastMessage?.content || "", 40)}
                        </p>
                        {chat.user.phone_number && (
                          <p className="text-xs text-wa-text-secondary opacity-75">
                            +{chat.user.phone_number}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {chat.unreadCount > 0 && (
                          <span className="bg-wa-primary text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                        {chat.user.wa_id && (
                          <div className="flex items-center">
                            <span className="text-xs px-1 py-0.5 bg-green-100 text-green-800 rounded">
                              WA
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Phone Search Modal */}
      {showPhoneSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Search by Phone Number
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePhoneSearch(phoneSearchQuery);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={phoneSearchQuery}
                  onChange={(e) => setPhoneSearchQuery(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +1 for US, +91 for India)
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneSearch(false);
                    setPhoneSearchQuery("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Settings Modal */}
      {showWhatsAppSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">WhatsApp Integration</h3>

            {isWhatsAppLinked ? (
              <div>
                <div className="flex items-center mb-4 p-4 bg-green-50 rounded-lg">
                  <FaWhatsapp className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">
                      WhatsApp Account Linked
                    </h4>
                    {whatsappProfile && (
                      <div className="text-sm text-green-600">
                        <p>Phone: +{whatsappProfile.phone_number}</p>
                        {whatsappProfile.whatsapp_name && (
                          <p>Name: {whatsappProfile.whatsapp_name}</p>
                        )}
                        {whatsappProfile.is_business && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                            Business Account
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-medium mb-2">Features Available:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ Send WhatsApp messages</li>
                    <li>✅ Receive message status updates</li>
                    <li>✅ Use WhatsApp templates</li>
                    <li>✅ Phone number search</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleUnlinkWhatsApp}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  >
                    <FaUnlink className="w-4 h-4 mr-2" />
                    Unlink Account
                  </button>
                  <button
                    onClick={() => setShowWhatsAppSettings(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <FaWhatsapp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">
                    Link Your WhatsApp Account
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Connect your WhatsApp Business account to send and receive
                    messages directly from this chat app.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const whatsappData = {
                      wa_id: formData.get("wa_id"),
                      phone_number: formData.get("phone_number"),
                      phone_number_id: formData.get("phone_number_id"),
                      whatsapp_name: formData.get("whatsapp_name"),
                    };
                    handleLinkWhatsApp(whatsappData);
                  }}
                >
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        WhatsApp ID
                      </label>
                      <input
                        name="wa_id"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your WhatsApp ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        name="phone_number"
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number ID
                      </label>
                      <input
                        name="phone_number_id"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="WhatsApp Business Phone Number ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Display Name
                      </label>
                      <input
                        name="whatsapp_name"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your display name on WhatsApp"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppSettings(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                    >
                      <FaLink className="w-4 h-4 mr-2" />
                      Link Account
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Sidebar.propTypes = {
  onSelectUser: PropTypes.func.isRequired,
  selectedUser: PropTypes.object,
  onlineUsers: PropTypes.array,
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  searchQuery: PropTypes.string,
};

export default Sidebar;
