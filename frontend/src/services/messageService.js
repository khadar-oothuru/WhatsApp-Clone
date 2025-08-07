import api from './authService'

export const messageService = {
  async getMessages(userId) {
    const response = await api.get(`/messages/${userId}`)
    return response.data
  },

  async sendMessage(messageData) {
    const response = await api.post('/messages', messageData)
    return response.data
  },

  async updateMessageStatus(messageId, status) {
    const response = await api.put(`/messages/${messageId}/status`, { status })
    return response.data
  },

  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`)
    return response.data
  },

  async getConversations() {
    const response = await api.get('/messages/conversations/last')
    return response.data
  }
}
