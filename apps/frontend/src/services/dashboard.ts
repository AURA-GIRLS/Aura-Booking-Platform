import { api } from '@/config/api';
import type { ApiResponseDTO } from '@/types/common.dtos';
import type { BookingResponseDTO } from '@/types/booking.dtos';

export interface MuaDashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  newCustomersThisMonth: number;
  monthlyBookings: number;
  revenueGrowthPercent: number;
  bookingsGrowthPercent: number;
  customersGrowthPercent: number; 
}

export interface MuaService {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  isActive: boolean;
}

export interface CalendarEvent {
  day: number;
  status: string;
  customerName: string;
  serviceName: string;
  time: string;
}

export interface FeedbackItem {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  reviewerName?: string;
  reviewerAvatarUrl?: string;
}

export const DashboardService = {
  async getMuaSummary(muaId: string): Promise<ApiResponseDTO<MuaDashboardSummary>> {
    const res = await api.get<ApiResponseDTO<MuaDashboardSummary>>(`/dashboard/mua/${muaId}/summary`);
    return res.data;
  },

  async getMuaRecent(muaId: string, limit = 5): Promise<ApiResponseDTO<BookingResponseDTO[]>> {
    const res = await api.get<ApiResponseDTO<BookingResponseDTO[]>>(`/dashboard/mua/${muaId}/recent`, {
      params: { limit }
    });
    return res.data;
  },

  async getMuaServices(muaId: string): Promise<ApiResponseDTO<MuaService[]>> {
    const res = await api.get<ApiResponseDTO<MuaService[]>>(`/dashboard/mua/${muaId}/services`);
    return res.data;
  },

  async getMuaCalendarEvents(muaId: string, year: number, month: number): Promise<ApiResponseDTO<CalendarEvent[]>> {
    const res = await api.get<ApiResponseDTO<CalendarEvent[]>>(`/dashboard/mua/${muaId}/calendar`, {
      params: { year, month }
    });
    return res.data;
  },

  async getRecentFeedback(muaId: string, limit = 5): Promise<ApiResponseDTO<FeedbackItem[]>> {
    const res = await api.get<ApiResponseDTO<FeedbackItem[]>>(`/feedback/mua/${muaId}/recent`, { params: { limit } });
    return res.data as any;
  },

  async setServiceAvailability(muaId: string, serviceId: string, isAvailable: boolean): Promise<ApiResponseDTO<any>> {
    const res = await api.patch<ApiResponseDTO<any>>(`/dashboard/mua/${muaId}/services/${serviceId}/availability`, { isAvailable });
    return res.data;
  }
};
