import api from "./authService";

export const messageService = {
  // Get all conversations for the current user with last messages (enhanced with WhatsApp data)
  async getConversations() {
    try {
      const response = await api.get("/messages/conversations");
      // Ensure we return an array with proper structure
      const conversations = Array.isArray(response.data) ? response.data : [];
      return conversations.map((conv) => ({
        ...conv,
        // Ensure consistent structure
        user: conv.user || {},
        lastMessage: conv.lastMessage || null,
        lastMessageAt: conv.lastMessageAt || new Date(),
        unreadCount: conv.unreadCount || 0,
        isArchived: conv.isArchived || false,
        isPinned: conv.isPinned || false,
        isMuted: conv.isMuted || false,
        isGroup: conv.isGroup || false,
        // WhatsApp fields
        whatsapp_conversation_id: conv.whatsapp_conversation_id || null,
        phone_number_id: conv.phone_number_id || null,
        display_phone_number: conv.display_phone_number || null,
        contacts: conv.contacts || [],
      }));
    } catch (error) {
      console.error("MessageService: Get conversations error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch conversations"
      );
    }
  },

  // Get messages between current user and another user (enhanced)
  async getMessages(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await api.get(`/messages/${userId}`);
      // Ensure we return an array with proper message structure
      const messages = Array.isArray(response.data) ? response.data : [];
      return messages.map((msg) => ({
        ...msg,
        // Ensure consistent structure
        _id: msg._id || msg.id,
        content: msg.content || "",
        type: msg.type || "text",
        status: msg.status || "sent",
        createdAt: msg.createdAt || new Date(),
        sender: msg.sender || {},
        recipient: msg.recipient || {},
        // WhatsApp fields
        whatsapp_message_id: msg.whatsapp_message_id || null,
        whatsapp_timestamp: msg.whatsapp_timestamp || null,
        from_phone: msg.from_phone || null,
        to_phone: msg.to_phone || null,
        interactive: msg.interactive || null,
        location: msg.location || null,
        contacts: msg.contacts || [],
        button: msg.button || null,
        list_reply: msg.list_reply || null,
      }));
    } catch (error) {
      console.error("MessageService: Get messages error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch messages"
      );
    }
  },

  // Get messages by phone number (NEW - WhatsApp specific)
  async getMessagesByPhone(phoneNumber) {
    try {
      const response = await api.get(`/messages/phone/${phoneNumber}`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Get messages by phone error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch messages by phone"
      );
    }
  },

  // Send a new message (enhanced with WhatsApp support)
  async sendMessage(messageData) {
    try {
      if (!messageData || !messageData.recipientId || !messageData.content) {
        throw new Error("Missing required message data");
      }

      const payload = {
        recipientId: messageData.recipientId,
        content: messageData.content,
        type: messageData.type || "text",
        mediaUrl: messageData.mediaUrl || "",
        whatsappData: {
          recipientPhone: messageData.recipientPhone,
          whatsapp_message_id: messageData.whatsapp_message_id,
          template_name: messageData.template_name,
          template_language: messageData.template_language,
          interactive: messageData.interactive,
          location: messageData.location,
          contacts: messageData.contacts,
          ...messageData.whatsappData,
        },
      };

      const response = await api.post("/messages", payload);
      return {
        ...response.data,
        // Ensure consistent structure
        _id: response.data._id || response.data.id,
        status: response.data.status || "sent",
        createdAt: response.data.createdAt || new Date(),
      };
    } catch (error) {
      console.error("MessageService: Send message error:", error);
      throw new Error(error.response?.data?.error || "Failed to send message");
    }
  },

  // Send WhatsApp message (NEW)
  async sendWhatsAppMessage(to, message, type = "text") {
    try {
      const response = await api.post("/webhooks/send", {
        to,
        message,
        type,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Send WhatsApp message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to send WhatsApp message"
      );
    }
  },

  // Update message status (delivered, read, etc.)
  async updateMessageStatus(messageId, status) {
    try {
      const response = await api.put(`/messages/${messageId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Update message status error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update message status"
      );
    }
  },

  // Get message status history (NEW - WhatsApp specific)
  async getMessageStatusHistory(messageId) {
    try {
      const response = await api.get(`/messages/${messageId}/status-history`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Get message status history error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get message status history"
      );
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Delete message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to delete message"
      );
    }
  },

  // Mark messages as read in a conversation
  async markMessagesAsRead(userId) {
    try {
      const response = await api.put(`/messages/conversations/${userId}/read`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Mark messages as read error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to mark messages as read"
      );
    }
  },

  // Search messages (enhanced)
  async searchMessages(query, userId = null) {
    try {
      const params = new URLSearchParams({ query });
      if (userId) params.append("userId", userId);

      const response = await api.get(`/messages/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Search messages error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to search messages"
      );
    }
  },

  // Upload file/media for messages
  async uploadMedia(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/messages/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Upload media error:", error);
      throw new Error(error.response?.data?.error || "Failed to upload media");
    }
  },

  // Get message delivery status
  async getMessageStatus(messageId) {
    try {
      const response = await api.get(`/messages/${messageId}/status`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Get message status error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get message status"
      );
    }
  },

  // Archive/Unarchive conversation
  async archiveConversation(userId, archive = true) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await api.put(
        `/messages/conversations/${userId}/archive`,
        {
          isArchived: archive,
        }
      );
      return response.data;
    } catch (error) {
      console.error("MessageService: Archive conversation error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to archive conversation"
      );
    }
  },

  // Pin/Unpin conversation
  async pinConversation(userId, pin = true) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await api.put(`/messages/conversations/${userId}/pin`, {
        isPinned: pin,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Pin conversation error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to pin conversation"
      );
    }
  },

  // Mute/Unmute conversation
  async muteConversation(userId, mute = true) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await api.put(`/messages/conversations/${userId}/mute`, {
        isMuted: mute,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Mute conversation error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to mute conversation"
      );
    }
  },

  // ============ Enhanced Features ============

  // Forward message to multiple recipients
  async forwardMessage(messageId, recipientIds) {
    try {
      if (
        !messageId ||
        !Array.isArray(recipientIds) ||
        recipientIds.length === 0
      ) {
        throw new Error("Message ID and recipient IDs are required");
      }

      const response = await api.post(`/messages/${messageId}/forward`, {
        recipientIds,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Forward message error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to forward message"
      );
    }
  },

  // Star/Unstar message
  async starMessage(messageId, star = true) {
    try {
      if (!messageId) {
        throw new Error("Message ID is required");
      }
      const response = await api.put(`/messages/${messageId}/star`, {
        isStarred: star,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Star message error:", error);
      throw new Error(error.response?.data?.error || "Failed to star message");
    }
  },

  // Get starred messages
  async getStarredMessages() {
    try {
      const response = await api.get("/messages/starred");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("MessageService: Get starred messages error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get starred messages"
      );
    }
  },

  // Edit message
  async editMessage(messageId, newContent) {
    try {
      if (!messageId || !newContent) {
        throw new Error("Message ID and new content are required");
      }
      const response = await api.put(`/messages/${messageId}`, {
        content: newContent,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Edit message error:", error);
      throw new Error(error.response?.data?.error || "Failed to edit message");
    }
  },

  // Delete multiple messages
  async deleteMessages(messageIds) {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        throw new Error("Message IDs are required");
      }
      const response = await api.post("/messages/delete-bulk", {
        messageIds,
      });
      return response.data;
    } catch (error) {
      console.error("MessageService: Delete messages error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to delete messages"
      );
    }
  },

  // Get conversation statistics
  async getConversationStats(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await api.get(`/messages/conversations/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error("MessageService: Get conversation stats error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to get conversation stats"
      );
    }
  },
};
