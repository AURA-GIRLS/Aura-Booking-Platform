// ===== SERVICE DTOs =====
export interface CreateServiceDTO {
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface ServiceResponseDTO {
  _id: string;
  muaId: string;
  muaName: string;
  muaAvatarUrl?: string;
  name: string;
  description: string;
  category?: string;
  imageUrl?: string;
  images?: string[];
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
