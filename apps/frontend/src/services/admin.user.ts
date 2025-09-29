/**
 * Admin User Service
 * 
 * API calls for admin user and MUA management operations
 */

import type {
  AdminUserQueryDTO,
  AdminMUAQueryDTO,
  AdminUserResponseDTO,
  AdminMUAResponseDTO,
  AdminUserListResponseDTO,
  AdminMUAListResponseDTO,
  BanUserDTO,
  ApproveMUADTO,
  RejectMUADTO,
  BulkBanUsersDTO,
  BulkApproveMUAsDTO,
  UserStatisticsDTO,
  MUAStatisticsDTO
} from "../types/admin.user.dto";
import type { ApiResponseDTO } from '../types/common.dtos';
import { api } from "../config/api";

// Helper function to build query string
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// ==================== USER MANAGEMENT ====================

/**
 * Get paginated list of users with filtering
 */
export async function getUsers(query: AdminUserQueryDTO = {}): Promise<ApiResponseDTO<AdminUserListResponseDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    const response = await api.get<ApiResponseDTO<AdminUserListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ApiResponseDTO<AdminUserResponseDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<AdminUserResponseDTO>>(`/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Ban a user
 */
export async function banUser(userId: string, banData: BanUserDTO = {}): Promise<ApiResponseDTO<AdminUserResponseDTO>> {
  try {
    const response = await api.put<ApiResponseDTO<AdminUserResponseDTO>>(`/admin/users/${userId}/ban`, banData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string): Promise<ApiResponseDTO<AdminUserResponseDTO>> {
  try {
    const response = await api.put<ApiResponseDTO<AdminUserResponseDTO>>(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Ban multiple users
 */
export async function bulkBanUsers(bulkData: BulkBanUsersDTO): Promise<ApiResponseDTO<{
  successful: number;
  failed: number;
  total: number;
}>> {
  try {
    const response = await api.put<ApiResponseDTO<{
      successful: number;
      failed: number;
      total: number;
    }>>('/admin/users/bulk-ban', bulkData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

export async function bulkUnBanUsers(bulkData: BulkBanUsersDTO): Promise<ApiResponseDTO<{
  successful: number;
  failed: number;
  total: number;
}>> {
  try {
    const response = await api.put<ApiResponseDTO<{
      successful: number;
      failed: number;
      total: number;
    }>>('/admin/users/bulk-unban', bulkData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}
// ==================== MUA MANAGEMENT ====================

/**
 * Get paginated list of MUAs with filtering
 */
export async function getMUAs(query: AdminMUAQueryDTO = {}): Promise<ApiResponseDTO<AdminMUAListResponseDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/muas?${queryString}` : '/admin/muas';
    
    const response = await api.get<ApiResponseDTO<AdminMUAListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get MUA by ID
 */
export async function getMUAById(muaId: string): Promise<ApiResponseDTO<AdminMUAResponseDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<AdminMUAResponseDTO>>(`/admin/muas/${muaId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Approve a MUA application
 */
export async function approveMUA(muaId: string, approveData: ApproveMUADTO = {}): Promise<ApiResponseDTO<AdminMUAResponseDTO>> {
  try {
    const response = await api.put<ApiResponseDTO<AdminMUAResponseDTO>>(`/admin/muas/${muaId}/approve`, approveData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Reject a MUA application
 */
export async function rejectMUA(muaId: string, rejectData: RejectMUADTO): Promise<ApiResponseDTO<AdminMUAResponseDTO>> {
  try {
    const response = await api.put<ApiResponseDTO<AdminMUAResponseDTO>>(`/admin/muas/${muaId}/reject`, rejectData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Approve multiple MUA applications
 */
export async function bulkApproveMUAs(bulkData: BulkApproveMUAsDTO): Promise<ApiResponseDTO<{
  successful: number;
  failed: number;
  total: number;
}>> {
  try {
    const response = await api.put<ApiResponseDTO<{
      successful: number;
      failed: number;
      total: number;
    }>>('/admin/muas/bulk-approve', bulkData);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

// ==================== STATISTICS ====================

/**
 * Get user statistics
 */
export async function getUserStatistics(): Promise<ApiResponseDTO<UserStatisticsDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<UserStatisticsDTO>>('/admin/users/statistics');
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get MUA statistics
 */
export async function getMUAStatistics(): Promise<ApiResponseDTO<MUAStatisticsDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<MUAStatisticsDTO>>('/admin/muas/statistics');
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Export users to CSV/Excel format
 */
export async function exportUsers(query: AdminUserQueryDTO = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/users/export?${queryString}` : '/admin/users/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}

/**
 * Export MUAs to CSV/Excel format
 */
export async function exportMUAs(query: AdminMUAQueryDTO = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/muas/export?${queryString}` : '/admin/muas/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}

// ==================== ERROR HANDLING ====================

/**
 * Custom error class for admin API errors
 */
export class AdminAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AdminAPIError';
  }
}

/**
 * Enhanced API call with better error handling
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: AdminAPIError }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error: any) {
    return { 
      error: new AdminAPIError(
        error?.response?.data?.message || error?.message || 'An unexpected error occurred',
        error?.response?.status
      )
    };
  }
}
