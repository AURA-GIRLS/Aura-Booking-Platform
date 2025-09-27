// apps/backend/src/controllers/admin.transaction.controller.ts
import type { Request, Response } from "express";
import type { ApiResponseDTO } from "../types/common.dtos";
import { 
  getPayoutList, 
  getPayoutDetail, 
  buildPayoutListQuery 
} from "../services/payos.service";
import { 
  getTransactions, 
  getTransactionById
} from "../services/transaction.service";

// Helper functions for consistent response format
const successResponse = <T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) => {
  const response: ApiResponseDTO<T> = {
    status: statusCode,
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

const errorResponse = (res: Response, message: string = 'An error occurred', statusCode: number = 500, error?: string) => {
  const response: ApiResponseDTO = {
    status: statusCode,
    success: false,
    message,
    error
  };
  return res.status(statusCode).json(response);
};

export class AdminTransactionController {

  // ==================== PAYOUT MANAGEMENT ====================

  /**
   * GET /admin/payouts
   * Get list of payouts with filtering and pagination
   */
  async getPayouts(req: Request, res: Response) {
    try {
      const {
        page = "1",
        pageSize = "10",
        referenceId,
        approvalState,
        categories,
        fromDate,
        toDate
      } = req.query as Record<string, string>;

      // Build query using helper function
      const query = buildPayoutListQuery({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        referenceId,
        approvalState: approvalState as "APPROVED" | "PENDING" | "REJECTED",
        categories: categories ? categories.split(',') : undefined,
        fromDate,
        toDate
      });

      const data = await getPayoutList(query);

      return successResponse(res, data, "Payouts retrieved successfully");
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : "Failed to get payouts", 500);
    }
  }

  /**
   * GET /admin/payouts/:payoutId
   * Get detailed information about a specific payout
   */
  async getPayoutById(req: Request, res: Response) {
    try {
      const { payoutId } = req.params;

      if (!payoutId) {
        return errorResponse(res, "Payout ID is required", 400);
      }

      const data = await getPayoutDetail(payoutId);

      return successResponse(res, data, "Payout detail retrieved successfully");
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : "Failed to get payout detail", 500);
    }
  }

  // ==================== TRANSACTION MANAGEMENT ====================

  /**
   * GET /admin/transactions
   * Get list of transactions with filtering and pagination
   */
  async getTransactions(req: Request, res: Response) {
    try {
      const {
        page = "1",
        pageSize = "10",
        customerId,
        bookingId,
        status
      } = req.query as Record<string, string>;

      const filters: any = {};
      if (customerId) filters.customerId = customerId;
      if (bookingId) filters.bookingId = bookingId;
      if (status) filters.status = status as 'HOLD' | 'CAPTURED' | 'REFUNDED';

      const data = await getTransactions(
        parseInt(page),
        parseInt(pageSize),
        filters
      );

      return successResponse(res, data, "Transactions retrieved successfully");
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : "Failed to get transactions", 500);
    }
  }

  /**
   * GET /admin/transactions/:transactionId
   * Get detailed information about a specific transaction
   */
  async getTransactionById(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return errorResponse(res, "Transaction ID is required", 400);
      }

      const data = await getTransactionById(transactionId);

      if (!data) {
        return errorResponse(res, "Transaction not found", 404);
      }

      return successResponse(res, data, "Transaction retrieved successfully");
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : "Failed to get transaction", 500);
    }
  }

  // ==================== ADMIN SUMMARY ROUTES ====================

  /**
   * GET /admin/transactions/summary
   * Get summary statistics for admin dashboard
   */
  async getTransactionSummary(req: Request, res: Response) {
    try {
      const {
        fromDate,
        toDate
      } = req.query as Record<string, string>;

      // Get transaction statistics
      const transactionFilters: any = {};
      const payoutFilters: any = {};

      // Add date filters if provided
      if (fromDate) {
        payoutFilters.fromDate = fromDate;
      }
      if (toDate) {
        payoutFilters.toDate = toDate;
      }

      // Get transactions summary
      const [transactionsData, payoutsData] = await Promise.all([
        getTransactions(1, 1000), // Get more for summary
        getPayoutList(payoutFilters)
      ]);

      // Calculate summary statistics
      const summary = {
        transactions: {
          total: transactionsData.total,
          byStatus: {
            HOLD: transactionsData.transactions.filter(t => t.status === 'HOLD').length,
            CAPTURED: transactionsData.transactions.filter(t => t.status === 'CAPTURED').length,
            REFUNDED: transactionsData.transactions.filter(t => t.status === 'REFUNDED').length,
          },
          totalAmount: transactionsData.transactions.reduce((sum, t) => sum + t.amount, 0)
        },
        payouts: {
          total: payoutsData.data.pagination.total,
          byApprovalState: {
            APPROVED: payoutsData.data.payouts.filter(p => p.approvalState === 'APPROVED').length,
            PENDING: payoutsData.data.payouts.filter(p => p.approvalState === 'PENDING').length,
            REJECTED: payoutsData.data.payouts.filter(p => p.approvalState === 'REJECTED').length,
          },
          totalAmount: payoutsData.data.payouts.reduce((sum, p) => 
            sum + p.transactions.reduce((txSum, tx) => txSum + tx.amount, 0), 0
          )
        }
      };

      return successResponse(res, summary, "Transaction summary retrieved successfully");
    } catch (error) {
      return errorResponse(res, error instanceof Error ? error.message : "Failed to get transaction summary", 500);
    }
  }

}
