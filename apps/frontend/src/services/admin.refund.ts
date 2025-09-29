/**
 * Admin Refund Service
 * 
 * API calls for refund management operations
 */


import type { ApiResponseDTO } from '../types/common.dtos';
import { api } from '../config/api';
import { AdminRefundListResponseDTO, AdminRefundQueryDTO, RefundSummaryDTO } from '@/types/admin.refund.dto';

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

// ==================== REFUND MANAGEMENT ====================

/**
 * Get list of refunds with filtering and pagination
 */
export async function getRefunds(query: AdminRefundQueryDTO = {}): Promise<ApiResponseDTO<AdminRefundListResponseDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/refunds?${queryString}` : '/admin/refunds';
    
    const response = await api.get<ApiResponseDTO<AdminRefundListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get refund summary statistics
 */
export async function getRefundSummary(query: {
  fromDate?: string;
  toDate?: string;
} = {}): Promise<ApiResponseDTO<RefundSummaryDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/refunds/summary?${queryString}` : '/admin/refunds/summary';
    
    const response = await api.get<ApiResponseDTO<RefundSummaryDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Process a single refund request
 */
export async function processRefund(transactionId: string): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.post<ApiResponseDTO<any>>(`/admin/refunds/${transactionId}/process`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Process multiple refund requests
 */
export async function bulkProcessRefunds(transactionIds: string[], adminNote?: string): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.post<ApiResponseDTO<any>>('/admin/refunds/bulk-process', {
      transactionIds,
      adminNote
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Update refund status manually
 */
export async function updateRefundStatus(
  transactionId: string, 
  status: 'PENDING_REFUND' | 'REFUNDED', 
  adminNote?: string
): Promise<ApiResponseDTO<any>> {
  try {
    const response = await api.patch<ApiResponseDTO<any>>(`/admin/refunds/${transactionId}/status`, {
      status,
      adminNote
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Export refunds to CSV/Excel format
 */
export async function exportRefunds(query: AdminRefundQueryDTO = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/refunds/export?${queryString}` : '/admin/refunds/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}