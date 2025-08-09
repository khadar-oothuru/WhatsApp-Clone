import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import emptyImage from "../assets/empty.png";

const EmptyChatState = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = () => {
    window.open(
      "https://www.microsoft.com/store/productId/9NKSQGP7F2NH",
      "_blank"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center bg-wa-bg h-full"
    >
      <div className="w-full max-w-5xl mx-auto px-8">
        {/* WhatsApp Empty State Image */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
          className="relative mb-10 flex justify-center"
        >
          {/* Using the actual WhatsApp empty state image */}
          <div className="relative">
            <img
              src={emptyImage}
              alt="WhatsApp Download"
              className="w-full max-w-xs md:max-w-sm lg:max-w-md rounded-lg"
              style={{
                filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))",
              }}
            />
          </div>
        </motion.div>

        {/* Download WhatsApp Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl font-light text-wa-text mb-4">
            Download WhatsApp for Windows
          </h1>

          <p className="text-base text-wa-text-secondary mb-8 max-w-2xl mx-auto">
            Make calls, share your screen and get a faster experience when you
            download the Windows app.
          </p>

          {/* Download Button */}
          <motion.button
            onClick={handleDownload}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-full font-medium text-black bg-wa-primary hover:bg-wa-primary-dark transition-all duration-200"
            style={{
              backgroundColor: "#00a884",
              color: "white",
              boxShadow: isHovered
                ? "0 6px 20px rgba(0, 168, 132, 0.4)"
                : "0 2px 10px rgba(0, 168, 132, 0.3)",
            }}
          >
            Download
          </motion.button>

          {/* End-to-end encryption message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-12 flex items-center justify-center gap-2"
          >
            <FaLock className="w-4 h-4 text-wa-text-secondary" />
            <span className="text-sm text-wa-text-secondary">
              Your personal messages are end-to-end encrypted
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmptyChatState;
