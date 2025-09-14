import axios from 'axios';
import {config} from './index';
import { API_BASE, ServiceCategory, ServiceAddon } from "../constants/constants";
import type { ApiResp, SortKey, ArtistDetail, ServicesApiResp, ArtistDetailDTO } from "../config/types";

const API_BASE_URL = config.publicAPI ;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Nếu cần gửi cookie
});

/**
 * Fetch artists with comprehensive filtering
 * Returns flat JSON response: { items, total, pages, page }
 */
export async function fetchArtists(params: {
  q?: string;
  location?: string;
  occasion?: ServiceCategory;
  style?: string;
  rating?: number | null;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  addons?: ServiceAddon[];
  sort: SortKey;
  page: number;
  limit: number;
}): Promise<ApiResp> {
  const qs = new URLSearchParams();
  
  // Basic search filters
  if (params.q) qs.set("q", params.q);
  if (params.location && params.location !== "All Areas") qs.set("location", params.location);

  // Service filters
  if (params.occasion && params.occasion !== "ALL") qs.set("occasion", params.occasion.toLowerCase());
  if (params.style && params.style.trim()) qs.set("style", params.style.trim());

  // Rating and price filters
  if (typeof params.rating === "number") qs.set("rating", String(params.rating));
  if (typeof params.priceMin === "number") qs.set("priceMin", String(params.priceMin));
  if (typeof params.priceMax === "number") qs.set("priceMax", String(params.priceMax));

  // Add-ons filter (multiple values)
  if (params.addons && params.addons.length > 0) {
    params.addons.forEach(addon => qs.append("addons", addon));
  }

  // Sorting and pagination
  qs.set("sort", params.sort);
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE}/artists?${qs.toString()}`, { 
    cache: "no-store",
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  // Return flat JSON response (no .data wrapper)
  return await res.json() as ApiResp;
}

/**
 * Fetch services for a specific artist
 */
export async function fetchArtistServices(
  artistId: string,
  params: {
    category?: string;
    q?: string;
    priceMin?: number;
    priceMax?: number;
    addons?: ServiceAddon[];
    sort?: SortKey;
    page?: number;
    limit?: number;
  } = {}
): Promise<ServicesApiResp> {
  const qs = new URLSearchParams();
  
  if (params.category) qs.set("category", params.category);
  if (params.q) qs.set("q", params.q);
  if (typeof params.priceMin === "number") qs.set("priceMin", String(params.priceMin));
  if (typeof params.priceMax === "number") qs.set("priceMax", String(params.priceMax));
  
  if (params.addons && params.addons.length > 0) {
    params.addons.forEach(addon => qs.append("addons", addon));
  }
  
  if (params.sort) qs.set("sort", params.sort);
  qs.set("page", String(params.page || 1));
  qs.set("limit", String(params.limit || 12));

  const res = await fetch(`${API_BASE}/artists/${artistId}/services?${qs.toString()}`, { 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  return await res.json() as ServicesApiResp;
}

/**
 * Fetch comprehensive artist details including services and portfolio
 */
export async function fetchArtistDetail(id: string): Promise<ArtistDetailDTO> {
  try {
    const res = await fetch(`${API_BASE}/artists/${id}/detail`, { cache: "no-store" });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const json = await res.json();
    
    // Transform the response to match expected structure
    return {
      artist: json.data.artist,
      services: json.data.services || [],
      portfolio: (json.data.portfolio || []).map((item: any) => ({
        id: item._id,
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        media: item.media,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined
      })),
      certificates: [] // TODO: Add when certificates are implemented
    };
  } catch (error) {
    throw new Error(`Failed to fetch artist details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a booking (simple implementation)
 */
export async function createBooking(params: {
  artistId: string;
  serviceId: string;
  dateISO: string;
  note?: string;
}): Promise<{ bookingId: string; status: string }> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.data;
}

/**
 * Format price to VND currency string
 */
export function formatVND(price: number): string {
  return price.toLocaleString('vi-VN') + ' VND';
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
