import React, { useState } from 'react'
import Avatar from './Avatar'
import { WhatsAppIcon } from './WhatsAppLogo'

const ChatEmptyState = () => {
  const [isHovered, setIsHovered] = useState(false)

  // Mock user data for the 3x3 grid
  const mockUsers = [
    { id: 1, name: 'Emma Johnson', color: '#FF6B6B' },
    { id: 2, name: 'Michael Chen', color: '#4ECDC4' },
    { id: 3, name: 'Sarah Williams', color: '#45B7D1' },
    { id: 4, name: 'David Kumar', color: '#96CEB4' },
    { id: 5, name: 'Lisa Anderson', color: '#FFEAA7' },
    { id: 6, name: 'James Taylor', color: '#DDA0DD' },
    { id: 7, name: 'Maria Garcia', color: '#98D8C8' },
    { id: 8, name: 'Robert Brown', color: '#F7DC6F' },
    { id: 9, name: 'Jennifer Davis', color: '#F8B500' }
  ]

  const handleDownload = () => {
    // Open WhatsApp download page in new tab
    window.open('https://www.microsoft.com/store/productId/9NKSQGP7F2NH', '_blank')
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-wa-pattern min-h-screen">
      <div className="max-w-lg w-full px-8 py-12">
        {/* 3x3 Grid of Avatars with WhatsApp Logo Overlay */}
        <div className="relative mb-8 mx-auto" style={{ width: '320px', height: '320px' }}>
          {/* Avatar Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-wa-panel rounded-2xl">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="relative group transform transition-transform duration-300 hover:scale-110"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-wa-input-panel shadow-lg">
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
                    style={{
                      backgroundColor: user.color,
                      opacity: user.id === 5 ? 0.3 : 1 // Center avatar is more transparent for logo visibility
                    }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                {/* Add a subtle pulse animation to simulate active call */}
                {[2, 4, 6, 8].includes(user.id) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa-online opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-wa-online"></span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp Logo Overlay - Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-full p-4 shadow-2xl">
              <WhatsAppIcon size={64} color="#25d366" />
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-wa-text text-center mb-4">
          Download WhatsApp for Windows
        </h1>

        {/* Descriptive Text */}
        <p className="text-wa-text-secondary text-center text-lg mb-8 leading-relaxed">
          Make calls, share your screen and get a faster experience when you download the Windows app.
        </p>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-white text-lg
            flex items-center justify-center gap-3
            transition-all duration-300 transform
            ${isHovered 
              ? 'bg-wa-primary-light shadow-2xl scale-105' 
              : 'bg-wa-primary shadow-lg hover:shadow-xl'
            }
          `}
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'translate-y-1' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Get WhatsApp for Windows
        </button>

        {/* Alternative download options */}
        <div className="mt-6 text-center">
          <span className="text-wa-text-secondary text-sm">
            Also available on{' '}
            <a href="#" className="text-wa-primary hover:underline">Mac</a>,{' '}
            <a href="#" className="text-wa-primary hover:underline">Android</a>, and{' '}
            <a href="#" className="text-wa-primary hover:underline">iPhone</a>
          </span>
        </div>

        {/* End-to-end encryption message */}
        <div className="mt-12 pt-8 border-t border-wa-border">
          <div className="flex items-center justify-center gap-3 text-wa-text-secondary">
            <svg 
              className="w-5 h-5 text-wa-text-tertiary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-sm">
              Your personal messages are end-to-end encrypted
            </span>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="group cursor-pointer">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:bg-wa-input-panel">
              <svg 
                className="w-8 h-8 text-wa-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-xs text-wa-text-secondary">Voice Calls</span>
            </div>
          </div>
          
          <div className="group cursor-pointer">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:bg-wa-input-panel">
              <svg 
                className="w-8 h-8 text-wa-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span className="text-xs text-wa-text-secondary">Video Calls</span>
            </div>
          </div>
          
          <div className="group cursor-pointer">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 hover:bg-wa-input-panel">
              <svg 
                className="w-8 h-8 text-wa-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-xs text-wa-text-secondary">Fast & Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatEmptyState
