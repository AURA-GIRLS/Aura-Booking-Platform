import { api } from "@/config/api";
import type { ApiResponseDTO } from "@/types/common.dtos";
import type {
  Portfolio,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  PortfolioFilters,
  PaginatedPortfolios,
  PortfolioImage,
} from "@/types/portfolio";

/**
 * Lấy danh sách portfolio của MUA hiện tại
 */
export async function getMyPortfolios(
  filters: PortfolioFilters = {}
): Promise<PaginatedPortfolios> {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    if (filters.tags) params.append("tags", filters.tags);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.q) params.append("q", filters.q);

    const res = await api.get<ApiResponseDTO<PaginatedPortfolios>>(
      `/portfolios/my?${params.toString()}`
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Lấy chi tiết portfolio theo ID
 */
export async function getPortfolioById(id: string): Promise<Portfolio> {
  try {
    const res = await api.get<ApiResponseDTO<Portfolio>>(`/portfolios/my/${id}`);
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Tạo portfolio mới
 */
export async function createPortfolio(
  data: CreatePortfolioInput
): Promise<Portfolio> {
  try {
    const res = await api.post<ApiResponseDTO<Portfolio>>("/portfolios/my", data);
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Cập nhật portfolio
 */
export async function updatePortfolio(
  id: string,
  data: UpdatePortfolioInput
): Promise<Portfolio> {
  try {
    const res = await api.patch<ApiResponseDTO<Portfolio>>(
      `/portfolios/my/${id}`,
      data
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Xóa portfolio
 */
export async function deletePortfolio(id: string): Promise<void> {
  try {
    await api.delete(`/portfolios/my/${id}`);
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Upload a single portfolio image (multipart/form-data, field: "file")
 */
export async function uploadPortfolioImage(file: File): Promise<PortfolioImage> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<ApiResponseDTO<PortfolioImage>>(
      "/portfolios/my/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data!;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

/**
 * Lấy danh sách portfolio của nghệ sĩ
 */
export async function getPublicPortfolios(
  artistId: string,
  filters: PortfolioFilters = {}
): Promise<PaginatedPortfolios> {
  try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.category) params.append("category", filters.category);
      if (filters.tags) params.append("tags", filters.tags);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.q) params.append("q", filters.q);
  
      const res = await api.get<ApiResponseDTO<PaginatedPortfolios>>(
        `/portfolios/public/${artistId}?${params.toString()}`
      );
      return res.data.data!;
    } catch (error: any) {
      throw error.response?.data || error;
    }
}
