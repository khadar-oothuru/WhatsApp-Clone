import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaLock,
  FaShieldAlt,
  FaBell,
  FaDatabase,
  FaQuestionCircle,
  FaInfoCircle,
  FaChevronRight,
} from "react-icons/fa";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const settingsItems = [
    {
      icon: FaUser,
      title: "Account",
      subtitle: "Privacy, security, change number",
      path: "/settings/account",
      color: "text-blue-500",
    },
    {
      icon: FaLock,
      title: "Privacy",
      subtitle: "Block contacts, disappearing messages",
      path: "/settings/privacy",
      color: "text-green-500",
    },
    {
      icon: FaShieldAlt,
      title: "Security",
      subtitle: "Two-step verification, change password",
      path: "/settings/security",
      color: "text-red-500",
    },
    {
      icon: FaBell,
      title: "Notifications",
      subtitle: "Message, group & call tones",
      path: "/settings/notifications",
      color: "text-yellow-500",
    },
    {
      icon: FaDatabase,
      title: "Storage and Data",
      subtitle: "Network usage, auto-download",
      path: "/settings/storage",
      color: "text-purple-500",
    },
    {
      icon: FaQuestionCircle,
      title: "Help",
      subtitle: "Help center, contact us, privacy policy",
      path: "/settings/help",
      color: "text-indigo-500",
    },
    {
      icon: FaInfoCircle,
      title: "About",
      subtitle: "App info, terms of service",
      path: "/settings/about",
      color: "text-gray-500",
    },
  ];

  const isMainSettings = location.pathname === "/settings";

  return (
    <div className="h-screen bg-wa-bg flex">
      <div className="w-full max-w-2xl mx-auto bg-wa-panel flex flex-col">
        {/* Header */}
        <div className="bg-wa-panel-header p-4 flex items-center border-b border-wa-border">
          <button
            onClick={() =>
              isMainSettings ? navigate("/chat") : navigate("/settings")
            }
            className="mr-4 p-2 hover:bg-wa-input-panel rounded-full transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-wa-text" />
          </button>
          <h1 className="text-xl font-semibold text-wa-text">
            {isMainSettings ? "Settings" : "Settings"}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<MainSettings items={settingsItems} />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="storage" element={<StorageSettings />} />
            <Route path="help" element={<HelpSettings />} />
            <Route path="about" element={<AboutSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const MainSettings = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors group"
          >
            <div className={`p-2 rounded-full bg-gray-100 mr-4 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-wa-text">{item.title}</h3>
              <p className="text-sm text-wa-text-secondary">{item.subtitle}</p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary group-hover:text-wa-text transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

const AccountSettings = () => {
  const accountOptions = [
    { title: "Privacy", subtitle: "Last seen, profile photo, about" },
    { title: "Security", subtitle: "Two-step verification, change number" },
    { title: "Profile", subtitle: "Name, about, profile photo" },
    { title: "Blocked contacts", subtitle: "Manage blocked users" },
    {
      title: "Delete my account",
      subtitle: "Delete your account and data",
      danger: true,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Account</h2>
      <div className="space-y-2">
        {accountOptions.map((option, index) => (
          <button
            key={index}
            className={`w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left ${
              option.danger ? "hover:bg-red-50" : ""
            }`}
          >
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  option.danger ? "text-red-500" : "text-wa-text"
                }`}
              >
                {option.title}
              </h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const PrivacySettings = () => {
  const privacyOptions = [
    {
      title: "Last seen and online",
      subtitle: "Who can see when you were last online",
    },
    { title: "Profile photo", subtitle: "Who can see your profile photo" },
    { title: "About", subtitle: "Who can see your about info" },
    { title: "Status", subtitle: "Who can see your status updates" },
    { title: "Read receipts", subtitle: "Turn off to hide blue ticks" },
    { title: "Groups", subtitle: "Who can add you to groups" },
    {
      title: "Live location",
      subtitle: "Manage who can see your live location",
    },
    { title: "Blocked contacts", subtitle: "Manage blocked contacts" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Privacy</h2>
      <div className="space-y-2">
        {privacyOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left"
          >
            <div className="flex-1">
              <h3 className="font-medium text-wa-text">{option.title}</h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  const securityOptions = [
    {
      title: "Two-step verification",
      subtitle: "Add an extra layer of security",
    },
    { title: "Change password", subtitle: "Update your account password" },
    {
      title: "App lock",
      subtitle: "Use fingerprint or face to unlock WhatsApp",
    },
    {
      title: "Show security notifications",
      subtitle: "Get notified about account activity",
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Security</h2>
      <div className="space-y-2">
        {securityOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left"
          >
            <div className="flex-1">
              <h3 className="font-medium text-wa-text">{option.title}</h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  const notificationOptions = [
    { title: "Message notifications", subtitle: "Sound, vibration, popup" },
    { title: "Group notifications", subtitle: "Sound, vibration, popup" },
    { title: "Call notifications", subtitle: "Ringtone, vibration" },
    { title: "Notification tone", subtitle: "Set custom notification sounds" },
    { title: "Vibrate", subtitle: "Choose vibration pattern" },
    { title: "Light", subtitle: "Blink LED light for notifications" },
    {
      title: "In-app notifications",
      subtitle: "Show notifications while using the app",
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Notifications</h2>
      <div className="space-y-2">
        {notificationOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left"
          >
            <div className="flex-1">
              <h3 className="font-medium text-wa-text">{option.title}</h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const StorageSettings = () => {
  const storageOptions = [
    { title: "Storage usage", subtitle: "See which chats are taking up space" },
    { title: "Network usage", subtitle: "Check data usage statistics" },
    {
      title: "Auto-download media",
      subtitle: "Photos, videos, audio, documents",
    },
    {
      title: "Download over Wi-Fi",
      subtitle: "Only download media when connected to Wi-Fi",
    },
    { title: "Low data usage", subtitle: "Reduce data usage during calls" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">
        Storage and Data
      </h2>
      <div className="space-y-2">
        {storageOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left"
          >
            <div className="flex-1">
              <h3 className="font-medium text-wa-text">{option.title}</h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const HelpSettings = () => {
  const helpOptions = [
    { title: "FAQ", subtitle: "Get answers to frequently asked questions" },
    { title: "Contact us", subtitle: "Get help from our support team" },
    {
      title: "Terms and Privacy Policy",
      subtitle: "Read our terms of service",
    },
    { title: "App info", subtitle: "View app version and information" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">Help</h2>
      <div className="space-y-2">
        {helpOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-center p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-left"
          >
            <div className="flex-1">
              <h3 className="font-medium text-wa-text">{option.title}</h3>
              <p className="text-sm text-wa-text-secondary">
                {option.subtitle}
              </p>
            </div>
            <FaChevronRight className="w-4 h-4 text-wa-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
};

const AboutSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-wa-text mb-4">About</h2>
      <div className="space-y-4">
        <div className="p-4 bg-wa-input-panel rounded-lg text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-wa-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-white">W</span>
            </div>
            <h3 className="font-bold text-wa-text text-xl">WhatsApp Clone</h3>
            <p className="text-sm text-wa-text-secondary">Version 1.0.0</p>
          </div>

          <div className="space-y-2 text-sm text-wa-text-secondary">
            <p>Built with React, Node.js, and Socket.IO</p>
            <p>© 2024 WhatsApp Clone. All rights reserved.</p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full p-3 bg-wa-input-panel rounded-lg text-left hover:bg-wa-input transition-colors">
            <h3 className="font-medium text-wa-text">Privacy Policy</h3>
            <p className="text-sm text-wa-text-secondary">
              Read our privacy policy
            </p>
          </button>

          <button className="w-full p-3 bg-wa-input-panel rounded-lg text-left hover:bg-wa-input transition-colors">
            <h3 className="font-medium text-wa-text">Terms of Service</h3>
            <p className="text-sm text-wa-text-secondary">
              Read our terms of service
            </p>
          </button>

          <button className="w-full p-3 bg-wa-input-panel rounded-lg text-left hover:bg-wa-input transition-colors">
            <h3 className="font-medium text-wa-text">Licenses</h3>
            <p className="text-sm text-wa-text-secondary">
              View open source licenses
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
