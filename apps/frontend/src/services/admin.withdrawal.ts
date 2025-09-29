/**
 * Admin Withdrawal Service
 * 
 * API calls for withdrawal management operations
 */

import type {
  AdminWithdrawalQueryDTO,
  AdminWithdrawalResponseDTO,
  AdminWithdrawalListResponseDTO,
  WithdrawalSummaryDTO
} from '../types/admin.withdrawal.dto';
import type { ApiResponseDTO } from '../types/common.dtos';
import { api } from '../config/api';

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

// ==================== WITHDRAWAL MANAGEMENT ====================

/**
 * Get list of withdrawals with filtering and pagination
 */
export async function getWithdrawals(query: AdminWithdrawalQueryDTO = {}): Promise<ApiResponseDTO<AdminWithdrawalListResponseDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/withdrawals?${queryString}` : '/admin/withdrawals';
    
    const response = await api.get<ApiResponseDTO<AdminWithdrawalListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get withdrawal details by ID
 */
export async function getWithdrawalById(withdrawalId: string): Promise<ApiResponseDTO<AdminWithdrawalResponseDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<AdminWithdrawalResponseDTO>>(`/admin/withdrawals/${withdrawalId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get withdrawal summary statistics
 */
export async function getWithdrawalSummary(query: {
  fromDate?: string;
  toDate?: string;
} = {}): Promise<ApiResponseDTO<WithdrawalSummaryDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/withdrawals/summary?${queryString}` : '/admin/withdrawals/summary';
    
    const response = await api.get<ApiResponseDTO<WithdrawalSummaryDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Process (approve) a withdrawal request
 */
export async function processWithdrawal(withdrawalId: string): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.post<ApiResponseDTO<any>>(`/admin/withdrawals/${withdrawalId}/process`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Reject a withdrawal request
 */
export async function rejectWithdrawal(withdrawalId: string, reason: string, adminNote?: string): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.post<ApiResponseDTO<any>>(`/admin/withdrawals/${withdrawalId}/reject`, {
      reason,
      adminNote
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Process multiple withdrawal requests
 */
export async function bulkProcessWithdrawals(withdrawalIds: string[], adminNote?: string): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.post<ApiResponseDTO<any>>('/admin/withdrawals/bulk-process', {
      withdrawalIds,
      adminNote
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Update withdrawal status manually
 */
export async function updateWithdrawalStatus(
  withdrawalId: string, 
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED', 
  adminNote?: string
): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.patch<ApiResponseDTO<any>>(`/admin/withdrawals/${withdrawalId}/status`, {
      status,
      adminNote
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Export withdrawals to CSV/Excel format
 */
export async function exportWithdrawals(query: AdminWithdrawalQueryDTO = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/withdrawals/export?${queryString}` : '/admin/withdrawals/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}