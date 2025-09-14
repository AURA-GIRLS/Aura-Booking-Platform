import axios from 'axios';
import {config} from './index';
import { API_BASE, ServiceCategory } from "../constants/constants";
import type { ApiResp, SortKey, ArtistDetailDTO } from "../config/types";

const API_BASE_URL = config.publicAPI ;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Nếu cần gửi cookie
});

export async function fetchArtists(params: {
  q?: string;
  location?: string;
  occasion?: ServiceCategory;
  style?: string;
  rating?: number | null;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  sort: SortKey;
  page: number;
  limit: number;
}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.location && params.location !== "All Areas") qs.set("location", params.location);

  if (params.occasion && params.occasion !== "ALL") qs.set("occasion", params.occasion);
  if (params.style && params.style.trim()) qs.set("style", params.style.trim());

  if (typeof params.rating === "number") qs.set("ratingMin", String(params.rating));
  if (typeof params.priceMin === "number") qs.set("priceMin", String(params.priceMin));
  if (typeof params.priceMax === "number") qs.set("priceMax", String(params.priceMax));

  qs.set("sort", params.sort);
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}/artists?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResp | { data: ApiResp };
  return (json as any).data ?? json;
}

export async function fetchArtistDetail(id: string): Promise<ArtistDetailDTO> {
  const res = await fetch(`${API_BASE}/artists/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

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
