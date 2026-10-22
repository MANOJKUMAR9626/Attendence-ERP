import axios from 'axios';
import { store } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';

// Resolve API base URL with automatic fallback and trailing-slash normalization
const rawBaseURL = import.meta.env.VITE_API_URL;
const baseURL = (() => {
  if (rawBaseURL) {
    const clean = rawBaseURL.trim().replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }
  return `http://${window.location.hostname}:5000/api/v1`;
})();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies if we use HTTP-only cookies
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // We could attach token from localStorage if we are not using cookies
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      store.dispatch(logoutUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
