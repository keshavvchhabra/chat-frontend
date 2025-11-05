import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Changed from 5000 to 5001
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Register new user
  register: async (email, password, name) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      name
    });
    
    // Store token in localStorage as backup
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    // Store token in localStorage as backup
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;

