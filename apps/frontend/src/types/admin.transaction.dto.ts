/**
 * Frontend Admin Transaction DTOs
 * 
 * Types for admin transaction and withdrawal management
 */

// ==================== QUERY DTOs ====================

export interface AdminTransactionQueryDTO {
  page?: number;
  pageSize?: number;
  customerId?: string;
  bookingId?: string;
  status?: 'HOLD' | 'CAPTURED' | 'PENDING_REFUND' | 'REFUNDED';
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  customerName?: string;
  muaName?: string;
  serviceName?: string;
}

export interface AdminWithdrawQueryDTO {
  page?: number;
  pageSize?: number;
  muaId?: string;
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  reference?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  muaName?: string;
}

// ==================== RESPONSE DTOs ====================

export interface AdminTransactionResponseDTO {
  _id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  muaId: string;
  muaName: string;
  muaEmail: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  amount: number;
  currency: string;
  status: 'HOLD' | 'CAPTURED' | 'PENDING_REFUND' | 'REFUNDED';
  paymentMethod: string;
  paymentReference: string;
  payoutId?: string;
  bookingDate: Date | string;
  bookingStatus: string;
  bookingAddress: string;
  bookingNote?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminWithdrawResponseDTO {
  _id: string;
  muaId: string;
  muaName: string;
  muaEmail: string;
  muaPhone: string;
  muaLocation: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  reference: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankBin: string;
  };
  requestedAt: Date | string;
  processedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== LIST RESPONSE DTOs ====================

export interface AdminTransactionListResponseDTO {
  transactions: AdminTransactionResponseDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  total: number;
}

export interface AdminWithdrawListResponseDTO {
  withdrawals: AdminWithdrawResponseDTO[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  total: number;
}

// ==================== SUMMARY DTOs ====================

export interface TransactionSummaryDTO {
  transactions: {
    total: number;
    totalAmount: number;
    byStatus: {
      HOLD: number;
      CAPTURED: number;
      PENDING_REFUND: number;
      REFUNDED: number;
    };
    amountByStatus: {
      HOLD: number;
      CAPTURED: number;
      PENDING_REFUND: number;
      REFUNDED: number;
    };
  };
  withdrawals: {
    total: number;
    totalAmount: number;
    byStatus: {
      PENDING: number;
      PROCESSING: number;
      SUCCESS: number;
      FAILED: number;
    };
    amountByStatus: {
      PENDING: number;
      PROCESSING: number;
      SUCCESS: number;
      FAILED: number;
    };
  };
  summary: {
    totalRevenue: number;
    totalWithdrawn: number;
    platformBalance: number;
    pendingPayouts: number;
    refundsPending: number;
  };
}

// ==================== STATISTICS DTOs ====================

export interface TransactionStatisticsDTO {
  totalTransactions: number;
  totalAmount: number;
  totalRevenue: number;
  totalRefunded: number;
  pendingRefunds: number;
  averageTransactionAmount: number;
  statusBreakdown: {
    HOLD: { count: number; amount: number; percentage: number };
    CAPTURED: { count: number; amount: number; percentage: number };
    PENDING_REFUND: { count: number; amount: number; percentage: number };
    REFUNDED: { count: number; amount: number; percentage: number };
  };
  monthlyTrends: {
    month: string;
    transactions: number;
    amount: number;
    revenue: number;
  }[];
}

export interface WithdrawalStatisticsDTO {
  totalWithdrawals: number;
  totalAmount: number;
  totalProcessed: number;
  totalPending: number;
  averageWithdrawalAmount: number;
  statusBreakdown: {
    PENDING: { count: number; amount: number; percentage: number };
    PROCESSING: { count: number; amount: number; percentage: number };
    SUCCESS: { count: number; amount: number; percentage: number };
    FAILED: { count: number; amount: number; percentage: number };
  };
  monthlyTrends: {
    month: string;
    withdrawals: number;
    amount: number;
    processed: number;
  }[];
}