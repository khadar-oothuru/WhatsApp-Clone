import React from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaLock, FaLaptop, FaMobileAlt } from 'react-icons/fa';

const EmptyChatState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col bg-wa-bg h-full"
    >
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
          className="text-center max-w-md w-full"
        >
          {/* Main Icon */}
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="w-72 h-72 mx-auto mb-8 relative"
          >
            {/* WhatsApp Web Welcome Illustration */}
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <path
                  fill="currentColor"
                  className="text-wa-text-secondary"
                  d="M229.565 160.229c0 5.983-4.853 10.835-10.835 10.835H84.27c-5.982 0-10.835-4.852-10.835-10.835V11.77c0-5.983 4.853-10.835 10.835-10.835h134.46c5.982 0 10.835 4.852 10.835 10.835v148.459z"
                />
              </motion.g>
              
              {/* Chat bubbles animation */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <rect
                  x="110"
                  y="50"
                  width="120"
                  height="20"
                  rx="10"
                  fill="currentColor"
                  className="text-wa-primary opacity-20"
                />
                <rect
                  x="80"
                  y="85"
                  width="90"
                  height="20"
                  rx="10"
                  fill="currentColor"
                  className="text-wa-text-secondary opacity-10"
                />
                <rect
                  x="130"
                  y="120"
                  width="100"
                  height="20"
                  rx="10"
                  fill="currentColor"
                  className="text-wa-primary opacity-20"
                />
              </motion.g>

              {/* Lock icon for encryption */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3, type: "spring" }}
              >
                <circle
                  cx="151"
                  cy="145"
                  r="20"
                  fill="currentColor"
                  className="text-wa-text-secondary opacity-20"
                />
                <path
                  d="M151 138v-3a5 5 0 0 0-10 0v3m10 0h-10a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-wa-text-secondary opacity-40"
                />
              </motion.g>
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-3xl font-light mb-4 text-wa-text"
          >
            WhatsApp Clone Web
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-wa-text-secondary mb-6 text-base leading-relaxed"
          >
            Send and receive messages without keeping your phone online.
          </motion.p>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center justify-center space-x-3" style={{ color: 'var(--wa-text-secondary)' }}>
              <FaLock className="w-4 h-4" style={{ opacity: 0.6 }} />
              <span className="text-sm">End-to-end encrypted</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3" style={{ color: 'var(--wa-text-secondary)' }}>
              <div className="flex items-center space-x-2">
                <FaLaptop className="w-4 h-4" style={{ opacity: 0.6 }} />
                <span className="text-sm">Available on multiple devices</span>
                <FaMobileAlt className="w-4 h-4" style={{ opacity: 0.6 }} />
              </div>
            </div>
          </motion.div>

          {/* Bottom text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-wa-text-secondary text-xs opacity-70"
          >
            Use WhatsApp Clone on up to 4 linked devices and 1 phone at the same time.
          </motion.p>

          {/* Animated dots indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex justify-center mt-8 space-x-2"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--wa-primary)' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Call to action hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-12"
          >
            <div 
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--wa-panel)',
                border: '1px solid var(--wa-border)',
                boxShadow: 'var(--shadow-wa)'
              }}
            >
              <FaComments className="w-4 h-4" style={{ color: 'var(--wa-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--wa-text-secondary)' }}>
                Select a chat to start messaging
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom border decoration */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="h-1 bg-gradient-to-r from-transparent via-wa-primary to-transparent opacity-20"
      />
    </motion.div>
  );
};

export default EmptyChatState;
