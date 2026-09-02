// src/services/bloodRequestService.js

// يمكنك استخدام Axios أو Fetch للربط مع Odoo Backend
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8069' // أو رابط خادم Odoo الخاص بك

export const bloodRequestService = {
  async getBloodRequests() {
    try {
      // استبدل المسار بالـ Endpoint الخاص بـ Odoo
      const response = await axios.get(`${API_BASE_URL}/api/blood-requests`)
      return response.data
    } catch (error) {
      console.error('Error fetching blood requests:', error)
      throw error
    }
  },

  async acceptBloodRequest(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blood-requests/accept`, data)
      return response.data
    } catch (error) {
      console.error('Error accepting blood request:', error)
      throw error
    }
  },

  async rejectBloodRequest(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blood-requests/reject`, data)
      return response.data
    } catch (error) {
      console.error('Error rejecting blood request:', error)
      throw error
    }
  }
}