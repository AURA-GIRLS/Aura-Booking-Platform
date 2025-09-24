import { api } from '@/config/api'

// Define the expected response structure for summary
interface Review {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewerName: string;
    reviewerAvatarUrl?: string;
}

interface FeedbackSummary {
    serviceId: string;
    serviceName: string;
    serviceImageUrl?: string;
    averageRating: number;
    reviewCount: number;
    reviews: Review[];
}

// Define the expected response structure for detailed reviews
interface PaginatedReviews {
    data: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Generic API response type
interface ApiResponse<T> {
    status: number;
    success: boolean;
    data: T;
}

class FeedbackService {
    // Fetches the summary of feedback for all services of a MUA
    async getFeedbackSummary(): Promise<ApiResponse<FeedbackSummary[]>> {
        const response = await api.get<ApiResponse<FeedbackSummary[]>>('/feedback/mua/summary');
        return response.data;
    }

    // Fetches detailed, paginated feedback for a specific service
    async getFeedbackForService(serviceId: string, page: number, limit: number): Promise<ApiResponse<PaginatedReviews>> {
        const response = await api.get<ApiResponse<PaginatedReviews>>(`/feedback/mua/service/${serviceId}`, {
            params: { page, limit },
        });
        return response.data;
    }
}

export const feedbackService = new FeedbackService();
