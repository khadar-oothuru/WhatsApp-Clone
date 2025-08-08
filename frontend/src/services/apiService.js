import api from "./authService";

// Central API service for all backend routes
export const apiService = {
  // ============ Authentication Routes ============
  auth: {
    async login(credentials) {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },

    async register(userData) {
      const response = await api.post("/auth/register", userData);
      return response.data;
    },

    async logout(userId) {
      const response = await api.post("/auth/logout", { userId });
      return response.data;
    },

    async refreshToken() {
      const response = await api.post("/auth/refresh");
      return response.data;
    },

    async forgotPassword(email) {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    },

    async resetPassword(token, newPassword) {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    },

    async verifyEmail(token) {
      const response = await api.post("/auth/verify-email", { token });
      return response.data;
    },
  },

  // ============ User Routes ============
  users: {
    async getCurrentUser() {
      const response = await api.get("/users/me");
      return response.data;
    },

    async getAllUsers() {
      const response = await api.get("/users");
      return response.data;
    },

    async getUserById(id) {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },

    async updateProfile(profileData) {
      const response = await api.put("/users/profile", profileData);
      return response.data;
    },

    async updateOnlineStatus(isOnline) {
      const response = await api.put("/users/status/online", { isOnline });
      return response.data;
    },

    async searchUsers(query) {
      const response = await api.get(
        `/users/search/${encodeURIComponent(query)}`
      );
      return response.data;
    },

    async blockUser(userId) {
      const response = await api.put(`/users/${userId}/block`);
      return response.data;
    },

    async unblockUser(userId) {
      const response = await api.put(`/users/${userId}/unblock`);
      return response.data;
    },

    async getBlockedUsers() {
      const response = await api.get("/users/blocked");
      return response.data;
    },

    async reportUser(userId, reason) {
      const response = await api.post(`/users/${userId}/report`, { reason });
      return response.data;
    },

    async updateSettings(settings) {
      const response = await api.put("/users/settings", settings);
      return response.data;
    },

    async getSettings() {
      const response = await api.get("/users/settings");
      return response.data;
    },

    async uploadProfilePicture(file) {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const response = await api.post("/users/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },

    async deleteAccount() {
      const response = await api.delete("/users/me");
      return response.data;
    },

    // ============ WhatsApp User Features ============
    async linkWhatsAppAccount(whatsappData) {
      const response = await api.post("/users/link-whatsapp", whatsappData);
      return response.data;
    },

    async unlinkWhatsAppAccount() {
      const response = await api.post("/users/unlink-whatsapp");
      return response.data;
    },

    async getUserByPhone(phoneNumber) {
      const response = await api.get(
        `/users/phone/${encodeURIComponent(phoneNumber)}`
      );
      return response.data;
    },
  },

  // ============ Message Routes ============
  messages: {
    async getConversations() {
      const response = await api.get("/messages/conversations");
      return response.data;
    },

    async getMessages(userId, page = 1, limit = 50) {
      const response = await api.get(
        `/messages/${userId}?page=${page}&limit=${limit}`
      );
      return response.data;
    },

    async sendMessage(messageData) {
      const response = await api.post("/messages", messageData);
      return response.data;
    },

    async updateMessageStatus(messageId, status) {
      const response = await api.put(`/messages/${messageId}/status`, {
        status,
      });
      return response.data;
    },

    async deleteMessage(messageId) {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    },

    async markAsRead(userId) {
      const response = await api.put(`/messages/conversations/${userId}/read`);
      return response.data;
    },

    async searchMessages(query, userId = null) {
      const params = new URLSearchParams({ query });
      if (userId) params.append("userId", userId);
      const response = await api.get(`/messages/search?${params.toString()}`);
      return response.data;
    },

    async uploadMedia(file, type = "image") {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("type", type);
      const response = await api.post("/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },

    async forwardMessage(messageId, recipientIds) {
      const response = await api.post("/messages/forward", {
        messageId,
        recipientIds,
      });
      return response.data;
    },

    async starMessage(messageId, starred = true) {
      const response = await api.put(`/messages/${messageId}/star`, {
        starred,
      });
      return response.data;
    },

    async getStarredMessages() {
      const response = await api.get("/messages/starred");
      return response.data;
    },

    async editMessage(messageId, newContent) {
      const response = await api.put(`/messages/${messageId}/edit`, {
        content: newContent,
      });
      return response.data;
    },

    async pinMessage(messageId, pinned = true) {
      const response = await api.put(`/messages/${messageId}/pin`, { pinned });
      return response.data;
    },

    async getPinnedMessages(userId) {
      const response = await api.get(`/messages/${userId}/pinned`);
      return response.data;
    },

    async reactToMessage(messageId, emoji) {
      const response = await api.post(`/messages/${messageId}/react`, {
        emoji,
      });
      return response.data;
    },

    async removeReaction(messageId, emoji) {
      const response = await api.delete(`/messages/${messageId}/react`, {
        data: { emoji },
      });
      return response.data;
    },

    // ============ WhatsApp Message Features ============
    async getMessagesByPhone(phoneNumber, page = 1, limit = 50) {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await api.get(
        `/messages/phone/${encodeURIComponent(
          phoneNumber
        )}?${params.toString()}`
      );
      return response.data;
    },

    async sendWhatsAppMessage(to, message, type = "text") {
      const response = await api.post("/messages/whatsapp", {
        to,
        message,
        type,
      });
      return response.data;
    },

    async getMessageStatusHistory(messageId) {
      const response = await api.get(`/messages/${messageId}/status-history`);
      return response.data;
    },

    async getWhatsAppConversations() {
      const response = await api.get("/messages/whatsapp/conversations");
      return response.data;
    },
  },

  // ============ Conversation Routes ============
  conversations: {
    async archiveConversation(userId, archived = true) {
      const response = await api.put(
        `/messages/conversations/${userId}/archive`,
        { archived }
      );
      return response.data;
    },

    async pinConversation(userId, pinned = true) {
      const response = await api.put(`/messages/conversations/${userId}/pin`, {
        pinned,
      });
      return response.data;
    },

    async muteConversation(userId, muted = true, duration = null) {
      const response = await api.put(`/messages/conversations/${userId}/mute`, {
        muted,
        muteDuration: duration,
      });
      return response.data;
    },

    async deleteConversation(userId) {
      const response = await api.delete(`/messages/conversations/${userId}`);
      return response.data;
    },

    async clearConversation(userId) {
      const response = await api.put(`/messages/conversations/${userId}/clear`);
      return response.data;
    },

    async getConversationInfo(userId) {
      const response = await api.get(`/messages/conversations/${userId}/info`);
      return response.data;
    },

    async updateConversationSettings(userId, settings) {
      const response = await api.put(
        `/messages/conversations/${userId}/settings`,
        settings
      );
      return response.data;
    },
  },

  // ============ Group Routes ============
  groups: {
    async createGroup(groupData) {
      const response = await api.post("/groups", groupData);
      return response.data;
    },

    async getGroups() {
      const response = await api.get("/groups");
      return response.data;
    },

    async getGroupById(groupId) {
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    },

    async updateGroup(groupId, groupData) {
      const response = await api.put(`/groups/${groupId}`, groupData);
      return response.data;
    },

    async deleteGroup(groupId) {
      const response = await api.delete(`/groups/${groupId}`);
      return response.data;
    },

    async addMember(groupId, userId) {
      const response = await api.post(`/groups/${groupId}/members`, { userId });
      return response.data;
    },

    async removeMember(groupId, userId) {
      const response = await api.delete(`/groups/${groupId}/members/${userId}`);
      return response.data;
    },

    async updateMemberRole(groupId, userId, role) {
      const response = await api.put(`/groups/${groupId}/members/${userId}`, {
        role,
      });
      return response.data;
    },

    async leaveGroup(groupId) {
      const response = await api.post(`/groups/${groupId}/leave`);
      return response.data;
    },

    async uploadGroupIcon(groupId, file) {
      const formData = new FormData();
      formData.append("groupIcon", file);
      const response = await api.post(`/groups/${groupId}/icon`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
  },

  // ============ Notification Routes ============
  notifications: {
    async getNotifications() {
      const response = await api.get("/notifications");
      return response.data;
    },

    async markAsRead(notificationId) {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    },

    async markAllAsRead() {
      const response = await api.put("/notifications/read-all");
      return response.data;
    },

    async deleteNotification(notificationId) {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    },

    async getSettings() {
      const response = await api.get("/notifications/settings");
      return response.data;
    },

    async updateSettings(settings) {
      const response = await api.put("/notifications/settings", settings);
      return response.data;
    },
  },

  // ============ Media Routes ============
  media: {
    async uploadFile(file, type = "image") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const response = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },

    async getMedia(mediaId) {
      const response = await api.get(`/media/${mediaId}`);
      return response.data;
    },

    async deleteMedia(mediaId) {
      const response = await api.delete(`/media/${mediaId}`);
      return response.data;
    },

    async getMediaByConversation(userId, type = "all") {
      const response = await api.get(
        `/media/conversation/${userId}?type=${type}`
      );
      return response.data;
    },
  },

  // ============ Status Routes ============
  status: {
    async getStatuses() {
      const response = await api.get("/status");
      return response.data;
    },

    async createStatus(statusData) {
      const response = await api.post("/status", statusData);
      return response.data;
    },

    async deleteStatus(statusId) {
      const response = await api.delete(`/status/${statusId}`);
      return response.data;
    },

    async viewStatus(statusId) {
      const response = await api.post(`/status/${statusId}/view`);
      return response.data;
    },

    async getStatusViews(statusId) {
      const response = await api.get(`/status/${statusId}/views`);
      return response.data;
    },
  },

  // ============ Call Routes ============
  calls: {
    async initializeCall(callData) {
      const response = await api.post("/calls", callData);
      return response.data;
    },

    async getCallHistory() {
      const response = await api.get("/calls/history");
      return response.data;
    },

    async endCall(callId) {
      const response = await api.put(`/calls/${callId}/end`);
      return response.data;
    },

    async joinCall(callId) {
      const response = await api.put(`/calls/${callId}/join`);
      return response.data;
    },

    async leaveCall(callId) {
      const response = await api.put(`/calls/${callId}/leave`);
      return response.data;
    },
  },

  // ============ WhatsApp Webhook Routes ============
  webhooks: {
    async sendWhatsAppMessage(to, message, type = "text") {
      const response = await api.post("/webhooks/send", {
        to,
        message,
        type,
      });
      return response.data;
    },

    async getWebhookStatus(webhookId) {
      const response = await api.get(`/webhooks/status/${webhookId}`);
      return response.data;
    },

    async getMessageStatusHistory(messageId) {
      const response = await api.get(`/webhooks/message-status/${messageId}`);
      return response.data;
    },

    async reprocessWebhook(webhookId) {
      const response = await api.post(`/webhooks/reprocess/${webhookId}`);
      return response.data;
    },

    async getWebhookStats() {
      const response = await api.get("/webhooks/stats");
      return response.data;
    },

    async getFailedWebhooks(page = 1, limit = 20) {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await api.get(`/webhooks/failed?${params.toString()}`);
      return response.data;
    },
  },
};

export default apiService;
