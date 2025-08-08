import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";
import PrivateRoute from "../components/PrivateRoute";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

// Enhanced routing configuration with all WhatsApp-like features
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private routes */}
      <Route
        path="/chat/*"
        element={
          <PrivateRoute>
            <ChatRoutes />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route
        path="/settings/*"
        element={
          <PrivateRoute>
            <SettingsRoutes />
          </PrivateRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/chat" replace />} />

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Chat-related sub-routes
const ChatRoutes = () => {
  return (
    <Routes>
      {/* Main chat interface */}
      <Route index element={<Chat />} />

      {/* Individual chat conversation */}
      <Route path=":userId" element={<Chat />} />

      {/* Group chat */}
      <Route path="group/:groupId" element={<Chat />} />

      {/* Archived chats */}
      <Route path="archived" element={<Chat archived={true} />} />

      {/* Starred messages */}
      <Route path="starred" element={<Chat starred={true} />} />

      {/* Search results */}
      <Route path="search" element={<Chat search={true} />} />

      {/* Status/Stories */}
      <Route path="status" element={<StatusPage />} />

      {/* Calls */}
      <Route path="calls" element={<CallsPage />} />
    </Routes>
  );
};

// Settings sub-routes
const SettingsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Settings />} />
      <Route path="account" element={<AccountSettings />} />
      <Route path="privacy" element={<PrivacySettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route path="notifications" element={<NotificationSettings />} />
      <Route path="storage" element={<StorageSettings />} />
      <Route path="help" element={<HelpSettings />} />
      <Route path="about" element={<AboutSettings />} />
    </Routes>
  );
};

// Status/Stories page component
const StatusPage = () => {
  return (
    <div className="flex h-screen bg-wa-bg">
      <div className="w-full max-w-md mx-auto bg-wa-panel">
        <div className="p-4 bg-wa-panel-header border-b border-wa-border">
          <h1 className="text-xl font-semibold text-wa-text">Status</h1>
        </div>
        <div className="p-4">
          <div className="text-center text-wa-text-secondary">
            <p>Status updates from your contacts will appear here.</p>
            <p className="text-sm mt-2">Tap to view status updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calls page component
const CallsPage = () => {
  return (
    <div className="flex h-screen bg-wa-bg">
      <div className="w-full max-w-md mx-auto bg-wa-panel">
        <div className="p-4 bg-wa-panel-header border-b border-wa-border">
          <h1 className="text-xl font-semibold text-wa-text">Calls</h1>
        </div>
        <div className="p-4">
          <div className="text-center text-wa-text-secondary">
            <p>Your recent calls will appear here.</p>
            <p className="text-sm mt-2">Tap on contacts to make a call</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings page components
const AccountSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Account Settings
      </h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Privacy</h3>
          <p className="text-sm text-wa-text-secondary">
            Control your privacy settings
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Security</h3>
          <p className="text-sm text-wa-text-secondary">
            Two-step verification, change number
          </p>
        </div>
      </div>
    </div>
  );
};

const PrivacySettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Privacy Settings
      </h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Last Seen</h3>
          <p className="text-sm text-wa-text-secondary">
            Who can see when you were last online
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Profile Photo</h3>
          <p className="text-sm text-wa-text-secondary">
            Who can see your profile photo
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">About</h3>
          <p className="text-sm text-wa-text-secondary">
            Who can see your about info
          </p>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Security Settings
      </h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Two-Step Verification</h3>
          <p className="text-sm text-wa-text-secondary">
            Add an extra layer of security
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Change Password</h3>
          <p className="text-sm text-wa-text-secondary">
            Update your account password
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Notification Settings
      </h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Message Notifications</h3>
          <p className="text-sm text-wa-text-secondary">
            Sound, vibration, light
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Group Notifications</h3>
          <p className="text-sm text-wa-text-secondary">
            Sound, vibration, light
          </p>
        </div>
      </div>
    </div>
  );
};

const StorageSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Storage and Data
      </h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Storage Usage</h3>
          <p className="text-sm text-wa-text-secondary">
            Manage your storage usage
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Media Auto-Download</h3>
          <p className="text-sm text-wa-text-secondary">
            Voice messages, photos, videos, documents
          </p>
        </div>
      </div>
    </div>
  );
};

const HelpSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Help</h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">FAQ</h3>
          <p className="text-sm text-wa-text-secondary">
            Get answers to frequently asked questions
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Contact Us</h3>
          <p className="text-sm text-wa-text-secondary">
            Get help from our support team
          </p>
        </div>
        <div className="p-3 bg-wa-input-panel rounded-lg">
          <h3 className="font-medium text-wa-text">Terms and Privacy Policy</h3>
          <p className="text-sm text-wa-text-secondary">
            Read our terms of service
          </p>
        </div>
      </div>
    </div>
  );
};

const AboutSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">About</h2>
      <div className="space-y-4">
        <div className="p-3 bg-wa-input-panel rounded-lg text-center">
          <h3 className="font-medium text-wa-text">WhatsApp Clone</h3>
          <p className="text-sm text-wa-text-secondary">Version 1.0.0</p>
          <p className="text-xs text-wa-text-secondary mt-2">
            Built with React, Node.js, and Socket.IO
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppRoutes;
