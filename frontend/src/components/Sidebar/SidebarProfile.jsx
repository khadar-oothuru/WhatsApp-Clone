// SidebarProfile.jsx
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  FaArrowLeft,
  FaCamera,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Avatar from "../Avatar";
import { userService } from "../../services/userService";

const SidebarProfile = ({
  user,
  setShowProfile,
  handleLogout,
  onUserUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    status: user?.status || "Hey there! I am using WhatsApp",
    profilePicture: user?.profilePicture || "",
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Convert to base64 and compress
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 600;

          let { width, height } = img;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

          // Check compressed size (rough estimate)
          const sizeInBytes = compressedDataUrl.length * 0.75;
          if (sizeInBytes > 2 * 1024 * 1024) {
            // 2MB after compression
            setError(
              "Image is too large even after compression. Please choose a smaller image."
            );
            return;
          }

          setEditData((prev) => ({
            ...prev,
            profilePicture: compressedDataUrl,
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Only send changed fields
      const updateData = {};
      if (editData.username !== user?.username) {
        updateData.username = editData.username;
      }
      if (editData.status !== user?.status) {
        updateData.status = editData.status;
      }
      if (editData.profilePicture !== user?.profilePicture) {
        updateData.profilePicture = editData.profilePicture;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedUser = await userService.updateProfile(updateData);

      // Call parent callback if provided
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: user?.username || "",
      status: user?.status || "Hey there! I am using WhatsApp",
      profilePicture: user?.profilePicture || "",
    });
    setError("");
    setIsEditing(false);
  };

  return (
    <div
      className="main-sidebar-content bg-wa-bg flex flex-col h-full"
      style={{ minWidth: 0 }}
    >
      {/* Profile Header */}
      <div className="bg-wa-panel-header p-4 text-wa-text flex items-center justify-between border-b border-wa-border">
        <div className="flex items-center">
          <button
            onClick={() => setShowProfile(false)}
            className="mr-4 p-2 hover:bg-wa-active rounded-full transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-lg font-normal">Profile</h2>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 group hover:bg-wa-primary/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-wa-primary"
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <FaEdit className="w-5 h-5 text-wa-text-secondary group-hover:text-wa-primary transition-colors" />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="p-2 group rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 hover:bg-green-100 border border-green-200"
              title="Save Changes"
              aria-label="Save Changes"
            >
              <FaCheck className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="p-2 group rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50 hover:bg-red-100 border border-red-200"
              title="Cancel"
              aria-label="Cancel"
            >
              <FaTimes className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="flex-1 bg-wa-bg p-6 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          {/* Profile Picture Section */}
          <div className="relative inline-block mb-4">
            <Avatar
              src={editData.profilePicture}
              username={editData.username}
              size="2xl"
              className="mx-auto"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-wa-primary text-white p-2 rounded-full shadow-lg hover:bg-wa-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-wa-primary"
                title="Change Profile Picture"
                aria-label="Change Profile Picture"
              >
                <FaCamera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Username Section */}
          <div className="mb-4">
            <label
              htmlFor="username-input"
              className="block text-xs text-wa-text-secondary mb-1 text-left"
            >
              Name
            </label>
            {isEditing ? (
              <input
                id="username-input"
                type="text"
                value={editData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full p-3 bg-wa-panel border border-wa-border rounded-lg text-wa-text focus:outline-none focus:border-wa-primary"
                placeholder="Enter your name"
                maxLength={50}
              />
            ) : (
              <div className="text-xl font-normal text-wa-text p-3 bg-wa-panel rounded-lg">
                {user?.username}
              </div>
            )}
          </div>

          {/* Email Section (Read-only) */}
          <div className="mb-4">
            <span className="block text-xs text-wa-text-secondary mb-1 text-left">
              Email
            </span>
            <div className="p-3 bg-wa-panel rounded-lg text-wa-text-secondary">
              {user?.email}
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-6">
            <label
              htmlFor="status-input"
              className="block text-xs text-wa-text-secondary mb-1 text-left"
            >
              About
            </label>
            {isEditing ? (
              <textarea
                id="status-input"
                value={editData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-3 bg-wa-panel border border-wa-border rounded-lg text-wa-text focus:outline-none focus:border-wa-primary resize-none"
                placeholder="Enter your status"
                rows={3}
                maxLength={150}
              />
            ) : (
              <div className="text-sm text-wa-text-secondary bg-wa-panel p-3 rounded-lg text-left">
                {user?.status || "Hey there! I am using WhatsApp"}
              </div>
            )}
          </div>

          {/* WhatsApp Connection Status */}
          {user?.whatsapp_connected && (
            <div className="mb-6">
              <span className="block text-xs text-wa-text-secondary mb-1 text-left">
                WhatsApp Status
              </span>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">Connected</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              {user?.phone_number && (
                <div className="mt-2 text-xs text-wa-text-secondary">
                  Phone: {user.phone_number}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

SidebarProfile.propTypes = {
  user: PropTypes.object,
  setShowProfile: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  onUserUpdate: PropTypes.func,
};

export default SidebarProfile;
