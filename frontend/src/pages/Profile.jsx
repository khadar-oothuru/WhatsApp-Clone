import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { useAPI } from "../hooks/useAPI";
import Avatar from "../components/Avatar";
import { FaArrowLeft, FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    status: "",
    email: "",
  });

  // Get current user profile
  const {
    data: currentUser,
    loading,
    error,
    refetch,
  } = useAPI(userService.getCurrentUser, [user]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        status: currentUser.status || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await userService.updateProfile(formData);
      setEditing(false);
      refetch();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        status: currentUser.status || "",
        email: currentUser.email || "",
      });
    }
    setEditing(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await userService.updateProfilePicture(file);
        refetch();
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-wa-bg items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-wa-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-wa-bg items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load profile</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-wa-primary text-white rounded-lg hover:bg-wa-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-wa-bg flex">
      <div className="w-full max-w-2xl mx-auto bg-wa-panel flex flex-col">
        {/* Header */}
        <div className="bg-wa-panel-header p-4 flex items-center justify-between border-b border-wa-border">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 hover:bg-wa-input-panel rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 text-wa-text" />
            </button>
            <h1 className="text-xl font-semibold text-wa-text">Profile</h1>
          </div>
          <div className="flex items-center space-x-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-wa-input-panel rounded-full transition-colors text-green-500"
                >
                  <FaSave className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-wa-input-panel rounded-full transition-colors text-red-500"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="p-2 hover:bg-wa-input-panel rounded-full transition-colors text-wa-primary"
              >
                <FaEdit className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Avatar
                src={currentUser?.profilePicture}
                username={currentUser?.username}
                size="3xl"
                className="mx-auto mb-4"
              />
              <button
                onClick={() =>
                  document.getElementById("profile-image-input").click()
                }
                className="absolute bottom-4 right-0 bg-wa-primary p-2 rounded-full text-white hover:bg-wa-primary-dark transition-colors"
              >
                <FaCamera className="w-4 h-4" />
              </button>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-wa-text mb-2">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-lg text-wa-text focus:outline-none focus:border-wa-primary"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="px-3 py-2 bg-wa-input-panel border border-wa-border rounded-lg text-wa-text">
                  {currentUser?.username || "Not set"}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-wa-text mb-2">
                Email
              </label>
              <div className="px-3 py-2 bg-wa-input-panel border border-wa-border rounded-lg text-wa-text-secondary">
                {currentUser?.email || "Not set"}
                <p className="text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Status/About */}
            <div>
              <label className="block text-sm font-medium text-wa-text mb-2">
                About
              </label>
              {editing ? (
                <textarea
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-lg text-wa-text focus:outline-none focus:border-wa-primary resize-none"
                  placeholder="Add a few words about yourself"
                />
              ) : (
                <div className="px-3 py-2 bg-wa-input-panel border border-wa-border rounded-lg text-wa-text">
                  {currentUser?.status || "Hey there! I am using WhatsApp"}
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="border-t border-wa-border pt-6">
              <h3 className="text-lg font-medium text-wa-text mb-4">
                Account Information
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-wa-text-secondary">Member since</span>
                  <span className="text-wa-text">
                    {new Date(
                      currentUser?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-wa-text-secondary">Last seen</span>
                  <span className="text-wa-text">
                    {currentUser?.isOnline
                      ? "Online"
                      : new Date(
                          currentUser?.lastSeen || Date.now()
                        ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-wa-border pt-6">
              <h3 className="text-lg font-medium text-red-500 mb-4">
                Danger Zone
              </h3>

              <div className="space-y-3">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete your account? This action cannot be undone."
                      )
                    ) {
                      // Handle account deletion
                      userService
                        .deleteAccount()
                        .then(() => {
                          logout();
                        })
                        .catch((error) => {
                          console.error("Failed to delete account:", error);
                        });
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
