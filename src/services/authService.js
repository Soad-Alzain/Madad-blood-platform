import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const authService = {
  async login(credentials) {
    // استخدم نقطة النهاية الحقيقية التي يوفرها مطور Odoo
    const response = await axios.post(`${API_BASE_URL}/login`, credentials)
    return response.data
  },
  
  async logout() {
    const response = await axios.post(`${API_BASE_URL}/logout`)
    return response.data
  }
}