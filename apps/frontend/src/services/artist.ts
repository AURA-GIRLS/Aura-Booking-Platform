import { api } from '@/config/api';
import type {
    CreateUserDTO,
    LoginDTO,
    ForgotPasswordDTO,
    ResetPasswordDTO,
    SendEmailVerificationDTO,
    VerifyEmailDTO,
    AuthResponseDTO,
    UserResponseDTO,
    CreateMuaDTO,
} from '../types/user.dtos';
import type { ApiResponseDTO } from '../types/common.dtos';
import { GetScheduleDTO } from '../types';

export const artistService = {
    async getSchedule(data: GetScheduleDTO): Promise<ApiResponseDTO> {
        try {
            const res = await api.get<ApiResponseDTO>(`/artists/${data.muaId}/week/final`, { params: { weekStart: data.weekStart } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },
    async getOriginalWorkingSlots(data: GetScheduleDTO): Promise<ApiResponseDTO> {
        try {
            const res = await api.get<ApiResponseDTO>(`/artists/${data.muaId}/week/original`, { params: { weekStart: data.weekStart } });
            return res.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },
};
