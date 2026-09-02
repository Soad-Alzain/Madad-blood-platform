import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const bloodRequestService = {
  /**
   * @param {Object} data
   * @param {string} data.hospital_id
   * @param {string} data.blood_type
   * @param {number} data.quantity
   * @param {string} [data.blood_bank]
   * @param {string} [data.priority]
   * @param {string} [data.notes]
   */
  async createRequest(data) {
    const response = await axios.post(`${API_BASE_URL}/blood-requests`, data)
    return response.data
  },

  async getRequests() {
    const response = await axios.get(`${API_BASE_URL}/blood-requests`)
    return response.data
  },

  async getRequestDetails(requestId) {
    const response = await axios.post(`${API_BASE_URL}/blood-requests/details`, { request_id: requestId })
    return response.data
  },

  async acceptRequest(requestId) {
    const response = await axios.post(`${API_BASE_URL}/blood-requests/accept`, { request_id: requestId })
    return response.data
  },

  async rejectRequest(requestId) {
    const response = await axios.post(`${API_BASE_URL}/blood-requests/reject`, { request_id: requestId })
    return response.data
  }
}