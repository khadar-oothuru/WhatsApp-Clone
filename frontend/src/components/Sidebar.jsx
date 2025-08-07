import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { messageService } from "../services/messageService";
import {
  FaSearch,
  FaEllipsisV,
  FaCommentAlt,
  FaCircle,
  FaArrowLeft,
} from "react-icons/fa";
import Avatar from "./Avatar";
import {
  formatLastSeen,
  isUserOnline,
  truncateText,
  debounce,
} from "../utils/helpers";
import clsx from "clsx";

const Sidebar = ({ onSelectUser, selectedUser, onlineUsers }) => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // 'chats' or 'contacts'
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
      setFilteredItems(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedConversations = await messageService.getConversations();
      setConversations(fetchedConversations);
      setFilteredItems(fetchedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Fallback to users if conversations fail
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === "chats") {
      fetchConversations();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchConversations, fetchUsers]);

  useEffect(() => {
    if (activeTab === "chats") {
      fetchConversations();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchConversations, fetchUsers]);

  useEffect(() => {
    const items = activeTab === "chats" ? conversations : users;
    if (searchTerm.trim()) {
      const filtered = items.filter((item) => {
        // Add null checks to prevent errors
        if (!item) return false;

        const username =
          activeTab === "chats" ? item.user?.username : item.username;
        const email = activeTab === "chats" ? item.user?.email : item.email;

        if (!username) return false;

        return (
          username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (email && email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredItems(filtered);
    } else {
      // Filter out null/undefined items
      const validItems = items.filter((item) => {
        if (!item) return false;
        if (activeTab === "chats") {
          return item.user && item.user._id && item.user.username;
        } else {
          return item._id && item.username;
        }
      });
      setFilteredItems(validItems);
    }
  }, [searchTerm, conversations, users, activeTab]);

  const handleUserSelect = (userData) => {
    const userToSelect = activeTab === "chats" ? userData.user : userData;
    onSelectUser(userToSelect);
  };

  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

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
      <div className="bg-wa-panel-header border-b border-wa-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center hover:bg-wa-input-panel rounded-lg p-2 -m-2 transition-colors focus-ring"
          >
            <Avatar
              src={user?.profilePicture}
              username={user?.username}
              size="md"
              showOnline={true}
              isOnline={true}
            />
          </button>

          <div className="flex items-center space-x-1">
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel hover:text-wa-text rounded-full transition-all duration-200 focus-ring">
              <FaCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel hover:text-wa-text rounded-full transition-all duration-200 focus-ring">
              <FaCommentAlt className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel hover:text-wa-text rounded-full transition-all duration-200 focus-ring">
              <FaEllipsisV className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-wa-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-12 pr-4 py-3 bg-wa-input-panel border border-wa-border rounded-full text-wa-text placeholder-wa-text-secondary focus:outline-none focus:border-wa-primary transition-all duration-200 focus-ring"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-wa-border">
          <button
            onClick={() => setActiveTab("chats")}
            className={clsx(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === "chats"
                ? "text-wa-primary border-b-2 border-wa-primary"
                : "text-wa-text-secondary hover:text-wa-text"
            )}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={clsx(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === "contacts"
                ? "text-wa-primary border-b-2 border-wa-primary"
                : "text-wa-text-secondary hover:text-wa-text"
            )}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-wa-bg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-wa-text-secondary">Loading {activeTab}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-wa-text-secondary">
              {searchTerm ? "No results found" : `No ${activeTab} available`}
            </div>
            {!searchTerm && activeTab === "chats" && (
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab("contacts")}
                  className="text-wa-primary hover:underline"
                >
                  Find people to chat with
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => {
              // Add null checks to prevent errors
              if (!item) return null;

              const userData = activeTab === "chats" ? item.user : item;

              // Skip if userData is invalid
              if (!userData || !userData._id || !userData.username) return null;

              const lastMessage =
                activeTab === "chats" ? item.lastMessage : null;
              const isSelected =
                selectedUser && selectedUser._id === userData._id;
              const isOnline = isUserOnline(onlineUsers, userData._id);

              return (
                <div
                  key={userData._id}
                  onClick={() => handleUserSelect(item)}
                  className={clsx(
                    "p-3 cursor-pointer border-b border-wa-border hover:bg-wa-input-panel transition-colors",
                    isSelected &&
                      "bg-wa-input-panel border-r-4 border-r-wa-primary"
                  )}
                >
                  <div className="flex items-center">
                    <Avatar
                      src={userData.profilePicture}
                      username={userData.username}
                      size="lg"
                      showOnline={true}
                      isOnline={isOnline}
                      className="flex-shrink-0"
                    />

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-wa-text truncate">
                          {userData.username}
                        </h4>
                        {lastMessage && (
                          <span className="text-xs text-wa-text-secondary flex-shrink-0">
                            {formatLastSeen(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-wa-text-secondary truncate">
                        {lastMessage
                          ? truncateText(lastMessage.content, 35)
                          : isOnline
                          ? "Online"
                          : formatLastSeen(userData.lastSeen)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
