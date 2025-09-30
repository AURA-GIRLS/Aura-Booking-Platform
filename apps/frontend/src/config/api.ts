import axios from 'axios';
import {config} from './index';
const API_BASE_URL = config.publicAPI;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor: tự động gửi token với các request không phải auth
api.interceptors.request.use((config) => {
  const publicAuthEndpoints = [
    '/auth/login', 
    '/auth/register', 
    '/auth/register-mua', 
    '/auth/google-login', 
    '/auth/send-verification', 
    '/auth/verify-email', 
    '/auth/forgot-password', 
    '/auth/reset-password', 
    '/auth/refresh'
  ];
  
  const isPublicAuthEndpoint = publicAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (!isPublicAuthEndpoint) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Response interceptor: tự động refresh token khi hết hạn
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRrefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

const refreshClient = axios.create({ 
  baseURL: API_BASE_URL, 
  withCredentials: true 
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không phải lỗi 401 hoặc request tới /auth/refresh thì trả về lỗi
    const status = error?.response?.status;
    const requestUrl: string = originalRequest?.url || '';
    if (status !== 401 || requestUrl.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Tránh lặp vô hạn
    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }
    (originalRequest as any)._retry = true;

    // Nếu đang refresh, chờ tới khi xong
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken: string) => {
          try {
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    isRefreshing = true;
    try {
      // Gọi refresh endpoint
      const res = await refreshClient.post('/auth/refresh');
      const newToken: string | undefined = res?.data?.data?.token;
      if (!newToken) {
        throw new Error('No token received from refresh');
      }
      
      // Cập nhật token mới
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }
      (api.defaults.headers.common as any)['Authorization'] = `Bearer ${newToken}`;
      onRrefreshed(newToken);

      // Thử lại request gốc
      originalRequest.headers = originalRequest.headers || {};
      (originalRequest.headers as any)['Authorization'] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      // Nếu refresh thất bại, xóa token và đăng xuất
      try {
        await refreshClient.post('/auth/logout');
      } catch {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);