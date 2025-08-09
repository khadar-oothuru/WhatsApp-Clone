import React, { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";
import { apiService } from "../services/apiService";
import { useDebouncedAPI } from "../utils/debounce";
import LeftNavigation from "./Sidebar/LeftNavigation";
import SidebarHeader from "./Sidebar/SidebarHeader";
import SidebarSearchBar from "./Sidebar/SidebarSearchBar";
import SidebarFilterTabs from "./Sidebar/SidebarFilterTabs_new";
import SidebarProfile from "./Sidebar/SidebarProfile";
import SidebarEmptyState from "./Sidebar/SidebarEmptyState";
import SidebarChatList from "./Sidebar/SidebarChatList";
import {
  WhatsAppPhoneSearchModal,
  WhatsAppSettingsModal,
} from "./Sidebar/SidebarWhatsAppModals";
import "./Sidebar/sidebar-styles.css";

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
  const [activeTab, setActiveTab] = useState("chats");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  // Direct state management for better control
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  // Fetch conversations function
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      console.log(
        "[Sidebar] fetchConversations: Not authenticated or no user ID"
      );
      return;
    }

    setConversationsLoading(true);
    setConversationsError(null);

    try {
      console.log("[Sidebar] Fetching conversations for user:", user._id);
      const result = await apiService.messages.getConversations();
      console.log("[Sidebar] Conversations fetch result:", result);

      if (Array.isArray(result)) {
        setConversations(result);
        console.log(
          "[Sidebar] Successfully set conversations:",
          result.length,
          "items"
        );
      } else {
        console.log(
          "[Sidebar] Conversations API returned non-array, setting empty array"
        );
        setConversations([]);
      }
    } catch (error) {
      console.error("[Sidebar] Error fetching conversations:", error);
      setConversationsError(error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      console.log("[Sidebar] fetchUsers: Not authenticated or no user ID");
      return;
    }

    setUsersLoading(true);
    setUsersError(null);

    try {
      console.log("[Sidebar] Fetching users for user:", user._id);
      const result = await apiService.users.getAllUsers();
      console.log("[Sidebar] Users fetch result:", result);

      if (Array.isArray(result)) {
        setUsers(result);
        console.log(
          "[Sidebar] Successfully set users:",
          result.length,
          "items"
        );
      } else {
        console.log(
          "[Sidebar] Users API returned non-array, setting empty array"
        );
        setUsers([]);
      }
    } catch (error) {
      console.error("[Sidebar] Error fetching users:", error);
      setUsersError(error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  // Refetch functions
  const refetchConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refetchUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-fetch data when auth state is ready
  useEffect(() => {
    if (isAuthenticated && user?._id && !authLoading) {
      console.log("[Sidebar] Auth ready, fetching data");
      fetchConversations();
      fetchUsers();
    }
  }, [isAuthenticated, user?._id, authLoading, fetchConversations, fetchUsers]);

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

  // FIXED: More intelligent loading state
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

  // Simplified data processing function
  const getBaseItems = useCallback(() => {
    console.log("[Sidebar] getBaseItems called with:", {
      isAuthenticated,
      userId: user?._id,
      authLoading,
      conversationsData: conversations,
      usersData: users,
      conversationsLoading,
      usersLoading,
    });

    if (authLoading || !isAuthenticated || !user) {
      console.log("[Sidebar] getBaseItems: Not ready for data processing");
      return [];
    }

    // Handle search results first
    if (searchTerm.trim() && searchResults && Array.isArray(searchResults)) {
      const searchItems = searchResults
        .filter((searchUser) => searchUser._id !== user._id)
        .map((searchUser) => ({
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
      console.log(
        "[Sidebar] getBaseItems: Using search results:",
        searchItems.length
      );
      return searchItems;
    }

    // Process conversations
    if (
      conversations &&
      Array.isArray(conversations) &&
      conversations.length > 0
    ) {
      const validConversations = conversations.filter(
        (conv) => conv?.user?._id && conv.user._id !== user._id
      );

      if (validConversations.length > 0) {
        const convItems = validConversations.map((conv) => ({
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
        console.log(
          "[Sidebar] getBaseItems: Using conversations:",
          convItems.length
        );
        return convItems;
      }
    }

    // Process users as fallback
    if (users && Array.isArray(users) && users.length > 0) {
      const filteredUsers = users.filter(
        (availableUser) => availableUser._id !== user._id
      );
      const userItems = filteredUsers.map((availableUser) => ({
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
      console.log("[Sidebar] getBaseItems: Using users:", userItems.length);
      return userItems;
    }

    console.log("[Sidebar] getBaseItems: No valid data available", {
      conversationsIsArray: Array.isArray(conversations),
      conversationsLength: Array.isArray(conversations)
        ? conversations.length
        : "N/A",
      usersIsArray: Array.isArray(users),
      usersLength: Array.isArray(users) ? users.length : "N/A",
      conversationsNull: conversations === null,
      usersNull: users === null,
    });

    return [];
  }, [
    searchTerm,
    searchResults,
    conversations,
    users,
    onlineUsers,
    authLoading,
    isAuthenticated,
    user,
    conversationsLoading,
    usersLoading,
  ]);

  const applyFilters = useCallback(
    (items) => {
      // Apply filters only if not searching
      if (searchTerm.trim()) return items;

      switch (activeFilter) {
        case "unread":
          return items.filter((chat) => chat.unreadCount > 0);
        case "archived":
          return items.filter((chat) => chat.isArchived);
        case "favourites":
          return items.filter((chat) => chat.isPinned);
        case "groups":
          return items.filter((chat) => chat.isGroup);
        default:
          return archived ? items : items.filter((chat) => !chat.isArchived);
      }
    },
    [activeFilter, searchTerm, archived]
  );

  const sortItems = useCallback((items) => {
    return items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = new Date(a.lastMessage?.createdAt || 0);
      const bTime = new Date(b.lastMessage?.createdAt || 0);
      return bTime - aTime;
    });
  }, []);

  const filteredItems = useMemo(() => {
    const baseItems = getBaseItems();
    if (!baseItems || baseItems.length === 0) return [];
    const filtered = applyFilters(baseItems);
    return sortItems(filtered);
  }, [getBaseItems, applyFilters, sortItems]);

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
      console.log(
        "[Sidebar] User selected:",
        chat.user.username,
        "unreadCount:",
        chat.unreadCount
      );
      onSelectUser(chat.user);

      // Mark messages as read when opening a conversation
      if (chat.unreadCount > 0) {
        messageService
          .markMessagesAsRead(chat.user._id)
          .then(() => {
            console.log(
              "[Sidebar] Messages marked as read for:",
              chat.user.username
            );
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
    console.log("[Sidebar] Users data state:", {
      hasUsers: !!users,
      isArray: Array.isArray(users),
      length: Array.isArray(users) ? users.length : "N/A",
      loading: usersLoading,
      error: usersError?.message,
      rawData: users, // Log raw data to see structure
      dataType: typeof users,
      dataKeys:
        users && typeof users === "object" && !Array.isArray(users)
          ? Object.keys(users)
          : "N/A",
    });

    if (users && Array.isArray(users) && users.length > 0) {
      console.log(
        `[Sidebar] Users loaded: ${users.length}`,
        users.map((u) => ({ id: u._id, username: u.username }))
      );
    } else if (users && Array.isArray(users) && users.length === 0) {
      console.log("[Sidebar] Users array is empty");
    } else if (users && !Array.isArray(users)) {
      console.log("[Sidebar] Users is not an array:", typeof users, users);
    } else if (usersError) {
      console.error("[Sidebar] Users error:", usersError);
    }
  }, [users, usersLoading, usersError]);

  useEffect(() => {
    console.log("[Sidebar] Conversations data state:", {
      hasConversations: !!conversations,
      isArray: Array.isArray(conversations),
      length: Array.isArray(conversations) ? conversations.length : "N/A",
      loading: conversationsLoading,
      error: conversationsError?.message,
      rawData: conversations, // Log raw data to see structure
      dataType: typeof conversations,
      dataKeys:
        conversations &&
        typeof conversations === "object" &&
        !Array.isArray(conversations)
          ? Object.keys(conversations)
          : "N/A",
    });

    if (
      conversations &&
      Array.isArray(conversations) &&
      conversations.length > 0
    ) {
      console.log(
        `[Sidebar] Chats loaded: ${conversations.length}`,
        conversations.map((c) => ({ id: c._id, user: c.user?.username }))
      );
    } else if (
      conversations &&
      Array.isArray(conversations) &&
      conversations.length === 0
    ) {
      console.log("[Sidebar] Conversations array is empty");
    } else if (conversations && !Array.isArray(conversations)) {
      console.log(
        "[Sidebar] Conversations is not an array:",
        typeof conversations,
        conversations
      );
    } else if (conversationsError) {
      console.error("[Sidebar] Conversations error:", conversationsError);
    }
  }, [conversations, conversationsLoading, conversationsError]);

  // Search results logging (only when searching)
  useEffect(() => {
    if (searchTerm.trim() && searchResults && Array.isArray(searchResults)) {
      console.log(
        `[Sidebar] Search: ${searchResults.length} results for "${searchTerm}"`,
        searchResults.map((u) => ({ id: u._id, username: u.username }))
      );
    }
  }, [searchResults, searchTerm]);

  // Removed periodic refresh to prevent infinite loops - data will refresh on user interactions

  // ============ WhatsApp Integration useEffect Hooks ============

  // Check WhatsApp linking status
  useEffect(() => {
    if (user && user._id) {
      // Check if user has WhatsApp data
      const hasWhatsAppData =
        user.wa_id || user.phone_number || user.phone_number_id;
      setIsWhatsAppLinked(hasWhatsAppData);

      if (hasWhatsAppData) {
        const profile = {
          wa_id: user.wa_id,
          phone_number: user.phone_number,
          phone_number_id: user.phone_number_id,
          whatsapp_name: user.whatsapp_name || user.username,
          is_business: !!user.phone_number_id,
        };
        setWhatsappProfile(profile);
      } else {
        setWhatsappProfile(null);
      }
    }
  }, [user]);

  // WhatsApp handlers
  // Handle WhatsApp linking with proper API integration
  const handleLinkWhatsApp = useCallback(
    async (whatsappData) => {
      try {
        // Validate phone number first
        if (!whatsappData.phone_number) {
          throw new Error("Phone number is required");
        }

        // Basic phone number validation
        const phoneRegex = /^\+\d{1,3}\d{10,14}$/;
        if (!phoneRegex.test(whatsappData.phone_number)) {
          throw new Error(
            "Please enter a valid phone number with country code (e.g., +1234567890)"
          );
        }

        // Update user profile with WhatsApp data
        const updateData = {
          wa_id: whatsappData.wa_id,
          phone_number: whatsappData.phone_number.replace("+", ""),
          phone_number_id: whatsappData.phone_number_id,
          whatsapp_name: whatsappData.whatsapp_name || user?.username,
        };

        // Use userService to update profile
        await userService.updateProfile(updateData);

        setIsWhatsAppLinked(true);
        const profile = {
          ...updateData,
          phone_number: whatsappData.phone_number.replace("+", ""),
          is_business: !!whatsappData.phone_number_id,
        };
        setWhatsappProfile(profile);
        setShowWhatsAppSettings(false);

        // Refresh user data to get updated WhatsApp info
        await refetchUsers();

        console.log("[Sidebar] WhatsApp account linked successfully");
        return profile;
      } catch (error) {
        console.error("Failed to link WhatsApp account:", error);
        alert(`Failed to link WhatsApp account: ${error.message}`);
        throw error;
      }
    },
    [refetchUsers, user]
  );

  const handleUnlinkWhatsApp = useCallback(async () => {
    try {
      // Remove WhatsApp data from user profile
      const updateData = {
        wa_id: null,
        phone_number: null,
        phone_number_id: null,
        whatsapp_name: null,
      };

      await userService.updateProfile(updateData);

      setIsWhatsAppLinked(false);
      setWhatsappProfile(null);

      // Refresh user data to reflect the unlink
      await refetchUsers();

      console.log("[Sidebar] WhatsApp account unlinked successfully");
    } catch (error) {
      console.error("Failed to unlink WhatsApp account:", error);
      alert(`Failed to unlink WhatsApp account: ${error.message}`);
      throw error;
    }
  }, [refetchUsers]);

  const handlePhoneSearch = useCallback(
    async (phoneNumber) => {
      try {
        // Validate phone number first
        if (!phoneNumber) {
          alert("Please enter a phone number");
          return;
        }

        // Basic phone number validation
        const phoneRegex = /^\+\d{1,3}\d{10,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
          alert(
            "Please enter a valid phone number with country code (e.g., +1234567890)"
          );
          return;
        }

        // Clean phone number (remove + for search)
        const cleanPhone = phoneNumber.replace("+", "");

        // Search for user by phone number
        const foundUser = await userService.getUserByPhone(cleanPhone);

        if (foundUser && onSelectUser) {
          onSelectUser(foundUser);
          setShowPhoneSearch(false);
          setPhoneSearchQuery("");
          console.log("[Sidebar] User found by phone:", foundUser.username);
        } else {
          alert("No user found with that phone number");
        }
      } catch (error) {
        console.error("Phone search failed:", error);
        alert(`Phone search failed: ${error.message}`);
      }
    },
    [onSelectUser]
  );

  if (showProfile) {
    return (
      <SidebarProfile
        user={user}
        setShowProfile={setShowProfile}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <div className="whatsapp-sidebar">
      {/* Left Navigation - Always visible on desktop */}
      <div className="hidden md:flex">
        <LeftNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowProfile={setShowProfile}
          setShowWhatsAppSettings={setShowWhatsAppSettings}
        />
      </div>

      {/* Main Sidebar Content */}
      <div className="main-sidebar-content border-r border-wa-border">
        {/* Header */}
        <div className="flex-shrink-0">
          <SidebarHeader
            archived={archived}
            starred={starred}
            onMobileMenuClick={() => setShowMobileMenu(true)}
          />
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0">
          <SidebarSearchBar
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex-shrink-0">
          <SidebarFilterTabs
            archived={archived}
            starred={starred}
            activeFilter={activeFilter}
            handleFilterChange={handleFilterChange}
          />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-wa-text-tertiary scrollbar-track-transparent hover:scrollbar-thumb-wa-text-secondary">
            {/* Show loading only when actually loading data, not during auth loading */}
            {!authLoading && loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-wa-text-secondary text-sm">
                  Loading chats...
                </p>
              </div>
            ) : null}

            {/* Show auth loading state */}
            {authLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-wa-text-secondary text-sm">
                  Authenticating...
                </p>
              </div>
            ) : null}

            {/* Show empty state when not loading and no data */}
            {!authLoading && !loading && filteredItems.length === 0 && (
              <SidebarEmptyState
                searchTerm={searchTerm}
                archived={archived}
                starred={starred}
                activeFilter={activeFilter}
                conversationsError={conversationsError}
                usersError={usersError}
              />
            )}

            {/* Show chat list when data is available */}
            {!authLoading && !loading && filteredItems.length > 0 && (
              <SidebarChatList
                filteredItems={filteredItems}
                selectedUser={selectedUser}
                handleUserSelect={handleUserSelect}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          <div className="absolute left-0 top-0 h-full bg-wa-panel shadow-lg">
            <LeftNavigation
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setShowMobileMenu(false);
              }}
              setShowProfile={(show) => {
                setShowProfile(show);
                setShowMobileMenu(false);
              }}
              setShowWhatsAppSettings={(show) => {
                setShowWhatsAppSettings(show);
                setShowMobileMenu(false);
              }}
            />
          </div>
        </div>
      )}
      {/* WhatsApp Phone Search Modal */}
      <WhatsAppPhoneSearchModal
        show={showPhoneSearch}
        phoneSearchQuery={phoneSearchQuery}
        setPhoneSearchQuery={setPhoneSearchQuery}
        handlePhoneSearch={handlePhoneSearch}
        setShowPhoneSearch={setShowPhoneSearch}
      />
      {/* WhatsApp Settings Modal */}
      <WhatsAppSettingsModal
        show={showWhatsAppSettings}
        isWhatsAppLinked={isWhatsAppLinked}
        whatsappProfile={whatsappProfile}
        handleUnlinkWhatsApp={handleUnlinkWhatsApp}
        setShowWhatsAppSettings={setShowWhatsAppSettings}
        handleLinkWhatsApp={handleLinkWhatsApp}
      />
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
