
export type SortKey = "rating_desc" | "price_asc" | "price_desc" | "newest" | "popular";

// Service Add-ons (matching backend)
export type ServiceAddon = 
  | 'HAIR_STYLING'
  | 'FALSE_LASHES' 
  | 'SKINCARE_PREP'
  | 'PHOTOGRAPHY'
  | 'NAIL_ART'
  | 'EYEBROW_SHAPING'
  | 'CONTOURING'
  | 'AIRBRUSH';

// Service preview for artist cards (max 2 services)
export interface ServicePreview {
  _id: string;
  name: string;
  price: number;
  benefits?: string[];
  addons?: ServiceAddon[];
  images?: string[];
}

// Updated Artist type with service preview
export interface Artist {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  experienceYears?: number;
  ratingAverage: number;
  feedbackCount: number;
  bookingCount: number;
  isVerified: boolean;
  minPrice?: number;
  
  // Service preview (max 2 services for list view)
  services?: ServicePreview[];
  totalServices?: number;
}

// API Response format (flat JSON as requested)
export interface ApiResp {
  items: Artist[];
  total: number;
  pages: number;
  page: number;
}

// Full service details
export interface ServiceDetail {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  addons?: ServiceAddon[];
  benefits?: string[];
  images?: string[];
  isAvailable: boolean;
  bookingCount: number;
  createdAt: string;
}

// Services API response
export interface ServicesApiResp {
  items: ServiceDetail[];
  total: number;
  pages: number;
  page: number;
}

// Artist detail (for individual artist page)
export interface ArtistDetail {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  experienceYears?: number;
  ratingAverage: number;
  feedbackCount: number;
  bookingCount: number;
  isVerified: boolean;
  minPrice?: number;
  totalServices?: number;
}

// Portfolio item
export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  media?: Array<{
    url: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption?: string;
  }>;
  createdAt?: Date;
}

// Certificate
export interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  imageUrl?: string;
}

// Comprehensive artist detail response (what the component expects)
export interface ArtistDetailDTO {
  artist: ArtistDetail;
  services: ServiceDetail[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
}
