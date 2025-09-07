
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
} from '../types/user.dtos';
import type { ApiResponseDTO } from '../types/common.dtos';

export const authService = {
	async register(data: CreateUserDTO): Promise<ApiResponseDTO<AuthResponseDTO>> {
		try {
			const res = await api.post<ApiResponseDTO<AuthResponseDTO>>('/auth/register', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async login(data: LoginDTO): Promise<ApiResponseDTO<AuthResponseDTO>> {
		try {
			const res = await api.post<ApiResponseDTO<AuthResponseDTO>>('/auth/login', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async sendEmailVerification(data: SendEmailVerificationDTO): Promise<ApiResponseDTO> {
		try {
			const res = await api.post<ApiResponseDTO>('/auth/send-verification', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async verifyEmail(data: VerifyEmailDTO): Promise<ApiResponseDTO> {
		try {
			const res = await api.post<ApiResponseDTO>('/auth/verify-email', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async forgotPassword(data: ForgotPasswordDTO): Promise<ApiResponseDTO> {
		try {
			const res = await api.post<ApiResponseDTO>('/auth/forgot-password', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async resetPassword(data: ResetPasswordDTO): Promise<ApiResponseDTO> {
		try {
			const res = await api.post<ApiResponseDTO>('/auth/reset-password', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async loginWithGoogle(data: { credential: string }): Promise<ApiResponseDTO<AuthResponseDTO>> {
		try {
			const res = await api.post<ApiResponseDTO<AuthResponseDTO>>('/auth/google-login', data);
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async getProfile(): Promise<ApiResponseDTO<UserResponseDTO>> {
		try {
			const res = await api.get<ApiResponseDTO<UserResponseDTO>>('/auth/profile', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				}
			});
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async resendVerificationEmail(): Promise<ApiResponseDTO> {
		try {
			const res = await api.post<ApiResponseDTO>('/auth/resend-verification');
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
	async checkEmailVerification(): Promise<ApiResponseDTO<{ isEmailVerified: boolean }>> {
		try {
			const res = await api.get<ApiResponseDTO<{ isEmailVerified: boolean }>>('/auth/check-verification');
			return res.data;
		} catch (error: any) {
			throw error.response?.data || error;
		}
	},
};
