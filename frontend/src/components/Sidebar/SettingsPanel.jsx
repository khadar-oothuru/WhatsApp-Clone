import React from "react";

const settingsMenu = [
  {
    id: "account",
    label: "Account",
    description: "Security notifications, account info",
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Blocked contacts, disappearing messages",
  },
  {
    id: "chats",
    label: "Chats",
    description: "Theme, wallpaper, chat settings",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Message notifications",
  },
  { id: "keyboard", label: "Keyboard shortcuts", description: "Quick actions" },
  {
    id: "help",
    label: "Help",
    description: "Help center, contact us, privacy policy",
  },
];

const SettingsPanel = ({ selected, onSelect, onLogout }) => (
  <div style={{ display: "flex", height: "100%" }}>
    <div
      style={{
        width: 320,
        background: "#181a1b",
        color: "#fff",
        padding: 24,
        borderRight: "1px solid #222",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 8 }}>
          Khadar_oothuru
        </div>
        <div style={{ color: "#aaa" }}>Hey there! I am using WhatsApp.</div>
      </div>
      <div>
        {settingsMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              background: selected === item.id ? "#23272a" : "transparent",
              borderRadius: 12,
              padding: "16px 12px",
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 500 }}>{item.label}</div>
            <div style={{ color: "#aaa", fontSize: 14 }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 24,
          color: "#f44",
          cursor: "pointer",
        }}
        onClick={onLogout}
      >
        Log out
      </div>
    </div>
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          <span role="img" aria-label="settings">
            ⚙️
          </span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 500 }}>Settings</div>
      </div>
    </div>
  </div>
);

export default SettingsPanel;
