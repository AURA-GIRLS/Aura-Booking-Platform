import { api } from '@/config/api';
import type { ApiResponseDTO } from '../types/common.dtos';
import type { CreateBookingDTO, BookingResponseDTO, BookingSlot, PaginatedBookingsResponse, UpdateBookingDTO } from '../types/booking.dtos';

export const BookingService = {
  // CREATE - Tạo booking mới
  async create(data: CreateBookingDTO): Promise<ApiResponseDTO<BookingResponseDTO>> {
    try {
      const res = await api.post<ApiResponseDTO<BookingResponseDTO>>('/booking/', data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy booking theo ID
  async getById(id: string): Promise<ApiResponseDTO<BookingResponseDTO>> {
    try {
      const res = await api.get<ApiResponseDTO<BookingResponseDTO>>(`/booking/${id}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy tất cả bookings với phân trang và filter
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<ApiResponseDTO<PaginatedBookingsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.status) queryParams.append('status', params.status);

      const res = await api.get<ApiResponseDTO<PaginatedBookingsResponse>>(
        `/booking/?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy bookings theo customer ID
  async getByCustomer(
    customerId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<ApiResponseDTO<PaginatedBookingsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const res = await api.get<ApiResponseDTO<PaginatedBookingsResponse>>(
        `/booking/customer/${customerId}?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy bookings theo MUA ID
  async getByMUA(
    muaId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<ApiResponseDTO<PaginatedBookingsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const res = await api.get<ApiResponseDTO<PaginatedBookingsResponse>>(
        `/booking/mua/${muaId}?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy bookings theo ngày
  async getByDate(
    date: string,
    muaId?: string
  ): Promise<ApiResponseDTO<BookingResponseDTO[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (muaId) queryParams.append('muaId', muaId);

      const res = await api.get<ApiResponseDTO<BookingResponseDTO[]>>(
        `/booking/date/${date}?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Lấy available time slots
  async getAvailableSlots(params: {
    muaId: string;
    serviceId: string;
    day: string;
    duration: number;
  }): Promise<ApiResponseDTO<BookingSlot[]>> {
    try {
      const queryParams = new URLSearchParams({
        muaId: params.muaId,
        serviceId: params.serviceId,
        day: params.day,
        duration: params.duration.toString(),
      });

      const res = await api.get<ApiResponseDTO<BookingSlot[]>>(
        `/booking/available-slots?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // UPDATE - Cập nhật booking
  async update(
    id: string,
    data: UpdateBookingDTO
  ): Promise<ApiResponseDTO<BookingResponseDTO>> {
    try {
      const res = await api.put<ApiResponseDTO<BookingResponseDTO>>(`/booking/${id}`, data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // UPDATE - Cập nhật status booking
  async updateStatus(
    id: string,
    status: string
  ): Promise<ApiResponseDTO<BookingResponseDTO>> {
    try {
      const res = await api.patch<ApiResponseDTO<BookingResponseDTO>>(`/booking/${id}/status`, { status });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // DELETE - Cancel booking (soft delete)
  async cancel(id: string): Promise<ApiResponseDTO<BookingResponseDTO>> {
    try {
      const res = await api.patch<ApiResponseDTO<BookingResponseDTO>>(`/booking/${id}/cancel`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // DELETE - Xóa booking hoàn toàn (hard delete)
  async delete(id: string): Promise<ApiResponseDTO> {
    try {
      const res = await api.delete<ApiResponseDTO>(`/booking/${id}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};