// SidebarHeader.jsx
import React from "react";
import { HiMenu } from "react-icons/hi";
import PropTypes from "prop-types";

const SidebarHeader = ({ archived, starred, onMobileMenuClick }) => (
  <div className="bg-wa-panel-header border-b border-wa-border">
    <div className="px-4 py-4 flex items-center justify-between">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuClick}
        className="md:hidden p-2 text-wa-text-secondary hover:text-wa-text hover:bg-wa-active rounded-lg transition-colors"
      >
        <HiMenu className="w-5 h-5" />
      </button>

      <h1 className="text-xl font-medium text-wa-text">
        {archived ? "Archived" : starred ? "Starred" : "WhatsApp"}
      </h1>

      {/* Spacer for mobile to center title */}
      <div className="md:hidden w-9"></div>
    </div>
  </div>
);

SidebarHeader.propTypes = {
  archived: PropTypes.bool,
  starred: PropTypes.bool,
  onMobileMenuClick: PropTypes.func,
};

export default SidebarHeader;
