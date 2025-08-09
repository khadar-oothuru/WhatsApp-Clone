import React from "react";
import PropTypes from "prop-types";
import { FaWhatsapp } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";

const WhatsAppLoadingScreen = ({ percent = 0 }) => (
  <div className="h-screen w-screen bg-[#1e1e1e] flex flex-col items-center justify-center relative">
    <div className="flex flex-col items-center justify-center">
      {/* WhatsApp Icon */}
      <FaWhatsapp
        size={80}
        color="#25D366"
        className="mb-8 bg-[#222] rounded-full p-4"
      />
      <div className="text-white text-2xl mb-6 font-light">
        Loading your chats [{percent}%]
      </div>
      <div className="w-80 max-w-xs h-2 bg-[#333] rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-[#25D366] transition-all duration-300"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="flex items-center text-[#b1b1b1] text-lg mt-2">
        <HiLockClosed className="h-5 w-5 mr-2"  />
        End-to-end encrypted
      </div>
    </div>
  </div>
);

WhatsAppLoadingScreen.propTypes = {
  percent: PropTypes.number,
};

export default WhatsAppLoadingScreen;
