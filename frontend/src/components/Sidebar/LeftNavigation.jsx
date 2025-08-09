// LeftNavigation.jsx
import React from "react";
import { HiChat, HiStatusOnline, HiCog, HiMenu } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import PropTypes from "prop-types";
import Avatar from "../Avatar";

const LeftNavigation = ({
  activeTab,
  setActiveTab,
  setShowProfile,
  setShowWhatsAppSettings,
  setShowSettingsPanel,
  user,
}) => {
  const navItems = [
    { id: "chats", icon: HiChat, label: "Chats" },
    { id: "status", icon: HiStatusOnline, label: "Status" },
    { id: "menu", icon: HiMenu, label: "Menu" },
    { id: "settings", icon: HiCog, label: "Settings" },
  ];

  return (
    <div className="w-16 bg-wa-panel flex flex-col items-center py-4 border-r border-wa-border h-full left-navigation">
      {/* WhatsApp Logo */}
      <div className="mb-6">
        <div className="p-2 rounded-lg hover:bg-wa-active transition-colors cursor-pointer">
          <FaWhatsapp className="w-8 h-8 text-wa-primary" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-2">
        {navItems.map(({ id, icon: IconComponent, label }) => {
          const Icon = IconComponent;
          return (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "settings") {
                  setShowSettingsPanel(true);
                } else if (id === "menu") {
                  setShowWhatsAppSettings(true);
                }
              }}
              className={`p-3 rounded-lg transition-all duration-200 relative group ${
                activeTab === id
                  ? "bg-wa-primary text-white shadow-md"
                  : "text-wa-text-secondary hover:text-wa-text hover:bg-wa-active"
              }`}
              title={label}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-wa-text text-wa-bg text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity duration-200 shadow-lg">
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Profile at bottom - bigger avatar */}
      <div className="mt-auto mb-2">
        <button
          onClick={() => setShowProfile(true)}
          className="p-1 rounded-full hover:bg-wa-active transition-all duration-200 group relative flex items-center justify-center"
          title="Profile"
        >
          <Avatar
            src={user?.profilePicture}
            alt={user?.username || "User"}
            username={user?.username}
            size="lg"
            className="shadow"
          />
          {/* Tooltip */}
          <div className="absolute left-full ml-3 px-2 py-1 bg-wa-text text-wa-bg text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity duration-200 shadow-lg">
            Profile
          </div>
        </button>
      </div>
    </div>
  );
};

LeftNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  setShowProfile: PropTypes.func.isRequired,
  setShowWhatsAppSettings: PropTypes.func.isRequired,
  setShowSettingsPanel: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default LeftNavigation;
