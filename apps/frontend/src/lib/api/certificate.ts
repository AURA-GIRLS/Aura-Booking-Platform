import { api } from "@/config/api";
import type { ApiResponseDTO } from "@/types/common.dtos";
import type {
  Certificate,
  CreateCertificateInput,
  UpdateCertificateInput,
  CertificateFilters,
  PaginatedCertificates,
  CertificateImage,
} from "@/types/certificate";

/**
 * Lấy danh sách certificates của MUA hiện tại
 */
export async function getMyCertificates(
  filters: CertificateFilters = {}
): Promise<PaginatedCertificates> {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.q) params.append("q", filters.q);

    const res = await api.get<ApiResponseDTO<PaginatedCertificates>>(
      `/certificates/my?${params.toString()}`
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Lấy chi tiết certificate theo ID
 */
export async function getCertificateById(id: string): Promise<Certificate> {
  try {
    const res = await api.get<ApiResponseDTO<Certificate>>(`/certificates/my/${id}`);
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Tạo certificate mới
 */
export async function createCertificate(
  data: CreateCertificateInput
): Promise<Certificate> {
  try {
    const res = await api.post<ApiResponseDTO<Certificate>>("/certificates/my", data);
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Cập nhật certificate
 */
export async function updateCertificate(
  id: string,
  data: UpdateCertificateInput
): Promise<Certificate> {
  try {
    const res = await api.patch<ApiResponseDTO<Certificate>>(
      `/certificates/my/${id}`,
      data
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Xóa certificate
 */
export async function deleteCertificate(id: string): Promise<void> {
  try {
    await api.delete(`/certificates/my/${id}`);
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Upload certificate image (multipart/form-data, field: "file")
 */
export async function uploadCertificateImage(file: File): Promise<CertificateImage> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<ApiResponseDTO<CertificateImage>>(
      "/certificates/my/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Lấy danh sách certificates public của một MUA
 */
export async function getPublicCertificates(
  artistId: string,
  filters: CertificateFilters = {}
): Promise<PaginatedCertificates> {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.sort) params.append("sort", filters.sort);

    const res = await api.get<ApiResponseDTO<PaginatedCertificates>>(
      `/certificates/public/${artistId}?${params.toString()}`
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}