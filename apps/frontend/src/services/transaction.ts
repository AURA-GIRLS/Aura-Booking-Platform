import { api } from "@/config/api";
import { ApiResponseDTO } from "../types";
import { PayOSCreateLinkInput, PayOSCreateLinkResult } from "@/types/transaction.dto";

export const TransactionService = {
 async getTransactionLink(input: PayOSCreateLinkInput): Promise<ApiResponseDTO<PayOSCreateLinkResult>> {
    try {
      const res = await api.post<ApiResponseDTO<PayOSCreateLinkResult>>(`/transaction/payment-link`,input);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
     }
   }
}
