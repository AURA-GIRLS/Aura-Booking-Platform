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

    // Danh sách endpoints không cần auto-refresh
    const authEndpoints = [
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

    const status = error?.response?.status;
    const requestUrl: string = originalRequest?.url || '';
    const isAuthEndpoint = authEndpoints.some(endpoint => requestUrl.includes(endpoint));
    
    // Kiểm tra xem user có token không (đã login chưa)
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
    
    // Không auto-refresh nếu:
    // 1. Không phải lỗi 401
    // 2. Là auth endpoint (login, register, etc.)
    // 3. Có lỗi 401 nhưng không có token (user chưa login)
    if (status !== 401 || isAuthEndpoint || (status === 401 && !hasToken)) {
      return Promise.reject(error);
    }
    
    // Chỉ refresh khi: có token + 401 (token hết hạn)

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
      // Gọi refresh endpoint (chỉ khi user đã login)
      console.log("🔄 Attempting token refresh for logged user...");
      const res = await refreshClient.post('/auth/refresh');
      const newToken: string | undefined = res?.data?.data?.token;
      
      if (!newToken) {
        console.error("❌ No token received from refresh");
        throw new Error('No token received from refresh');
      }
      
      console.log("✅ Token refreshed successfully");
      
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
      console.error("❌ Token refresh failed:", refreshErr);
      
      // Nếu refresh thất bại, xóa token và đăng xuất
      try {
        await refreshClient.post('/auth/logout');
      } catch {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        //TODO: check lai
        window.dispatchEvent(new CustomEvent('auth:logout'));
        delete api.defaults.headers.common['Authorization'];
      }
      
      // Notify all waiting requests
      refreshSubscribers.forEach(callback => callback(''));
      refreshSubscribers = [];
      
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);