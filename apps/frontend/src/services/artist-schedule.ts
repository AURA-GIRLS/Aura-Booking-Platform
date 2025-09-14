import { api } from '@/config/api';

import type { ApiResponseDTO } from '../types/common.dtos';
import { GetScheduleDTO } from '../types';

export const artistScheduleService = {
    async getSchedule(data: GetScheduleDTO): Promise<ApiResponseDTO> {
        try {
            const res = await api.get<ApiResponseDTO>(`/artist-schedule/${data.muaId}/week/final`, { params: { weekStart: data.weekStart } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },
    async getPendingBookings(muaId:string, pageNumber:string, pageSize:string): Promise<ApiResponseDTO> {
        try {
            const res = await api.get<ApiResponseDTO>(`/artist-schedule/${muaId}/booking/pending`, { params: { pageNumber,pageSize } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },
    async deleteWorkingSlot(muaId: string, slotId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.delete(`/artist-schedule/${muaId}/slot/working/${slotId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async deleteOverrideSlot(muaId: string, slotId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.delete(`/artist-schedule/${muaId}/slot/override/${slotId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async deleteBlockedSlot(muaId: string, slotId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.delete(`/artist-schedule/${muaId}/slot/blocked/${slotId}`);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async getOriginalWorkingSlots(data: GetScheduleDTO): Promise<ApiResponseDTO> {
        try {
            const res = await api.get<ApiResponseDTO>(`/artist-schedule/${data.muaId}/week/original`, { params: { weekStart: data.weekStart } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    // Working Slot
    async updateWorkingSlot(muaId: string, slotId: string, data: { weekday: string, startTime: string, endTime: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.put(`/artist-schedule/${muaId}/slot/working/${slotId}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async addWorkingSlot(data: {muaId: string, weekday: string, startTime: string, endTime: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.post(`/artist-schedule/${data.muaId}/slot/working`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    // Override Slot
    async updateOverrideSlot(muaId: string, slotId: string, data: { overrideStart: string, overrideEnd: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.put(`/artist-schedule/${muaId}/slot/override/${slotId}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async addOverrideSlot(data: { muaId: string, overrideStart: string, overrideEnd: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.post(`/artist-schedule/${data.muaId}/slot/override`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    // Blocked Slot
    async updateBlockedSlot(muaId:string, slotId: string, data: { blockStart: string, blockEnd: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.put(`/artist-schedule/${muaId}/slot/blocked/${slotId}`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    async addBlockedSlot(data: { muaId: string, blockStart: string, blockEnd: string, note?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.post(`/artist-schedule/${data.muaId}/slot/blocked`, data);
            return res.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
};
