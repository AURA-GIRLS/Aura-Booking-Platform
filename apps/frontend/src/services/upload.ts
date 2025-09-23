import { api } from "@/config/api";
import type { ApiResponseDTO } from "../types";

export type ResourceType = 'image' | 'video' | 'raw';

export interface UploadResultDTO {
  publicId: string;
  url: string;
  resourceType: ResourceType;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  folder?: string;
  createdAt?: string;
}

export const UploadService = {
  // Upload by public URL
  async uploadByUrl(payload: {
    url: string;
    resourceType?: ResourceType;
    folder?: string;
    options?: Record<string, unknown>;
  }): Promise<ApiResponseDTO<UploadResultDTO>> {
    try {
      const res = await api.post<ApiResponseDTO<UploadResultDTO>>('/upload/url', payload);
      return res.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Upload multipart file from browser
  async uploadFile(file: File, opts?: {
    resourceType?: ResourceType;
    folder?: string;
    options?: Record<string, unknown>;
  }): Promise<ApiResponseDTO<UploadResultDTO>> {
    try {
      const form = new FormData();
      form.append('file', file);
      if (opts?.resourceType) form.append('resourceType', opts.resourceType);
      if (opts?.folder) form.append('folder', opts.folder);
      if (opts?.options) form.append('options', JSON.stringify(opts.options));

      const res = await api.post<ApiResponseDTO<UploadResultDTO>>('/upload/file', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },
};
