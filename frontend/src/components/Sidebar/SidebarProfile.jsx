// SidebarProfile.jsx
import React from "react";
import PropTypes from "prop-types";
import { FaArrowLeft } from "react-icons/fa";
import Avatar from "../Avatar";

const SidebarProfile = ({ user, setShowProfile, handleLogout }) => (
  <div className="w-full md:w-80 bg-wa-bg flex flex-col h-full">
    {/* Profile Header */}
    <div className="bg-wa-panel-header p-4 text-wa-text flex items-center border-b border-wa-border">
      <button
        onClick={() => setShowProfile(false)}
        className="mr-4 p-2 hover:bg-wa-active rounded-full transition-colors"
      >
        <FaArrowLeft />
      </button>
      <h2 className="text-lg font-normal">Profile</h2>
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
        <h3 className="text-xl font-normal text-wa-text mb-2">
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

SidebarProfile.propTypes = {
  user: PropTypes.object,
  setShowProfile: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default SidebarProfile;
