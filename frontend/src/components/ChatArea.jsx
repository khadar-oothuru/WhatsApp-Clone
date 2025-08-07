import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { messageService } from "../services/messageService";
import {
  FaSearch,
  FaPaperPlane,
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaPaperclip,
  FaMicrophone,
  FaSmile,
  FaArrowLeft,
  FaTimes,
  FaImage,
  FaFile,
  FaCamera,
  FaPlus,
  FaReply,
  FaForward,
  FaTrash,
  FaCopy,
} from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import Avatar from "./Avatar";
import Message from "./Message";
import {
  formatMessageDate,
  formatLastSeen,
  isUserOnline,
  groupMessagesByDate,
  scrollToBottom as utilScrollToBottom,
  debounce,
} from "../utils/helpers";

const ChatArea = ({ selectedUser, onlineUsers, onBackToSidebar, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const { user } = useAuth();
  const {
    sendMessage,
    onReceiveMessage,
    onUserTyping,
    onUserStopTyping,
    startTyping,
    stopTyping,
  } = useSocket();

  // Keyboard shortcuts
  useHotkeys('ctrl+k', (e) => {
    e.preventDefault();
    setShowSearch(!showSearch);
  });

  useHotkeys('escape', () => {
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    setIsSelectionMode(false);
    setSelectedMessages([]);
    setReplyToMessage(null);
    setShowSearch(false);
  });

  // Define fetchMessages first
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const fetchedMessages = await messageService.getMessages(
        selectedUser._id
      );
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedUser]);

  // Define callback handlers
  const handleReceiveMessage = useCallback(
    (messageData) => {
      if (messageData.senderId === selectedUser?._id) {
        const newMessage = {
          _id: Date.now().toString(),
          sender: {
            _id: messageData.senderId,
            username: selectedUser.username,
          },
          recipient: { _id: user._id },
          content: messageData.message,
          createdAt: messageData.timestamp,
          status: "delivered",
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    },
    [selectedUser, user._id]
  );

  const handleUserTyping = useCallback(
    (data) => {
      if (data.userId === selectedUser?._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000); // Auto-clear after 3 seconds
      }
    },
    [selectedUser]
  );

  const handleUserStopTyping = useCallback(
    (data) => {
      if (data.userId === selectedUser?._id) {
        setTyping(false);
      }
    },
    [selectedUser]
  );

  // Effect to fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setMessages([]); // Clear previous messages first
      fetchMessages();
    }
  }, [selectedUser, fetchMessages]);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to set up socket listeners
  useEffect(() => {
    if (selectedUser) {
      const unsubReceive = onReceiveMessage(handleReceiveMessage);
      const unsubTyping = onUserTyping(handleUserTyping);
      const unsubStopTyping = onUserStopTyping(handleUserStopTyping);

      return () => {
        unsubReceive();
        unsubTyping();
        unsubStopTyping();
      };
    }
  }, [
    selectedUser,
    onReceiveMessage,
    onUserTyping,
    onUserStopTyping,
    handleReceiveMessage,
    handleUserTyping,
    handleUserStopTyping,
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Add message to local state immediately
    const tempMessage = {
      _id: Date.now().toString(),
      sender: { _id: user._id, username: user.username },
      recipient: { _id: selectedUser._id },
      content: messageText,
      createdAt: new Date(),
      status: "sending",
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Send via socket for real-time
      sendMessage(selectedUser._id, messageText);

      // Also send via API for persistence
      const savedMessage = await messageService.sendMessage({
        recipientId: selectedUser._id,
        content: messageText,
      });

      // Update the temp message with saved message data
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...savedMessage, status: "sent" }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Update message status to failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  const debouncedStartTyping = debounce(() => {
    if (selectedUser) {
      startTyping(selectedUser._id);
    }
  }, 300);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (selectedUser && e.target.value.trim()) {
      debouncedStartTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1 second of no activity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedUser._id);
      }, 1000);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      utilScrollToBottom(messagesEndRef.current);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Advanced feature handlers
  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      // TODO: Implement file upload functionality
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      // TODO: Call API to delete message
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message.content);
    // TODO: Show toast notification
  };

  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        const newSelection = prev.filter(id => id !== messageId);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        if (!isSelectionMode) {
          setIsSelectionMode(true);
        }
        return [...prev, messageId];
      }
    });
  };

  const deleteSelectedMessages = () => {
    setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg._id)));
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col bg-wa-bg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-wa-text-secondary max-w-md">
            <div className="w-64 h-64 mx-auto mb-8 opacity-20">
              {/* WhatsApp Web Welcome Illustration */}
              <svg viewBox="0 0 303 172" className="w-full h-full">
                <path
                  fill="currentColor"
                  d="M219.04 143.36l-1.83.85c-6.27 2.92-13.14 4.89-20.6 5.55l-20.16 1.8c-11.08.99-22.5.99-33.58 0l-20.16-1.8c-7.46-.66-14.33-2.63-20.6-5.55l-1.83-.85c-17.98-8.37-30.1-26.47-30.1-46.36v-58c0-16.84 8.19-32.47 21.95-42.04L131.5 2.69c6.51-4.79 15.49-4.79 22 0l39.37 28.92C206.63 41.18 214.82 56.81 214.82 73.65v58c0 19.89-12.12 38-30.1 46.36z"
                />
                <circle cx="178" cy="75" r="10" fill="#fff" />
                <circle cx="152" cy="75" r="10" fill="#fff" />
                <circle cx="126" cy="75" r="10" fill="#fff" />
                <path
                  fill="#fff"
                  d="M121 95h62c2.21 0 4 1.79 4 4s-1.79 4-4 4h-62c-2.21 0-4-1.79-4-4s1.79-4 4-4z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-light mb-4 text-wa-text">
              WhatsApp Clone Web
            </h2>
            <p className="text-wa-text-secondary mb-2">
              Send and receive messages without keeping your phone online.
            </p>
            <p className="text-wa-text-secondary text-sm">
              Use WhatsApp Clone on up to 4 linked devices and 1 phone at the
              same time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = isUserOnline(onlineUsers, selectedUser._id);
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-wa-bg">
      {/* Chat Header */}
      <div className="bg-wa-panel border-b border-wa-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile back button */}
            {isMobile && onBackToSidebar && (
              <button
                onClick={onBackToSidebar}
                className="mr-4 p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center cursor-pointer hover:bg-wa-input-panel rounded-lg p-2 -m-2 transition-colors">
              <Avatar
                src={selectedUser.profilePicture}
                username={selectedUser.username}
                size="md"
                showOnline={true}
                isOnline={isOnline}
                className="flex-shrink-0"
              />

              <div className="ml-3">
                <h3 className="font-medium text-wa-text">
                  {selectedUser.username}
                </h3>
                <p className="text-sm text-wa-text-secondary">
                  {typing ? (
                    <span className="text-wa-primary animate-pulse">
                      typing...
                    </span>
                  ) : isOnline ? (
                    "online"
                  ) : (
                    formatLastSeen(selectedUser.lastSeen)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <FaSearch className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <FaPhone className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <FaVideo className="w-5 h-5" />
            </button>
            <button className="p-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-full transition-colors">
              <FaEllipsisV className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-wa-pattern chat-scrollbar chat-bg-pattern"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-wa-text-secondary">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-wa-text-secondary">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm opacity-70">
                Start the conversation with {selectedUser.username}!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-2">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {/* Date separator */}
                <div className="flex justify-center mb-4">
                  <div className="bg-wa-panel px-3 py-1 rounded-md text-xs text-wa-text-secondary shadow-wa">
                    {formatMessageDate(group.date)}
                  </div>
                </div>

                {/* Messages for this date */}
                {group.messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === user._id;
                  const prevMessage =
                    index > 0 ? group.messages[index - 1] : null;
                  const nextMessage =
                    index < group.messages.length - 1
                      ? group.messages[index + 1]
                      : null;

                  const isFirstInGroup =
                    !prevMessage ||
                    prevMessage.sender._id !== message.sender._id;
                  const isLastInGroup =
                    !nextMessage ||
                    nextMessage.sender._id !== message.sender._id;

                  return (
                    <Message
                      key={message._id}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      showTime={true}
                      onReply={handleReplyToMessage}
                      onDelete={handleDeleteMessage}
                      onCopy={handleCopyMessage}
                      onForward={(msg) => console.log('Forward message:', msg)}
                      isSelected={selectedMessages.includes(message._id)}
                      onSelect={toggleMessageSelection}
                      selectionMode={isSelectionMode}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start mb-4">
                <div className="bg-white px-4 py-2 rounded-lg shadow-wa max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Selection Mode Header */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-wa-primary px-4 py-3 flex items-center justify-between border-b border-wa-border"
          >
            <div className="flex items-center text-white">
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedMessages([]);
                }}
                className="mr-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <span className="font-medium">{selectedMessages.length} selected</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={deleteSelectedMessages}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors text-white"
              >
                <FaTrash className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors text-white">
                <FaForward className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors text-white">
                <FaCopy className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-wa-panel border-t border-wa-border px-4 py-2"
          >
            <div className="flex items-center justify-between bg-wa-input-panel rounded-lg p-3">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <FaReply className="w-4 h-4 text-wa-primary mr-2" />
                  <span className="text-sm font-medium text-wa-primary">
                    Replying to {replyToMessage.sender.username}
                  </span>
                </div>
                <p className="text-sm text-wa-text-secondary truncate">
                  {replyToMessage.content}
                </p>
              </div>
              <button
                onClick={cancelReply}
                className="ml-3 p-1 text-wa-text-secondary hover:text-wa-text rounded-full transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="bg-wa-panel px-4 py-3 border-t border-wa-border relative">
        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-20 right-4 z-50 shadow-wa-lg rounded-lg overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={350}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: false
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Menu */}
        <AnimatePresence>
          {showAttachmentMenu && (
            <motion.div
              ref={attachmentMenuRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute bottom-20 left-4 bg-wa-panel-header rounded-lg shadow-wa-lg border border-wa-border p-2 z-50"
            >
              <div className="space-y-1">
                <button
                  className="flex items-center space-x-3 w-full p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-wa-text"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <FaFile className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Document</span>
                </button>
                <button className="flex items-center space-x-3 w-full p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-wa-text">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <FaImage className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Photos & Videos</span>
                </button>
                <button className="flex items-center space-x-3 w-full p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-wa-text">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <FaCamera className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">Camera</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Attachment button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-2 text-wa-text-secondary hover:text-wa-text transition-colors hover:bg-wa-input-panel rounded-full"
            >
              <FaPaperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </div>

          {/* Message input container */}
          <div className="flex-1 relative">
            <motion.textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-wa-input-panel border border-wa-border rounded-full text-wa-text placeholder-wa-text-secondary focus:outline-none focus:border-wa-primary resize-none max-h-32 overflow-y-auto transition-all duration-200"
              style={{ minHeight: "48px" }}
              whileFocus={{ scale: 1.02 }}
            />

            {/* Emoji button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wa-text-secondary hover:text-wa-text transition-colors p-1 hover:bg-wa-input-panel rounded-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaSmile className="w-5 h-5" />
            </button>
          </div>

          {/* Send/Voice button */}
          {newMessage.trim() ? (
            <motion.button
              type="submit"
              className="p-3 bg-wa-primary text-white rounded-full hover:bg-wa-primary-dark transition-all duration-200 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane className="w-5 h-5" />
            </motion.button>
          ) : (
            <button
              type="button"
              className="p-3 text-wa-text-secondary hover:text-wa-text transition-colors hover:bg-wa-input-panel rounded-full"
            >
              <FaMicrophone className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
