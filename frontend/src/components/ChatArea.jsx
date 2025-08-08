import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import EmptyChatState from "./EmptyChatState";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { messageService } from "../services/messageService";
import { whatsappService } from "../services/whatsappService";
import { userService } from "../services/userService";
import { useAPI } from "../hooks/useAPI";
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
  FaWhatsapp,
  FaCheck,
  FaCheckDouble,
  FaExclamationTriangle,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
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

const ChatArea = ({
  selectedUser,
  onlineUsers,
  onBackToSidebar,
  isMobile,
  onSelectUser,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // WhatsApp-specific state
  const [isWhatsAppMode, setIsWhatsAppMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [whatsappMessages, setWhatsappMessages] = useState([]);
  const [messageStatus, setMessageStatus] = useState(new Map());
  const [showWhatsAppTemplates, setShowWhatsAppTemplates] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);

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
    // WhatsApp socket methods
    sendWhatsAppMessage,
    onWhatsAppMessage,
    onWhatsAppStatusUpdate,
    subscribeToWhatsAppContact,
    unsubscribeFromWhatsAppContact,
  } = useSocket();

  // Create stable API call function
  const getMessagesAPI = useCallback(() => {
    return selectedUser
      ? messageService.getMessages(selectedUser._id)
      : Promise.resolve([]);
  }, [selectedUser]);

  // Fetch messages using the API hook
  const { data: fetchedMessages, loading } = useAPI(
    getMessagesAPI,
    selectedUser ? [selectedUser._id] : []
  );

  // Update messages when fetchedMessages changes
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Memoized grouped messages
  const groupedMessages = useMemo(() => {
    return messages ? groupMessagesByDate(messages) : [];
  }, [messages]);

  // Keyboard shortcuts
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    setShowSearch(!showSearch);
  });

  useHotkeys("escape", () => {
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    setIsSelectionMode(false);
    setSelectedMessages([]);
    setReplyToMessage(null);
    setShowSearch(false);
  });

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

  // ============ WhatsApp Integration Effects ============

  // WhatsApp message listener
  useEffect(() => {
    const handleWhatsAppMessage = (data) => {
      if (data.message) {
        const whatsappMessage = whatsappService.formatMessage(data.message);
        setWhatsappMessages((prev) => [...prev, whatsappMessage]);

        // Also add to regular messages if it matches current conversation
        if (
          selectedUser?.phone_number === whatsappMessage.sender.phone ||
          selectedUser?.phone_number === whatsappMessage.recipient.phone
        ) {
          setMessages((prev) => [...prev, whatsappMessage]);
        }
      }
    };

    const unsubWhatsApp = onWhatsAppMessage(handleWhatsAppMessage);
    return unsubWhatsApp;
  }, [selectedUser, onWhatsAppMessage]);

  // WhatsApp status update listener
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      if (data.status) {
        setMessageStatus((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.status.messageId, {
            status: data.status.status,
            timestamp: data.status.timestamp,
            error: data.status.error,
          });
          return newMap;
        });

        // Update message in the messages list
        setMessages((prev) =>
          prev.map((msg) =>
            msg.whatsapp_message_id === data.status.messageId
              ? { ...msg, status: data.status.status }
              : msg
          )
        );
      }
    };

    const unsubStatus = onWhatsAppStatusUpdate(handleStatusUpdate);
    return unsubStatus;
  }, [onWhatsAppStatusUpdate]);

  // Subscribe to WhatsApp contact updates
  useEffect(() => {
    if (selectedUser?.phone_number) {
      subscribeToWhatsAppContact(selectedUser.phone_number);

      return () => {
        unsubscribeFromWhatsAppContact(selectedUser.phone_number);
      };
    }
  }, [
    selectedUser?.phone_number,
    subscribeToWhatsAppContact,
    unsubscribeFromWhatsAppContact,
  ]);

  // Load WhatsApp templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await whatsappService.getMessageTemplates();
        setAvailableTemplates(templates);
      } catch (error) {
        console.error("Failed to load WhatsApp templates:", error);
      }
    };

    if (userService.isWhatsAppLinked()) {
      loadTemplates();
    }
  }, []);

  // Detect if current user has WhatsApp linked
  useEffect(() => {
    setIsWhatsAppMode(userService.isWhatsAppLinked());
  }, [user]);

  // ============ WhatsApp Handler Functions ============

  const handleSendWhatsAppMessage = async (message, type = "text") => {
    if (!selectedUser?.phone_number && !phoneNumber) {
      setShowPhoneInput(true);
      return;
    }

    const targetPhone = selectedUser?.phone_number || phoneNumber;

    try {
      // Send via socket for real-time updates
      sendWhatsAppMessage(targetPhone, message, type);

      // Send via API for persistence
      const result = await whatsappService.sendWhatsAppMessage(
        targetPhone,
        message,
        type
      );

      // Add to messages
      const whatsappMessage = {
        _id: result.messageId || Date.now().toString(),
        sender: {
          _id: user._id,
          username: user.username,
          phone: user.phone_number,
        },
        recipient: { phone: targetPhone },
        content: message,
        type: type,
        whatsapp_message_id: result.messageId,
        createdAt: new Date(),
        status: "sent",
        isWhatsApp: true,
      };

      setMessages((prev) => [...prev, whatsappMessage]);
      setWhatsappMessages((prev) => [...prev, whatsappMessage]);
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      // Show error notification
    }
  };

  const handleSendTemplate = async (templateName, templateData) => {
    try {
      const targetPhone = selectedUser?.phone_number || phoneNumber;
      const result = await whatsappService.sendTemplateMessage(
        targetPhone,
        templateName,
        templateData
      );

      const templateMessage = {
        _id: result.messageId || Date.now().toString(),
        sender: { _id: user._id, username: user.username },
        recipient: { phone: targetPhone },
        content: `Template: ${templateName}`,
        type: "template",
        template: { name: templateName, data: templateData },
        whatsapp_message_id: result.messageId,
        createdAt: new Date(),
        status: "sent",
        isWhatsApp: true,
      };

      setMessages((prev) => [...prev, templateMessage]);
      setShowWhatsAppTemplates(false);
    } catch (error) {
      console.error("Failed to send template message:", error);
    }
  };

  const handlePhoneNumberSubmit = async (phone) => {
    const validation = whatsappService.validatePhoneNumber(phone);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setPhoneNumber(validation.formatted);
    setShowPhoneInput(false);

    // Try to find user by phone number
    try {
      const foundUser = await userService.getUserByPhone(validation.formatted);
      if (foundUser) {
        // Switch to that user
        onSelectUser && onSelectUser(foundUser);
      }
    } catch (error) {
      console.log(
        "User not found by phone, but we can still send WhatsApp messages"
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Check if this should be sent as WhatsApp message
    const shouldSendWhatsApp = isWhatsAppMode && selectedUser.phone_number;

    if (shouldSendWhatsApp) {
      await handleSendWhatsAppMessage(messageText, "text");
      return;
    }

    // Regular message handling
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
    setNewMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file);
      // TODO: Implement file upload functionality
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      // TODO: Call API to delete message
    } catch (error) {
      console.error("Error deleting message:", error);
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
    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        const newSelection = prev.filter((id) => id !== messageId);
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
    setMessages((prev) =>
      prev.filter((msg) => !selectedMessages.includes(msg._id))
    );
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate values needed for chat interface
  const isOnline = selectedUser
    ? isUserOnline(onlineUsers, selectedUser._id)
    : false;

  // Wrap the entire return with AnimatePresence for smooth transitions
  return (
    <AnimatePresence mode="wait">
      {!selectedUser ? (
        <EmptyChatState key="empty-state" />
      ) : (
        <motion.div
          key={`chat-${selectedUser._id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className="flex-1 flex flex-col bg-wa-bg h-full overflow-hidden"
        >
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-wa-text">
                        {selectedUser.username}
                      </h3>
                      {selectedUser.phone_number && (
                        <FaWhatsapp
                          className="w-4 h-4 text-green-500"
                          title="WhatsApp User"
                        />
                      )}
                      {isWhatsAppMode && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          WhatsApp
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                      {selectedUser.phone_number && (
                        <span className="text-xs text-wa-text-secondary">
                          +{selectedUser.phone_number}
                        </span>
                      )}
                    </div>
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
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Selection Mode Header */}
            <AnimatePresence>
              {isSelectionMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-wa-primary px-4 py-3 flex items-center justify-between border-b border-wa-border flex-shrink-0"
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
                    <span className="font-medium">
                      {selectedMessages.length} selected
                    </span>
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

            {/* Scrollable Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden bg-wa-pattern chat-scrollbar chat-bg-pattern"
              style={{ minHeight: 0 }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-wa-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-wa-text-secondary">
                      Loading messages...
                    </p>
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
                <div className="p-4 pb-2 min-w-0">
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
                            onForward={(msg) =>
                              console.log("Forward message:", msg)
                            }
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
          </div>

          {/* Reply Preview */}
          <AnimatePresence>
            {replyToMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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
                      showPreview: false,
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

                    {/* WhatsApp-specific options */}
                    {isWhatsAppMode && (
                      <>
                        <button
                          className="flex items-center space-x-3 w-full p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-wa-text"
                          onClick={() => setShowWhatsAppTemplates(true)}
                        >
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <FaWhatsapp className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium">Templates</span>
                        </button>

                        {!selectedUser?.phone_number && (
                          <button
                            className="flex items-center space-x-3 w-full p-3 hover:bg-wa-input-panel rounded-lg transition-colors text-wa-text"
                            onClick={() => setShowPhoneInput(true)}
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <FaPhone className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium">Phone Number</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSendMessage}
              className="flex items-end space-x-3"
            >
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

          {/* WhatsApp Phone Input Modal */}
          <AnimatePresence>
            {showPhoneInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowPhoneInput(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold mb-4">
                    Enter WhatsApp Phone Number
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const phone = e.target.phone.value;
                      handlePhoneNumberSubmit(phone);
                    }}
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Phone Number (with country code)
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include country code (e.g., +1 for US, +91 for India)
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPhoneInput(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Start Chat
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Templates Modal */}
          <AnimatePresence>
            {showWhatsAppTemplates && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowWhatsAppTemplates(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold mb-4">
                    WhatsApp Message Templates
                  </h3>

                  {availableTemplates.length > 0 ? (
                    <div className="space-y-3">
                      {availableTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            handleSendTemplate(template.name, {
                              language: "en",
                            })
                          }
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {template.category}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {template.components.map((component, index) => (
                              <div key={index} className="mb-1">
                                {component.type === "HEADER" && (
                                  <div className="font-medium">
                                    {component.text}
                                  </div>
                                )}
                                {component.type === "BODY" && (
                                  <div>{component.text}</div>
                                )}
                                {component.type === "FOOTER" && (
                                  <div className="text-xs text-gray-500">
                                    {component.text}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaWhatsapp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No WhatsApp templates available</p>
                      <p className="text-sm">
                        Templates will appear here once configured
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setShowWhatsAppTemplates(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatArea;
