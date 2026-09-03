import api from './api' 

export const notificationService = {
  async getNotifications(userId) {
    const response = await api.get('/notifications', { params: { user_id: userId } })
    return response.data
  },
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },
  async markAllAsRead(userId) {
    const response = await api.patch('/notifications/read-all', { user_id: userId })
    return response.data
  }
}