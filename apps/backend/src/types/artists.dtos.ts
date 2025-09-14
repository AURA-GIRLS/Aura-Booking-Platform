// apps/backend/src/types/artists.dtos.ts
export type SortKey = "relevance" | "rating_desc" | "price_asc" | "price_desc" | "newest" | "popular";
export type MediaType = "IMAGE" | "VIDEO";

//Hien list artists query
export interface ListArtistsQueryDTO {
  q?: string;
  location?: string;
  occasion?: string; 
  style?: string;    // "douyin", "tự nhiên"...
  ratingMin?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export interface ListArtistsDataDTO {
  items: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string;
    location: string;
    ratingAverage: number;
    bookingCount: number;
    ratePerHour: number | null; // minPrice
  }>;
  total: number;
  page: number;
  pages: number;
  limit: number;
}

//Hien artist portfolio detail
export type ArtistDetailDTO = {
  artist: { 
    id: string; 
    fullName?: string; 
    avatarUrl?: string; 
    bio?: string; 
    location?: string; 
    ratingAverage?: number; 
    bookingCount?: number; 
    isVerified?: boolean; 
  };
  services: { 
    id: string; 
    name?: string; 
    description?: string; 
    price?: number; 
    duration?: number; 
    isAvailable?: boolean; 
  }[];
  portfolio: { 
    id: string; 
    title?: string; 
    description?: string; 
    category?: string; 
    createdAt?: Date; 
    media: { 
      mediaType?: string; 
      url: string; 
      caption?: string; 
      displayOrder?: number; 
      category?: string; 
    }[] 
  }[];
  certificates: { 
    id: string; 
    title?: string; 
    issuer?: string; 
    description?: string; 
    issueDate?: Date; 
    expireDate?: Date; 
    imageUrl?: string; 
  }[];
};