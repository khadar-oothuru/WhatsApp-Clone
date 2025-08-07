import api from './authService'

export const userService = {
  async getUsers() {
    const response = await api.get('/users')
    return response.data
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData)
    return response.data
  },

  async searchUsers(query) {
    const response = await api.get(`/users/search/${query}`)
    return response.data
  }
}
