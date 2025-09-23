import { api } from '@/config/api';
import type { ApiResponseDTO } from '@/types/common.dtos';
import type { BookingResponseDTO } from '@/types/booking.dtos';

export interface MuaDashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
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
  }
};
