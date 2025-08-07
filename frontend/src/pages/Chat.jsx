import React, { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const { onUsersOnline, removeListener } = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    // Check if mobile screen
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Listen for online users updates
    if (onUsersOnline) {
      onUsersOnline((users) => {
        setOnlineUsers(users)
      })
    }

    return () => {
      if (removeListener) {
        removeListener('users-online')
      }
    }
  }, [onUsersOnline, removeListener])

  const handleSelectUser = (user) => {
    setSelectedUser(user)
  }

  const handleBackToSidebar = () => {
    setSelectedUser(null)
  }

  return (
    <div className="h-screen bg-wa-bg flex overflow-hidden">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="w-full h-full flex flex-col mobile-full-height">
          {!selectedUser ? (
            <div className="flex-1 animate-slide-up">
              <Sidebar
                onSelectUser={handleSelectUser}
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                onBackToSidebar={handleBackToSidebar}
              />
            </div>
          ) : (
            <div className="flex-1 animate-slide-up">
              <ChatArea
                selectedUser={selectedUser}
                onlineUsers={onlineUsers}
                onBackToSidebar={handleBackToSidebar}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Exact WhatsApp Web Style */
        <div className="flex w-full h-full bg-wa-panel-header overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-96 min-w-[24rem] max-w-[30rem] border-r border-wa-border flex-shrink-0 bg-wa-panel animate-fade-in">
            <Sidebar
              onSelectUser={handleSelectUser}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
            />
          </div>
          
          {/* Right Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-wa-bg animate-fade-in">
            <ChatArea
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              isMobile={isMobile}
            />
          </div>
        </div>
      )}
      
      {/* Connection Status */}
      {user && !onlineUsers.includes(user._id) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-wa-lg text-sm animate-bounce-gentle z-50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Connecting to WhatsApp...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
