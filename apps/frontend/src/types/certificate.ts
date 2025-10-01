export interface CertificateImage {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
  }
  
  export interface Certificate {
    _id: string;
    muaId: string;
    title: string;
    issuer: string;
    description?: string;
    issueDate: string;
    expireDate?: string;
    image: CertificateImage;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateCertificateInput {
    title: string;
    issuer: string;
    description?: string;
    issueDate: string;
    expireDate?: string;
    image: CertificateImage;
  }
  
  export interface UpdateCertificateInput {
    title?: string;
    issuer?: string;
    description?: string;
    issueDate?: string;
    expireDate?: string;
    image?: CertificateImage;
  }
  
  export interface CertificateFilters {
    page?: number;
    limit?: number;
    sort?: string;
    q?: string;
  }
  
  export interface PaginatedCertificates {
    data: Certificate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }