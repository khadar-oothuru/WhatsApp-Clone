// SidebarChatList.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Avatar from "../Avatar";
import {
  FaThumbtack,
  FaEllipsisV,
  FaArchive,
  FaVolumeUp,
  FaVolumeMute,
  FaTrash,
  FaStar,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { formatLastSeen, truncateText } from "../../utils/helpers";
import { messageService } from "../../services/messageService";

const SidebarChatList = ({
  filteredItems,
  selectedUser,
  handleUserSelect,
  onConversationUpdate,
  showContextMenu = true,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (e, chatId) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === chatId ? null : chatId);
  };

  const handleConversationAction = async (action, chat) => {
    try {
      let result;
      switch (action) {
        case "pin":
          result = await messageService.pinConversation(
            chat.user._id,
            !chat.isPinned
          );
          break;
        case "archive":
          result = await messageService.archiveConversation(
            chat.user._id,
            true
          );
          break;
        case "mute":
          result = await messageService.muteConversation(
            chat.user._id,
            !chat.isMuted
          );
          break;
        case "delete":
          if (
            window.confirm("Are you sure you want to delete this conversation?")
          ) {
            // TODO: Add delete conversation API
            console.log("Delete conversation:", chat);
          }
          break;
        case "markRead":
          result = await messageService.markMessagesAsRead(chat.user._id);
          break;
        default:
          return;
      }

      // Notify parent component about the update
      if (onConversationUpdate) {
        onConversationUpdate(chat, action, result);
      }
    } catch (error) {
      console.error(`Error ${action} conversation:`, error);
      // You could add toast notification here
    } finally {
      setActiveMenuId(null);
    }
  };

  const getStatusIcon = (status, isWhatsApp = false) => {
    switch (status) {
      case "sent":
        return (
          <FaCheck
            className={`w-3 h-3 ${
              isWhatsApp ? "text-green-500" : "text-gray-400"
            }`}
          />
        );
      case "delivered":
        return (
          <FaCheckDouble
            className={`w-3 h-3 ${
              isWhatsApp ? "text-green-500" : "text-gray-400"
            }`}
          />
        );
      case "read":
        return (
          <FaCheckDouble
            className={`w-3 h-3 ${
              isWhatsApp ? "text-green-500" : "text-blue-400"
            }`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-wa-bg">
      {filteredItems.map((chat) => {
        const isSelected = selectedUser && selectedUser._id === chat.user._id;
        const timeStr = formatLastSeen(
          chat.lastMessage?.createdAt || new Date()
        );

        return (
          <div key={chat.id} className="relative">
            <button
              onClick={() => handleUserSelect(chat)}
              className={`w-full flex items-center px-4 py-3 hover:bg-wa-hover cursor-pointer transition-colors text-left border-b border-wa-border/30 ${
                isSelected ? "bg-wa-active" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative mr-3 flex-shrink-0">
                <div className="w-12 h-12 bg-wa-text-tertiary rounded-full flex items-center justify-center overflow-hidden">
                  {chat.user.profilePicture ? (
                    <img
                      src={chat.user.profilePicture}
                      alt={chat.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-wa-text font-medium text-lg">
                      {chat.user.username?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-wa-primary rounded-full border-2 border-wa-bg"></div>
                )}
                {chat.isPinned && (
                  <div className="absolute -top-1 -right-1 bg-wa-text-secondary rounded-full p-1">
                    <FaThumbtack className="w-2.5 h-2.5 text-wa-bg" />
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4
                    className={`font-normal truncate text-base ${
                      chat.unreadCount > 0
                        ? "text-wa-text font-medium"
                        : "text-wa-text"
                    }`}
                  >
                    {chat.isGroup
                      ? chat.groupName || "Group Chat"
                      : chat.user.username}
                  </h4>

                  <div className="flex flex-col items-end space-y-1 ml-2">
                    <span
                      className={`text-xs whitespace-nowrap ${
                        chat.unreadCount > 0
                          ? "text-wa-primary"
                          : "text-wa-text-secondary"
                      }`}
                    >
                      {timeStr}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-wa-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        chat.unreadCount > 0
                          ? "text-wa-text-secondary font-normal"
                          : "text-wa-text-secondary"
                      }`}
                    >
                      {chat.isGroup && chat.lastMessage?.senderName && (
                        <span className="font-medium text-wa-text-secondary">
                          {chat.lastMessage.senderName}:{" "}
                        </span>
                      )}
                      {truncateText(
                        chat.lastMessage?.content || "No messages yet",
                        40
                      )}
                    </p>
                  </div>

                  {/* Message Status */}
                  {chat.lastMessage?.status &&
                    chat.lastMessage?.sender?._id === chat.currentUserId && (
                      <div className="ml-2 flex items-center">
                        {getStatusIcon(
                          chat.lastMessage.status,
                          chat.lastMessage.isWhatsApp
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Context Menu Button */}
              {showContextMenu && (
                <button
                  onClick={(e) => handleMenuClick(e, chat.id)}
                  className="ml-2 p-1 rounded-full hover:bg-wa-input-panel transition-colors opacity-0 group-hover:opacity-100"
                >
                  <FaEllipsisV className="w-3 h-3 text-wa-text-secondary" />
                </button>
              )}
            </button>

            {/* Context Menu */}
            {activeMenuId === chat.id && (
              <div
                ref={menuRef}
                className="absolute right-4 top-12 z-50 bg-wa-panel-header rounded-lg shadow-lg border border-wa-border py-2 min-w-[150px]"
              >
                <button
                  onClick={() => handleConversationAction("pin", chat)}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaThumbtack className="w-4 h-4" />
                  <span>{chat.isPinned ? "Unpin" : "Pin"}</span>
                </button>

                <button
                  onClick={() => handleConversationAction("mute", chat)}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  {chat.isMuted ? (
                    <FaVolumeUp className="w-4 h-4" />
                  ) : (
                    <FaVolumeMute className="w-4 h-4" />
                  )}
                  <span>{chat.isMuted ? "Unmute" : "Mute"}</span>
                </button>

                <button
                  onClick={() => handleConversationAction("archive", chat)}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaArchive className="w-4 h-4" />
                  <span>Archive</span>
                </button>

                {chat.unreadCount > 0 && (
                  <button
                    onClick={() => handleConversationAction("markRead", chat)}
                    className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                  >
                    <FaCheckDouble className="w-4 h-4" />
                    <span>Mark as Read</span>
                  </button>
                )}

                <hr className="my-1 border-wa-border" />

                <button
                  onClick={() => handleConversationAction("delete", chat)}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

SidebarChatList.propTypes = {
  filteredItems: PropTypes.array.isRequired,
  selectedUser: PropTypes.object,
  handleUserSelect: PropTypes.func.isRequired,
  onConversationUpdate: PropTypes.func,
  showContextMenu: PropTypes.bool,
};

export default SidebarChatList;
