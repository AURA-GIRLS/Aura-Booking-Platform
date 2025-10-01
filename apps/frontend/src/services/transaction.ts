import { api } from "@/config/api";
import { ApiResponseDTO } from "../types";
import { PayOSCreateLinkInput, PayOSCreateLinkResult, TransactionResponseDTO, WalletResponseDTO, WithdrawResponseDTO } from "@/types/transaction.dto";

export const TransactionService = {
 async getTransactionLink(input: PayOSCreateLinkInput): Promise<ApiResponseDTO<PayOSCreateLinkResult>> {
    try {
      const res = await api.post<ApiResponseDTO<PayOSCreateLinkResult>>(`/transaction/payment-link`,input);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
     }
   },
  async makeRefundBeforeConfirm(bookingId: string, bookingStatus: string): Promise<ApiResponseDTO> {
    try {
      const res = await api.post<ApiResponseDTO>(`/transaction/refund/${bookingId}`, {}, {
        params: { bookingStatus },
      });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  async makeWithdrawal(muaId: string): Promise<ApiResponseDTO> {
    try {
      const res = await api.post<ApiResponseDTO>(`/transaction/withdrawal/${muaId}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  async getTransactionsByMuaId(
    muaId: string,
    options?: { page?: number; pageSize?: number; status?: string }
  ): Promise<
    ApiResponseDTO<{
      transactions: TransactionResponseDTO[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    try {
      const { page = 1, pageSize = 10, status } = options || {};
      const res = await api.get<
        ApiResponseDTO<{ transactions: TransactionResponseDTO[]; total: number; page: number; totalPages: number }>
      >(`/transaction/mua/${muaId}`, {
        params: { page, pageSize, status },
      });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  async getWalletByMuaId(muaId: string): Promise<ApiResponseDTO<WalletResponseDTO>> {
    try {
      const res = await api.get<ApiResponseDTO<WalletResponseDTO>>(`/transaction/wallet/${muaId}`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  async getWithdrawalsByMuaId(
    muaId: string,
    options?: { page?: number; pageSize?: number; status?: string }
  ): Promise<
    ApiResponseDTO<{
      withdrawals: WithdrawResponseDTO[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    try {
      const { page = 1, pageSize = 10, status } = options || {};
      const res = await api.get<
        ApiResponseDTO<{ withdrawals: WithdrawResponseDTO[]; total: number; page: number; totalPages: number }>
      >(`/transaction/withdrawals/${muaId}`, {
        params: { page, pageSize, status },
      });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}
