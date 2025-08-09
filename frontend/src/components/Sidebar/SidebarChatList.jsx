// SidebarChatList.jsx
import React from "react";
import PropTypes from "prop-types";
import Avatar from "../Avatar";
import { FaThumbtack } from "react-icons/fa";
import { formatLastSeen, truncateText } from "../../utils/helpers";

const SidebarChatList = ({ filteredItems, selectedUser, handleUserSelect }) => (
  <div className="bg-wa-bg">
    {filteredItems.map((chat) => {
      const isSelected = selectedUser && selectedUser._id === chat.user._id;
      const timeStr = formatLastSeen(chat.lastMessage?.createdAt || new Date());

      return (
        <button
          key={chat.id}
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

            <div className="flex items-center">
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
          </div>
        </button>
      );
    })}
  </div>
);

SidebarChatList.propTypes = {
  filteredItems: PropTypes.array.isRequired,
  selectedUser: PropTypes.object,
  handleUserSelect: PropTypes.func.isRequired,
};

export default SidebarChatList;
