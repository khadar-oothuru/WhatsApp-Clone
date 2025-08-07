import React, { useState, useRef, useEffect } from 'react'
import { formatMessageTime } from '../utils/helpers'
import clsx from 'clsx'
import { FaCheck, FaCheckDouble, FaClock, FaReply, FaTrash, FaCopy, FaForward } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const Message = ({ 
  message, 
  isCurrentUser, 
  showAvatar = false, 
  isFirstInGroup = false,
  isLastInGroup = false,
  showTime = true,
  onReply,
  onDelete,
  onCopy,
  onForward,
  isSelected = false,
  onSelect,
  selectionMode = false 
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const contextMenuRef = useRef(null)
  const messageRef = useRef(null)

  // Handle context menu clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleContextMenu = (e) => {
    e.preventDefault()
    setShowContextMenu(true)
  }

  const handleMessageClick = () => {
    if (selectionMode && onSelect) {
      onSelect(message._id)
    }
  }

  const handleLongPress = () => {
    if (onSelect) {
      onSelect(message._id)
    }
  }
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <FaClock className="text-xs text-gray-400" />
      case 'sent':
        return <FaCheck className="text-xs text-gray-400" />
      case 'delivered':
        return <FaCheckDouble className="text-xs text-gray-400" />
      case 'read':
        return <FaCheckDouble className="text-xs text-blue-400" />
      case 'failed':
        return <span className="text-xs text-red-400">!</span>
      default:
        return null
    }
  }

  const getBubblePosition = () => {
    if (isCurrentUser) {
      if (isFirstInGroup && isLastInGroup) return 'rounded-lg'
      if (isFirstInGroup) return 'rounded-lg rounded-br-md'
      if (isLastInGroup) return 'rounded-lg rounded-tr-md'
      return 'rounded-lg rounded-r-md'
    } else {
      if (isFirstInGroup && isLastInGroup) return 'rounded-lg'
      if (isFirstInGroup) return 'rounded-lg rounded-bl-md'
      if (isLastInGroup) return 'rounded-lg rounded-tl-md'
      return 'rounded-lg rounded-l-md'
    }
  }

  return (
    <div className={clsx(
      'group flex mb-1 message-bubble relative',
      isCurrentUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Selection checkbox */}
      {selectionMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            'flex items-center mr-2',
            isCurrentUser ? 'order-2' : 'order-1'
          )}
        >
          <div 
            onClick={handleMessageClick}
            className={clsx(
              'w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200',
              isSelected
                ? 'bg-wa-primary border-wa-primary'
                : 'border-wa-text-secondary hover:border-wa-primary'
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-full h-full flex items-center justify-center"
              >
                <FaCheck className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Message bubble */}
      <motion.div
        ref={messageRef}
        className={clsx(
          'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl',
          'relative px-3 py-2 shadow-message cursor-pointer transition-all duration-200',
          getBubblePosition(),
          isCurrentUser 
            ? 'bg-wa-bubble-outgoing text-white hover:bg-opacity-90' 
            : 'bg-wa-bubble-incoming text-wa-text border border-wa-border hover:bg-opacity-80',
          isSelected && 'ring-2 ring-wa-primary ring-opacity-50',
          selectionMode ? 'order-1' : ''
        )}
        onClick={handleMessageClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setShowQuickActions(true)}
        onMouseLeave={() => setShowQuickActions(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Message content */}
        <div className="text-sm leading-relaxed break-words">
          {message.content}
        </div>

        {/* Message footer with time and status */}
        {showTime && (
          <div className={clsx(
            'flex items-center justify-end mt-1 gap-1',
            isCurrentUser ? 'text-gray-200 opacity-80' : 'text-wa-text-secondary'
          )}>
            <span className="text-xs">
              {formatMessageTime(message.createdAt)}
            </span>
            
            {isCurrentUser && message.status && (
              <div className="flex items-center ml-1">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - appear on hover */}
        <AnimatePresence>
          {showQuickActions && !selectionMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={clsx(
                'absolute top-0 flex space-x-1 bg-wa-panel-header rounded-lg shadow-wa-lg p-1 z-10',
                isCurrentUser ? '-left-20' : '-right-20'
              )}
            >
              {onReply && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onReply(message)
                  }}
                  className="p-2 text-wa-text-secondary hover:text-wa-text hover:bg-wa-input-panel rounded-md transition-colors"
                  title="Reply"
                >
                  <FaReply className="w-4 h-4" />
                </button>
              )}
              {onCopy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopy(message)
                  }}
                  className="p-2 text-wa-text-secondary hover:text-wa-text hover:bg-wa-input-panel rounded-md transition-colors"
                  title="Copy"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              )}
              {onForward && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onForward(message)
                  }}
                  className="p-2 text-wa-text-secondary hover:text-wa-text hover:bg-wa-input-panel rounded-md transition-colors"
                  title="Forward"
                >
                  <FaForward className="w-4 h-4" />
                </button>
              )}
              {onDelete && isCurrentUser && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(message._id)
                  }}
                  className="p-2 text-wa-text-secondary hover:text-red-400 hover:bg-wa-input-panel rounded-md transition-colors"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        <AnimatePresence>
          {showContextMenu && (
            <motion.div
              ref={contextMenuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={clsx(
                'absolute z-20 bg-wa-panel-header rounded-lg shadow-wa-lg border border-wa-border py-2 min-w-[150px]',
                isCurrentUser ? '-left-40' : '-right-40',
                'top-0'
              )}
            >
              {onReply && (
                <button
                  onClick={() => {
                    onReply(message)
                    setShowContextMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaReply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
              {onCopy && (
                <button
                  onClick={() => {
                    onCopy(message)
                    setShowContextMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaCopy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              )}
              {onForward && (
                <button
                  onClick={() => {
                    onForward(message)
                    setShowContextMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                >
                  <FaForward className="w-4 h-4" />
                  <span>Forward</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (onSelect) onSelect(message._id)
                  setShowContextMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-wa-text hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
              >
                <FaCheck className="w-4 h-4" />
                <span>Select</span>
              </button>
              {onDelete && isCurrentUser && (
                <>
                  <hr className="my-1 border-wa-border" />
                  <button
                    onClick={() => {
                      onDelete(message._id)
                      setShowContextMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-wa-input-panel transition-colors flex items-center space-x-3"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Message
