import axios from 'axios';
import {config} from './index';
const API_BASE_URL = config.publicAPI ;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Nếu cần gửi cookie
});


// Interceptor: tự động gửi token với các request không phải auth
api.interceptors.request.use((config) => {
  // Không thêm token cho các endpoint auth công khai (login, register, etc.)
  const publicAuthEndpoints = ['/auth/login', '/auth/register', '/auth/register-mua', '/auth/google-login', '/auth/send-verification', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'];
  const isPublicAuthEndpoint = publicAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (!isPublicAuthEndpoint) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Optional: Interceptor xử lý lỗi chung
// api.interceptors.response.use(
//   response => response,
//   error => Promise.reject(error)
// );
