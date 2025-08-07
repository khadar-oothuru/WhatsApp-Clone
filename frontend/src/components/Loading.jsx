import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import clsx from 'clsx'

const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      {/* WhatsApp Logo with pulse animation */}
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-wa-primary rounded-full flex items-center justify-center animate-pulse">
          <FaWhatsapp className="w-8 h-8 text-white" />
        </div>
        
        {/* Loading rings */}
        <div className="absolute inset-0 w-16 h-16 border-2 border-wa-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-1 w-14 h-14 border-2 border-wa-primary-dark border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <h3 className="text-wa-text font-medium mb-2">
          {message}
        </h3>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-wa-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-wa-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-wa-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-wa-bg flex items-center justify-center z-50">
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
