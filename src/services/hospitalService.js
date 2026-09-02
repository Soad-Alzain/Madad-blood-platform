// src/services/hospitalService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8069'

export const hospitalService = {
  async getHospitals() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospitals`)
      return response.data
    } catch (error) {
      console.error('Error fetching hospitals/banks:', error)
      throw error
    }
  },

  async createHospital(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/hospitals`, data)
      return response.data
    } catch (error) {
      console.error('Error creating hospital:', error)
      throw error
    }
  }
}