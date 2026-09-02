// src/services/inventoryService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8069'

export const inventoryService = {
  async getInventory() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory`)
      return response.data
    } catch (error) {
      console.error('Error fetching inventory:', error)
      throw error
    }
  },

  async updateInventory(data) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/inventory/update`, data)
      return response.data
    } catch (error) {
      console.error('Error updating inventory:', error)
      throw error
    }
  }
}