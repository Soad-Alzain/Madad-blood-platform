import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const donorService = {
  /**
   * @param {Object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.phone
   * @param {string} data.blood_type
   * @param {string} data.city
   * @param {string|null} [data.last_donation_date]
   */
  async createDonor(data) {
    const response = await axios.post(`${API_BASE_URL}/donors`, data)
    return response.data
  },

  async getDonors() {
    const response = await axios.get(`${API_BASE_URL}/donors`)
    return response.data
  }
}