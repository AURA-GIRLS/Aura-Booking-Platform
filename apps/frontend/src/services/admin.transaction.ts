/**
 * Admin Transaction Service
 * 
 * API calls for admin transaction and payout management operations
 */

import type {
    PayoutListResponseDTO,
  PayoutResponseDTO,
  TransactionResponseDTO
} from "../types/transaction.dto";
import type { ApiResponseDTO } from '../types/common.dtos';
import { api } from "../config/api";

// Type aliases for union types
type ApprovalState = "APPROVED" | "PENDING" | "REJECTED";
type TransactionStatus = 'HOLD' | 'CAPTURED' | 'REFUNDED';
type PayoutTransactionState = "SUCCEEDED" | "FAILED" | "PENDING" | "PROCESSING";

// Local interfaces for API responses
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

// ==================== PAYOUT MANAGEMENT ====================

/**
 * Get list of payouts with filtering and pagination
 */
export async function getPayouts(query: {
  page?: number;
  pageSize?: number;
  referenceId?: string;
  approvalState?: ApprovalState;
  categories?: string;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<ApiResponseDTO<PayoutListResponseDTO>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/payouts?${queryString}` : '/admin/payouts';
    
    const response = await api.get<ApiResponseDTO<PayoutListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get detailed information about a specific payout
 */
export async function getPayoutById(payoutId: string): Promise<ApiResponseDTO<PayoutResponseDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<PayoutResponseDTO>>(`/admin/payouts/${payoutId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

// ==================== TRANSACTION MANAGEMENT ====================

/**
 * Get list of transactions with filtering and pagination
 */
export async function getTransactions(query: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  bookingId?: string;
  status?: TransactionStatus;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<ApiResponseDTO<{
  transactions: TransactionResponseDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  total: number;
}>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/transactions?${queryString}` : '/admin/transactions';
    
    const response = await api.get<ApiResponseDTO<{
      transactions: TransactionResponseDTO[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
      };
      total: number;
    }>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get detailed information about a specific transaction
 */
export async function getTransactionById(transactionId: string): Promise<ApiResponseDTO<TransactionResponseDTO>> {
  try {
    const response = await api.get<ApiResponseDTO<TransactionResponseDTO>>(`/admin/transactions/${transactionId}`);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get summary statistics for admin dashboard
 */
export async function getTransactionSummary(query: {
  fromDate?: string;
  toDate?: string;
} = {}): Promise<ApiResponseDTO<{
  transactions: {
    total: number;
    byStatus: {
      HOLD: number;
      CAPTURED: number;
      REFUNDED: number;
    };
    totalAmount: number;
  };
  payouts: {
    total: number;
    byApprovalState: {
      APPROVED: number;
      PENDING: number;
      REJECTED: number;
    };
    totalAmount: number;
  };
}>> {
  try {
    const queryString = buildQueryString(query);
    const endpoint = queryString ? `/admin/transactions/summary?${queryString}` : '/admin/transactions/summary';
    
    const response = await api.get<ApiResponseDTO<{
      transactions: {
        total: number;
        byStatus: {
          HOLD: number;
          CAPTURED: number;
          REFUNDED: number;
        };
        totalAmount: number;
      };
      payouts: {
        total: number;
        byApprovalState: {
          APPROVED: number;
          PENDING: number;
          REJECTED: number;
        };
        totalAmount: number;
      };
    }>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Export payouts to CSV/Excel format
 */
export async function exportPayouts(query: {
  referenceId?: string;
  approvalState?: ApprovalState;
  categories?: string;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/payouts/export?${queryString}` : '/admin/payouts/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}

/**
 * Export transactions to CSV/Excel format
 */
export async function exportTransactions(query: {
  customerId?: string;
  bookingId?: string;
  status?: TransactionStatus;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<Blob> {
  const queryString = buildQueryString({ ...query, export: true });
  const endpoint = queryString ? `/admin/transactions/export?${queryString}` : '/admin/transactions/export';
  
  const response = await api.get(endpoint, {
    responseType: 'blob'
  });
  
  return response.data;
}

// ==================== ADVANCED FILTERING ====================

/**
 * Get payouts with advanced filtering options
 */
export async function getPayoutsAdvanced(filters: {
  // Basic filters
  page?: number;
  pageSize?: number;
  
  // Reference and approval filters
  referenceId?: string;
  approvalState?: ApprovalState;
  
  // Category filters (array support)
  categories?: string[];
  
  // Date range filters
  fromDate?: string;
  toDate?: string;
  
  // Amount filters
  minAmount?: number;
  maxAmount?: number;
  
  // Account filters
  toBin?: string;
  toAccountNumber?: string;
  
  // State filters
  transactionStates?: PayoutTransactionState[];
} = {}): Promise<ApiResponseDTO<PayoutListResponseDTO>> {
  try {
    // Convert categories array to comma-separated string
    const queryParams = {
      ...filters,
      categories: filters.categories?.join(','),
      transactionStates: filters.transactionStates?.join(','),
    };
    
    const queryString = buildQueryString(queryParams);
    const endpoint = queryString ? `/admin/payouts/advanced?${queryString}` : '/admin/payouts/advanced';
    
    const response = await api.get<ApiResponseDTO<PayoutListResponseDTO>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

/**
 * Get transactions with advanced filtering options
 */
export async function getTransactionsAdvanced(filters: {
  // Basic filters
  page?: number;
  pageSize?: number;
  
  // Customer and booking filters
  customerId?: string;
  customerName?: string;
  bookingId?: string;
  
  // Status filters
  status?: TransactionStatus;
  
  // Amount filters
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  
  // Date range filters
  fromDate?: string;
  toDate?: string;
  
  // Service filters
  serviceName?: string;
  
  // Payment method filters
  paymentMethod?: string;
} = {}): Promise<ApiResponseDTO<{
  transactions: TransactionResponseDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  total: number;
  summary: {
    totalAmount: number;
    averageAmount: number;
    statusBreakdown: Record<string, number>;
  };
}>> {
  try {
    const queryString = buildQueryString(filters);
    const endpoint = queryString ? `/admin/transactions/advanced?${queryString}` : '/admin/transactions/advanced';
    
    const response = await api.get<ApiResponseDTO<{
      transactions: TransactionResponseDTO[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
      };
      total: number;
      summary: {
        totalAmount: number;
        averageAmount: number;
        statusBreakdown: Record<string, number>;
      };
    }>>(endpoint);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
}

// ==================== ERROR HANDLING ====================

/**
 * Custom error class for admin transaction API errors
 */
export class AdminTransactionAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'AdminTransactionAPIError';
  }
}

/**
 * Enhanced API call with better error handling for transaction operations
 */
export async function safeTransactionApiCall<T>(
  apiCall: () => Promise<T>
): Promise<{ data?: T; error?: AdminTransactionAPIError }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error: any) {
    return { 
      error: new AdminTransactionAPIError(
        error?.response?.data?.message || error?.message || 'An unexpected error occurred in transaction API',
        error?.response?.status
      )
    };
  }
}

// ==================== REAL-TIME UPDATES ====================

/**
 * Subscribe to real-time transaction updates (WebSocket)
 */
export function subscribeToTransactionUpdates(
  onUpdate: (transaction: TransactionResponseDTO) => void,
  onError?: (error: Error) => void
): () => void {
  // This would typically use WebSocket or Server-Sent Events
  // For now, we'll use polling as a fallback
  
  const interval = setInterval(async () => {
    try {
      // Get recent transactions (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const response = await getTransactions({
        fromDate: fiveMinutesAgo,
        pageSize: 50
      });
      
      // This is a simplified implementation
      // In a real app, you'd track which transactions are new
      if (response.data?.transactions) {
        response.data.transactions.forEach(onUpdate);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, 10000); // Poll every 10 seconds
  
  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Subscribe to real-time payout updates (WebSocket)
 */
export function subscribeToPayoutUpdates(
  onUpdate: (payout: any) => void,
  onError?: (error: Error) => void
): () => void {
  // Similar to transaction updates
  const interval = setInterval(async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const response = await getPayouts({
        fromDate: fiveMinutesAgo,
        pageSize: 50
      });
      
      if (response.data?.data?.payouts) {
        response.data.data.payouts.forEach(onUpdate);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, 10000);
  
  return () => clearInterval(interval);
}
