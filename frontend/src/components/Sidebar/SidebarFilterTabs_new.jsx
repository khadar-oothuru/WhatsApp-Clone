// SidebarFilterTabs.jsx
import React from "react";
import PropTypes from "prop-types";

const SidebarFilterTabs = ({
  archived,
  starred,
  activeFilter,
  handleFilterChange,
}) => {
  if (archived || starred) return null;

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "favourites", label: "Favourites" },
    { id: "groups", label: "Groups" },
  ];

  return (
    <div className="px-3 py-2 bg-wa-bg border-b border-wa-border">
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleFilterChange(id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === id
                ? "bg-wa-primary text-white shadow-sm"
                : "bg-wa-input text-wa-text-secondary hover:bg-wa-active hover:text-wa-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

SidebarFilterTabs.propTypes = {
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  activeFilter: PropTypes.string.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default SidebarFilterTabs;
