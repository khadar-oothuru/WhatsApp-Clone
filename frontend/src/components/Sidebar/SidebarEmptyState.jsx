// SidebarEmptyState.jsx
import React from "react";
import PropTypes from "prop-types";

const SidebarEmptyState = ({
  searchTerm,
  archived,
  starred,
  activeFilter,
  conversationsError,
  usersError,
}) => (
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
    {(conversationsError || usersError) && (
      <div className="text-red-500 text-sm mb-4">
        {conversationsError && (
          <div>Failed to load conversations: {conversationsError.message}</div>
        )}
        {usersError && <div>Failed to load users: {usersError.message}</div>}
      </div>
    )}
  </div>
);

SidebarEmptyState.propTypes = {
  searchTerm: PropTypes.string,
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  activeFilter: PropTypes.string,
  conversationsError: PropTypes.object,
  usersError: PropTypes.object,
};

export default SidebarEmptyState;
