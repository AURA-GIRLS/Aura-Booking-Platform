import { api } from "@/config/api";
import { ApiResponseDTO, UserResponseDTO } from "../types";

export const UserService = {
    async getUserById(userId:string): Promise<ApiResponseDTO<UserResponseDTO>> {
        try {
          const res = await api.get<ApiResponseDTO<UserResponseDTO>>(`/user/${userId}`);
          return res.data;
        } catch (error: any) {
          throw error.response?.data || error;
        }
      },
}