// src/services/appointmentService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8069'

export const appointmentService = {
  async getAppointments() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/appointments`)
      return response.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }
  },

  async acceptAppointment(apptId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments/${apptId}/accept`)
      return response.data
    } catch (error) {
      console.error('Error accepting appointment:', error)
      throw error
    }
  },

  async rejectAppointment(apptId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments/${apptId}/reject`)
      return response.data
    } catch (error) {
      console.error('Error rejecting appointment:', error)
      throw error
    }
  }
}