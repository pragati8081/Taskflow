import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to every request if present
const user = localStorage.getItem('taskflow_user');
if (user) {
  api.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(user).token}`;
}

// Response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
