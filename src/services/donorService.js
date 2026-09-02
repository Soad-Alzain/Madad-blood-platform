import api from './api'

export const donorService = {
  async getDonors() {
    const response = await api.get('/donors')
    return response.data
  }
}