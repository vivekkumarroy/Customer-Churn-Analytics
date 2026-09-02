import axios from 'axios';

const api = axios.create({
  baseURL: 'https://customer-churn-analytics-b9vx.onrender.com/api',
});

export default api;
