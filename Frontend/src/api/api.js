import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, '')}/api`;

const API = axios.create({ baseURL: API_BASE_URL });

// Add token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// IMPORTANT: Only catch 401 errors if it's NOT the login/register path
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized and we aren't currently trying to login...
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);
export const getAiInsights = (data) => API.post('/finance/ai-insights', data);
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const sendLoginOtp = (data) => API.post('/auth/otp/send', data);
export const verifyLoginOtp = (data) => API.post('/auth/otp/verify', data);
export const loginWithGoogleCredential = (data) => API.post('/auth/google/credential', data);
export const updateProfileName = (data) => API.put('/auth/profile/name', data);
export const updateFinance = (data) => API.post('/finance/update', data);
export const fetchFinance = () => API.get('/finance');
export const fetchGoals = () => API.get('/goals');
export const createGoal = (data) => API.post('/goals', data);
export const deleteGoal = (id) => API.delete(`/goals/${id}`);
