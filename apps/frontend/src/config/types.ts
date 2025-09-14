export interface Config {
  // Client
  port: number;

  publicAPI: string;

  googleClientId: string;
  
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}


export type SortKey = "relevance" | "rating_desc" | "price_asc" | "price_desc" | "newest" | "popular";

export type Artist = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  ratingAverage: number;
  bookingCount: number;
  ratePerHour: number | null;
};

export type ApiResp = { items: Artist[]; total: number; page: number; pages: number; limit: number };

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