// ===== SERVICE DTOs =====
export interface CreateServiceDTO {
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export interface ServiceResponseDTO {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
