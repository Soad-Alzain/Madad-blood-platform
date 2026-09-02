import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const hospitalService = {
  /**
   * @param {string} hospitalId
   */
  async getHospitalDetails(hospitalId) {
    const response = await axios.post(`${API_BASE_URL}/hospitals/details`, { hospital_id: hospitalId })
    return response.data
  },

  async getHospitals() {
    const response = await axios.get(`${API_BASE_URL}/hospitals`)
    return response.data
  }
}

export const donorService = {
  /**
   * @param {string} donorId
   */
  async getDonorDetails(donorId) {
    const response = await axios.post(`${API_BASE_URL}/donors/details`, { donor_id: donorId })
    return response.data
  },

  async getDonors() {
    const response = await axios.get(`${API_BASE_URL}/donors`)
    return response.data
  }
}