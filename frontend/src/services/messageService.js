import api from "./authService";

export const messageService = {
  // Get all conversations for the current user with last messages (enhanced with WhatsApp data)
  async getConversations() {
    try {
      const response = await api.get("/messages/conversations");
      return response.data;
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
      const response = await api.get(`/messages/${userId}`);
      return response.data;
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
      const response = await api.post("/messages", {
        ...messageData,
        whatsappData: messageData.whatsappData || {},
      });
      return response.data;
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
};
