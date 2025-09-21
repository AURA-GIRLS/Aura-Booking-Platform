import { api } from '@/config/api';
import type { ApiResponseDTO } from '../types/common.dtos';
import type {
    CreatePostDTO,
    UpdatePostDTO,
    PostResponseDTO,
    ReactionDTO,
    ReactionResponseDTO,
    CommentResponseDTO,
} from '../types/community.dtos';

export const CommunityService = {
    async createPost(data: CreatePostDTO): Promise<ApiResponseDTO<PostResponseDTO>> {
        try {
            const res = await api.post<ApiResponseDTO<PostResponseDTO>>('/community/posts', data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async listPosts(params?: {
        page?: number;
        limit?: number;
        authorId?: string;
        tag?: string;
        status?: string;
        q?: string;
    }): Promise<
        ApiResponseDTO<{
            items: PostResponseDTO[];
            total: number;
            page: number;
            pages: number;
        }>
    > {
        try {
            const res = await api.get<
                ApiResponseDTO<{ items: PostResponseDTO[]; total: number; page: number; pages: number }>
            >('/community/posts', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getPostById(postId: string): Promise<ApiResponseDTO<PostResponseDTO>> {
        try {
            const res = await api.get<ApiResponseDTO<PostResponseDTO>>(`/community/posts/${postId}`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async updatePost(postId: string, data: UpdatePostDTO): Promise<ApiResponseDTO<PostResponseDTO>> {
        try {
            const res = await api.put<ApiResponseDTO<PostResponseDTO>>(`/community/posts/${postId}`, data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async deletePost(postId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.delete<ApiResponseDTO>(`/community/posts/${postId}`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async like(data: Omit<ReactionDTO, 'userId'> & { userId?: string }): Promise<ApiResponseDTO<ReactionResponseDTO>> {
        try {
            const res = await api.post<ApiResponseDTO<ReactionResponseDTO>>('/community/reactions/like', data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async unlike(data: Omit<ReactionDTO, 'userId'> & { userId?: string }): Promise<ApiResponseDTO> {
        try {
            const res = await api.post<ApiResponseDTO>('/community/reactions/unlike', data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getMyLikedPosts(postIds?: string[]): Promise<ApiResponseDTO<string[]>> {
        try {
            const params: any = postIds?.length ? { postIds: postIds.join(',') } : {};
            const res = await api.get<ApiResponseDTO<string[]>>('/community/reactions/my-liked-posts', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

     async getMyLikedComments(commentIds?: string[]): Promise<ApiResponseDTO<string[]>> {
        try {
            const params: any = commentIds?.length ? { commentIds: commentIds.join(',') } : {};
            const res = await api.get<ApiResponseDTO<string[]>>('/community/reactions/my-liked-comments', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async listCommentsByPost(postId: string, params?: { page?: number; limit?: number }): Promise<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>> {
        try {
            const res = await api.get<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>>(`/community/posts/${postId}/comments`, { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },
};