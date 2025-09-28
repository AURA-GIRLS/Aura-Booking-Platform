import { api } from "@/config/api";
import { ApiResponseDTO } from "../types";
import { UpdateBankAccountDTO, BankAccountResponseDTO, BankListResponseDTO } from "@/types/bankaccount.dtos";
import axios from "axios";

export const ProfileBankAccountService = {
  
  async getVietQrBankList(): Promise<BankListResponseDTO> {
    try {
      const res = await axios.get<BankListResponseDTO>('https://api.vietqr.io/v2/banks');
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  // ==================== BANK ACCOUNT ====================
  
  /**
   * Get bank account of current user
   */
  async getBankAccount(): Promise<ApiResponseDTO<BankAccountResponseDTO>> {
    try {
      const res = await api.get<ApiResponseDTO<BankAccountResponseDTO>>('/profile/bank-account');
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update bank account of current user
   */
  async updateBankAccount(data: UpdateBankAccountDTO): Promise<ApiResponseDTO<BankAccountResponseDTO>> {
    try {
      const res = await api.put<ApiResponseDTO<BankAccountResponseDTO>>('/profile/bank-account', data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete bank account of current user
   */
  async deleteBankAccount(): Promise<ApiResponseDTO> {
    try {
      const res = await api.delete<ApiResponseDTO>('/profile/bank-account');
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create bank account (if needed - though backend only allows update/get/delete)
   */
  async createBankAccount(data: UpdateBankAccountDTO): Promise<ApiResponseDTO<BankAccountResponseDTO>> {
    try {
      const res = await api.post<ApiResponseDTO<BankAccountResponseDTO>>('/profile/bank-account', data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};

export default ProfileBankAccountService;
