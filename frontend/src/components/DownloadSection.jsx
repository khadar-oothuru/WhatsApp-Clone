import { useState } from 'react'
import { WhatsAppIcon } from './WhatsAppLogo'

const DownloadSection = ({ showVideoCallGrid = false }) => {
  const [activeScreenshot, setActiveScreenshot] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Mock user data for video call grid
  const mockCallUsers = [
    { id: 1, name: 'Emma Johnson', color: '#FF6B6B' },
    { id: 2, name: 'Michael Chen', color: '#4ECDC4' },
    { id: 3, name: 'Sarah Williams', color: '#45B7D1' },
    { id: 4, name: 'David Kumar', color: '#96CEB4' },
    { id: 5, name: 'WhatsApp', color: 'transparent' }, // Center will have logo
    { id: 6, name: 'James Taylor', color: '#DDA0DD' },
    { id: 7, name: 'Maria Garcia', color: '#98D8C8' },
    { id: 8, name: 'Robert Brown', color: '#F7DC6F' },
    { id: 9, name: 'Jennifer Davis', color: '#F8B500' }
  ]

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'End-to-end encryption',
      description: 'Your messages are secured from end to end. No one can read them except you and the recipient.'
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Group conversations',
      description: 'Keep in touch with friends and family. Create groups up to 512 people.'
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: 'Device syncing',
      description: 'Use WhatsApp on up to 4 linked devices and 1 phone at the same time.'
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: 'Voice and video calls',
      description: 'Make free voice and video calls with up to 32 people at once.'
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: 'Fast and reliable',
      description: 'Send messages quickly around the world with reliable delivery.'
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
      title: 'Express yourself',
      description: 'Share photos, videos, documents, and send stickers and GIFs.'
    }
  ]

  const screenshots = [
    {
      id: 0,
      title: 'Chat Interface',
      description: 'Clean and intuitive messaging interface',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 1,
      title: 'Voice & Video Calls',
      description: 'Crystal clear voice and video calling',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      title: 'Group Chats',
      description: 'Stay connected with groups',
      gradient: 'from-purple-400 to-purple-600'
    }
  ]

  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    window.open('https://www.microsoft.com/store/productId/9NKSQGP7F2NH', '_blank')
  }

  // Video Call Grid Hero Section
  if (showVideoCallGrid) {
    return (
      <section className="light-theme py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3x3 Grid with WhatsApp Logo Overlay */}
          <div className="relative mb-12 mx-auto" style={{ maxWidth: '500px' }}>
            {/* Avatar Grid */}
            <div className="grid grid-cols-3 gap-3 p-6 bg-white rounded-3xl shadow-2xl">
              {mockCallUsers.map((user) => (
                <div
                  key={user.id}
                  className="relative group transform transition-all duration-300 hover:scale-110 hover:z-10"
                >
                  {user.id === 5 ? (
                    // Center cell with WhatsApp logo
                    <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <WhatsAppIcon size={48} color="#25d366" />
                    </div>
                  ) : (
                    // User avatar cells
                    <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {/* Active call indicator for some users */}
                      {[2, 4, 6, 8].includes(user.id) && (
                        <div className="absolute top-2 right-2">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-300 rounded-full opacity-20 blur-3xl"></div>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold light-theme-text mb-6">
              Download WhatsApp for Windows
            </h1>
            <p className="text-xl light-theme-text-secondary mb-10 leading-relaxed">
              Make calls, share your screen and get a faster experience when you download the Windows app.
            </p>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: isHovered ? 'var(--wa-primary-dark)' : 'var(--wa-primary)',
                boxShadow: isHovered ? 'var(--shadow-wa-hover)' : 'var(--shadow-wa-lg)',
                transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
              }}
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

            {/* Platform links */}
            <div className="mt-6">
              <span className="text-light-text-secondary">
                Also available on{' '}
                <a href="#" className="text-green-600 hover:text-green-700 hover:underline font-medium">Mac</a>,{' '}
                <a href="#" className="text-green-600 hover:text-green-700 hover:underline font-medium">Android</a>, and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 hover:underline font-medium">iPhone</a>
              </span>
            </div>

            {/* End-to-end encryption message */}
            <div className="mt-12 pt-8 border-t border-light-border">
              <div className="flex items-center justify-center gap-3">
                <svg 
                  className="w-5 h-5 text-light-text-tertiary" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-light-text-secondary">
                  Your personal messages are end-to-end encrypted
                </span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="light-theme-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="font-semibold light-theme-text mb-2">HD Voice & Video Calls</h3>
              <p className="text-sm light-theme-text-secondary">Crystal clear calls with up to 32 people</p>
            </div>

            <div className="light-theme-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="font-semibold light-theme-text mb-2">Screen Sharing</h3>
              <p className="text-sm light-theme-text-secondary">Share your screen during calls</p>
            </div>

            <div className="light-theme-card p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="font-semibold light-theme-text mb-2">Faster Experience</h3>
              <p className="text-sm light-theme-text-secondary">Optimized for desktop performance</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default Section (original layout)
  return (
    <section className="light-theme py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl lg:text-5xl font-bold light-theme-text mb-4">
            Download WhatsApp for Windows
          </h2>
          <p className="text-lg lg:text-xl light-theme-text-secondary max-w-3xl mx-auto">
            Make free voice and video calls, send messages, and share moments with the important people in your life.
          </p>
        </div>

        {/* Download Section with Screenshots */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left side - Download and info */}
          <div className="space-y-8 animate-slide-up">
            <div className="light-theme-card p-8">
              <h3 className="text-2xl font-semibold light-theme-text mb-4">
                Get the Windows app
              </h3>
              <p className="light-theme-text-secondary mb-6">
                Download WhatsApp Desktop to make calls, share screens, and get faster typing experience.
              </p>
              
              {/* System Requirements */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold light-theme-text mb-2">System Requirements</h4>
                <ul className="space-y-1 text-sm light-theme-text-secondary">
                  <li>• Windows 10 version 18362.0 or higher</li>
                  <li>• Architecture: x64, x86</li>
                  <li>• Memory: 1 GB RAM minimum</li>
                  <li>• Active internet connection required</li>
                </ul>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full py-4 px-8 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--wa-primary)',
                  color: 'white',
                  boxShadow: 'var(--shadow-wa)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--wa-primary-dark)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-wa-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--wa-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-wa)';
                }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download for Windows
              </button>

              {/* Alternative Options */}
              <div className="mt-6 pt-6 border-t light-theme-border">
                <p className="text-sm light-theme-text-secondary text-center">
                  Also available for{' '}
                  <a href="#" className="light-theme-link font-medium">Mac</a>,{' '}
                  <a href="#" className="light-theme-link font-medium">Android</a>, and{' '}
                  <a href="#" className="light-theme-link font-medium">iPhone</a>
                </p>
              </div>
            </div>

            {/* QR Code Option */}
            <div className="light-theme-card p-6 flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm7-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold light-theme-text">Or scan the QR code</p>
                <p className="text-sm light-theme-text-secondary">
                  Use WhatsApp Web to scan and link your device
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Screenshots carousel */}
          <div className="relative animate-fade-in">
            {/* Screenshot Display */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden light-theme-shadow-strong">
              {screenshots.map((screenshot, index) => (
                <div
                  key={screenshot.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeScreenshot === index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${screenshot.gradient} flex items-center justify-center`}>
                    <div className="text-white text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                        <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor" opacity="0.9">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.461 3.488"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{screenshot.title}</h3>
                      <p className="text-white/90">{screenshot.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Screenshot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreenshot(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeScreenshot === index
                      ? 'w-8 bg-green-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View screenshot ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h3 className="text-2xl lg:text-3xl font-bold light-theme-text text-center mb-12">
            Why choose WhatsApp Desktop?
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="light-theme-card p-6 hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold light-theme-text mb-2">
                  {feature.title}
                </h4>
                <p className="light-theme-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 px-8 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
          <h3 className="text-2xl font-bold light-theme-text mb-4">
            Ready to get started?
          </h3>
          <p className="light-theme-text-secondary mb-8 max-w-2xl mx-auto">
            Join over 2 billion people who use WhatsApp to stay connected with friends and family, anytime and anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="py-3 px-8 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                backgroundColor: 'var(--wa-primary)',
                color: 'white',
                boxShadow: 'var(--shadow-wa)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--wa-primary-dark)';
                e.currentTarget.style.boxShadow = 'var(--shadow-wa-lg)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--wa-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-wa)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Now
            </button>
            <button className="light-theme-button-secondary py-3 px-8 rounded-lg font-semibold">
              Use WhatsApp Web
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t light-theme-border">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span className="light-theme-text-secondary text-sm">Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span className="light-theme-text-secondary text-sm">End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="light-theme-text-secondary text-sm">No ads</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
              </svg>
              <span className="light-theme-text-secondary text-sm">Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DownloadSection
