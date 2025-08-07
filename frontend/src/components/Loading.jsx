import React, { useEffect, useState } from 'react'
import { FaWhatsapp, FaLock } from 'react-icons/fa'
import { motion } from 'framer-motion'

const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setIsVisible(true)
  }, [])

  const content = (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* WhatsApp Logo */}
      <motion.div 
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <FaWhatsapp className="w-20 h-20" style={{ color: 'var(--wa-primary)' }} />
      </motion.div>
      
      {/* WhatsApp Text */}
      <motion.h1 
        className="text-xl font-light mb-10"
        style={{ color: 'var(--wa-text)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        WhatsApp
      </motion.h1>
      
      {/* Progress Bar Container */}
      <motion.div 
        className="w-64 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--wa-border)' }}>
          {/* Indeterminate Progress Bar Animation */}
          <div className="h-full relative">
            <motion.div 
              className="absolute h-full rounded-full"
              style={{ background: 'var(--wa-primary)' }}
              initial={{ width: '0%', left: '0%' }}
              animate={{
                width: ['0%', '100%', '0%'],
                left: ['0%', '0%', '100%']
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* End-to-end encrypted text with lock icon */}
      <motion.div 
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--wa-text-secondary)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <FaLock className="w-3 h-3" style={{ opacity: 0.7 }} />
        <span>End-to-end encrypted</span>
      </motion.div>
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in-scale"
        style={{ backgroundColor: 'var(--wa-bg)' }}
      >
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  )
}

export default Loading
