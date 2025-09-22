import { api } from "@/config/api";
import { ApiResponseDTO } from "@/types/common.dtos";
import { ServiceResponseDTO } from "../types";
import { ApiResp, ArtistDetailDTO, ServiceAddon, ServicesApiResp, SortKey } from "@/types/artist.dto";
import { SERVICE_CATEGORIES, ServiceCategory } from "../constants";

export const ArtistService = {
  async getArtistServices(muaId: string): Promise<ApiResponseDTO<ServiceResponseDTO[]>> {
    try {
      const res = await api.get<ApiResponseDTO<ServiceResponseDTO[]>>(
        `/artists/${muaId}/services-package`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch artists with comprehensive filtering
   * Returns flat JSON response: { items, total, pages, page }
   */
  async fetchArtists(params: {
    q?: string;
    location?: string;
    occasion?: ServiceCategory;
    style?: string;
    rating?: number | null;
    priceMin?: number | undefined;
    priceMax?: number | undefined;
    addons?: ServiceAddon[];
    sort: SortKey;
    page: number;
    limit: number;
  }): Promise<ApiResp> {
    const qs = new URLSearchParams();

    // Basic search filters
    if (params.q) qs.set("q", params.q);
    if (params.location && params.location !== "All Areas")
      qs.set("location", params.location);

    // Service filters
    if (params.occasion && params.occasion !== SERVICE_CATEGORIES.ALL)
      qs.set("occasion", params.occasion.toLowerCase());
    if (params.style && params.style.trim()) qs.set("style", params.style.trim());

    // Rating and price filters
    if (typeof params.rating === "number") qs.set("rating", String(params.rating));
    if (typeof params.priceMin === "number")
      qs.set("priceMin", String(params.priceMin));
    if (typeof params.priceMax === "number")
      qs.set("priceMax", String(params.priceMax));

    // Add-ons filter (multiple values)
    if (params.addons && params.addons.length > 0) {
      params.addons.forEach((addon) => qs.append("addons", addon));
    }

    // Sorting and pagination
    qs.set("sort", params.sort);
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));

    try {
      const res = await api.get<ApiResp>(`/artists?${qs.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch services for a specific artist
   */
  async fetchArtistServices(
    artistId: string,
    params: {
      category?: string;
      q?: string;
      priceMin?: number;
      priceMax?: number;
      addons?: ServiceAddon[];
      sort?: SortKey;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ServicesApiResp> {
    const qs = new URLSearchParams();

    if (params.category) qs.set("category", params.category);
    if (params.q) qs.set("q", params.q);
    if (typeof params.priceMin === "number")
      qs.set("priceMin", String(params.priceMin));
    if (typeof params.priceMax === "number")
      qs.set("priceMax", String(params.priceMax));

    if (params.addons && params.addons.length > 0) {
      params.addons.forEach((addon) => qs.append("addons", addon));
    }

    if (params.sort) qs.set("sort", params.sort);
    qs.set("page", String(params.page || 1));
    qs.set("limit", String(params.limit || 12));

    try {
      const res = await api.get<ServicesApiResp>(
        `/artists/${artistId}/services?${qs.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch comprehensive artist details including services and portfolio
   */
  async fetchArtistDetail(id: string): Promise<ArtistDetailDTO> {
    try {
      const res = await api.get(`/artists/${id}/detail`);
      const json = res.data;

      // Transform the response to match expected structure
      return {
        artist: json.data.artist,
        services: json.data.services || [],
        portfolio: (json.data.portfolio || []).map((item: any) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          category: item.category,
          tags: item.tags,
          media: item.media,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        })),
        certificates: [], // TODO: Add when certificates are implemented
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch artist details: ${
          error.response?.data?.message ||
          (error instanceof Error ? error.message : "Unknown error")
        }`
      );
    }
  },

  /**
   * Format price to VND currency string
   */
  formatVND(price: number): string {
    return price.toLocaleString("vi-VN") + " VND";
  },
};
