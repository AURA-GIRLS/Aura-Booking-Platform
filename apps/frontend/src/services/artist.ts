import { api } from "@/config/api";
import { ApiResponseDTO } from "@/types/common.dtos";
import { ServiceResponseDTO } from "../types";

export const ArtistService = {
 async getArtistServices(muaId: string): Promise<ApiResponseDTO<ServiceResponseDTO[]>> {
    try {
      const res = await api.get<ApiResponseDTO<ServiceResponseDTO[]>>(`/artists/${muaId}/services`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};