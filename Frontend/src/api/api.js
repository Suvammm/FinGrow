import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

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

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const fetchFinance = () => API.get('/finance');
export const updateFinance = (data) => API.post('/finance/update', data);
export const fetchGoals = () => API.get('/goals');
export const createGoal = (data) => API.post('/goals', data);