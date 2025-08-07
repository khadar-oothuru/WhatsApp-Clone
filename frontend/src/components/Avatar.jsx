import React from 'react'
import { FaUser } from 'react-icons/fa'
import { getAvatarColor } from '../utils/helpers'
import clsx from 'clsx'

const Avatar = ({ 
  src, 
  alt, 
  username, 
  size = 'md', 
  showOnline = false, 
  isOnline = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }

  const iconSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }

  const onlineIndicatorSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  }

  return (
    <div className={clsx('relative', className)}>
      <div className={clsx(
        'rounded-full flex items-center justify-center overflow-hidden',
        sizeClasses[size]
      )}>
        {src ? (
          <img
            src={src}
            alt={alt || username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: getAvatarColor(username) }}
          >
            {username ? (
              username.charAt(0).toUpperCase()
            ) : (
              <FaUser className={iconSizeClasses[size]} />
            )}
          </div>
        )}
      </div>
      
      {showOnline && (
        <div
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-wa-panel',
            onlineIndicatorSizes[size],
            isOnline ? 'bg-wa-online' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  )
}

export default Avatar
