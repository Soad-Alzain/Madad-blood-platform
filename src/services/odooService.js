import axios from 'axios';

const odooClient = axios.create({
  baseURL: '/api/v1/madad',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default {
  async getCurrentUser() {
    const response = await odooClient.get('/session/get_info');
    return response.data; 
  },

  async getDashboardData(role) {
    const response = await odooClient.get(`/dashboard/${role}`);
    return response.data;
  }
};