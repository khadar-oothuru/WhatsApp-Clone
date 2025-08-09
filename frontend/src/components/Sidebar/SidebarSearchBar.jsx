// SidebarSearchBar.jsx
import React from "react";
import PropTypes from "prop-types";
import { HiSearch } from "react-icons/hi";

const SidebarSearchBar = ({ searchTerm, handleSearchChange }) => (
  <div className="px-3 py-2 bg-wa-bg">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <HiSearch className="h-4 w-4 text-wa-text-secondary" />
      </div>
      <input
        type="text"
        placeholder="Search or start a new chat"
        value={searchTerm}
        className="w-full pl-9 pr-4 py-2 bg-wa-input text-wa-text placeholder-wa-text-secondary rounded-lg border-none focus:outline-none focus:ring-1 focus:ring-wa-primary transition-all duration-200 text-sm"
        onChange={(e) => handleSearchChange(e.target.value)}
      />
    </div>
  </div>
);

SidebarSearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
};

export default SidebarSearchBar;
