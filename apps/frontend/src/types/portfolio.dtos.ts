import { 
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory
} from "../constants/index";

// ===== PORTFOLIO DTOs =====
export interface CreatePortfolioDTO {
  artistId: string;
  title: string;
  description?: string;
  imageUrls: string[];
  category?: PortfolioCategory;
  tags?: string[];
}

export interface UpdatePortfolioDTO {
  title?: string;
  description?: string;
  imageUrls?: string[];
  category?: PortfolioCategory;
  tags?: string[];
}

export interface PortfolioResponseDTO {
  _id: string;
  artistId: string;
  title: string;
  description?: string;
  imageUrls: string[];
  category?: PortfolioCategory;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== PORTFOLIO MEDIA DTOs =====
export interface CreatePortfolioMediaDTO {
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  displayOrder?: number;
  category?: PortfolioCategory;
}

export interface UpdatePortfolioMediaDTO {
  mediaType?: 'IMAGE' | 'VIDEO';
  url?: string;
  caption?: string;
  displayOrder?: number;
  category?: PortfolioCategory;
}

export interface PortfolioMediaResponseDTO {
  _id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  displayOrder: number;
  category?: PortfolioCategory;
}
