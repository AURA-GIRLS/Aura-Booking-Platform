import { api } from "@/config/api";
import { ApiResponseDTO } from "../types";
import { PayOSCreateLinkInput, PayOSCreateLinkResult, TransactionResponseDTO, WalletResponseDTO } from "@/types/transaction.dto";

export const TransactionService = {
 async getTransactionLink(input: PayOSCreateLinkInput): Promise<ApiResponseDTO<PayOSCreateLinkResult>> {
    try {
      const res = await api.post<ApiResponseDTO<PayOSCreateLinkResult>>(`/transaction/payment-link`,input);
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
  }
}
