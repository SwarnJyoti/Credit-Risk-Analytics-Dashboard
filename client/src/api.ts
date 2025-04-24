import axios from 'axios';

//const API_URL = 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const updateStatus = async (customerId: string, status: string) => {
  await axios.post(`${API_URL}/update-status`, { customerId, status });
};
