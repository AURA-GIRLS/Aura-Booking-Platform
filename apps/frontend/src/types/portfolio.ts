import type { PortfolioCategory } from "../constants/index";
export type { PortfolioCategory } from "../constants/index";

// Portfolio Image interface
export interface PortfolioImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

// Portfolio response từ backend
export interface Portfolio {
  _id: string;
  muaId: string;
  title: string;
  description?: string;
  tags: string[];
  images: PortfolioImage[];
  category?: PortfolioCategory;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  stats?: {
    likes?: number;
    views?: number;
  };
}

// Create portfolio DTO
export interface CreatePortfolioInput {
  title: string;
  description?: string;
  tags?: string[];
  images: PortfolioImage[];
  category?: PortfolioCategory;
  isPublished?: boolean;
}

// Update portfolio DTO
export interface UpdatePortfolioInput {
  title?: string;
  description?: string;
  tags?: string[];
  images?: PortfolioImage[];
  category?: PortfolioCategory;
  isPublished?: boolean;
}

// Filters cho danh sách portfolio
export interface PortfolioFilters {
  category?: string;
  tags?: string;  
  q?: string;
  sort?: 'newest' | 'alphabetical' | 'oldest'; 
  page?: number;
  limit?: number;
}

// Paginated response
export interface PaginatedPortfolios {
  data: Portfolio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
