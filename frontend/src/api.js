import axios from 'axios';

const api = axios.create({
  baseURL: 'https://customer-churn-analytics-k8vx.onrender.com/api',
});

export default api;
