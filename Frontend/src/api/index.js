import axios from 'axios';

// 1. Create Axios Instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Ensure this matches your backend port
});

// 2. Request Interceptor (The "Token Attacher")
// This runs before every request to the backend
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Adds the JWT token to the headers so the backend knows who you are
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// --- AUTHENTICATION ---
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// --- FINANCE / BALANCE SHEET ---
// Fetches the user's current assets and liabilities
export const getFinance = () => API.get('/finance');

// Updates or creates the user's financial snapshot
export const updateFinance = (data) => API.post('/finance/update', data);
// --- GOALS ---
// Fetches all financial goals for the logged-in user
export const fetchGoals = () => API.get('/goals');

// Creates a new financial goal
export const createGoal = (data) => API.post('/goals', data);

// Updates progress on an existing goal
export const updateGoal = (id, data) => API.put(`/goals/${id}`, data);

// Deletes a goal
export const deleteGoal = (id) => API.delete(`/goals/${id}`);

// 3. Export the base API instance as default
export default API;