import React, { useState } from "react";
import PropTypes from "prop-types";
import SettingsPanel from "./SettingsPanel";

const SidebarSettingsWrapper = ({ user, logout }) => {
  const [selected, setSelected] = useState("account");
  return (
    <SettingsPanel
      selected={selected}
      onSelect={setSelected}
      onLogout={logout}
      user={user}
    />
  );
};

SidebarSettingsWrapper.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
};

export default SidebarSettingsWrapper;
