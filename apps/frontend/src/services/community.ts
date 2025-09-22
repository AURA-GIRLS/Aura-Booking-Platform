import { api } from '@/config/api';
import type { ApiResponseDTO } from '../types/common.dtos';
import type {
    CreatePostDTO,
    UpdatePostDTO,
    PostResponseDTO,
    CreateCommentDTO,
    UpdateCommentDTO,
    ReactionDTO,
    ReactionResponseDTO,
    CommentResponseDTO,
    TagResponseDTO,
    UserWallResponseDTO,
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
        sort?: 'newest' | 'popular' | string;
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

    // Comments CRUD
    async createComment(data: CreateCommentDTO): Promise<ApiResponseDTO<CommentResponseDTO>> {
        try {
            const res = await api.post<ApiResponseDTO<CommentResponseDTO>>('/community/comments', data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getCommentById(commentId: string): Promise<ApiResponseDTO<CommentResponseDTO>> {
        try {
            const res = await api.get<ApiResponseDTO<CommentResponseDTO>>(`/community/comments/${commentId}`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async updateComment(commentId: string, data: UpdateCommentDTO): Promise<ApiResponseDTO<CommentResponseDTO>> {
        try {
            const res = await api.patch<ApiResponseDTO<CommentResponseDTO>>(`/community/comments/${commentId}`, data);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async deleteComment(commentId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.delete<ApiResponseDTO>(`/community/comments/${commentId}`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async listRepliesByComment(commentId: string, params?: { page?: number; limit?: number }): Promise<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>> {
        try {
            const res = await api.get<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>>(`/community/comments/${commentId}/replies`, { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async listCommentsByUser(userId: string, params?: { page?: number; limit?: number }): Promise<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>> {
        try {
            const res = await api.get<ApiResponseDTO<{ items: CommentResponseDTO[]; total: number; page: number; pages: number }>>(`/community/users/${userId}/comments`, { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    // Tags
    async getTrendingTags(limit?: number): Promise<ApiResponseDTO<TagResponseDTO[]>> {
        try {
            const params = typeof limit === 'number' ? { limit } : undefined;
            const res = await api.get<ApiResponseDTO<TagResponseDTO[]>>('/community/tags/trending', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getAllTags(): Promise<ApiResponseDTO<TagResponseDTO[]>> {
        try {
            const res = await api.get<ApiResponseDTO<TagResponseDTO[]>>('/community/tags');
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getPostsByTag(tag: string, params?: { page?: number; limit?: number }): Promise<ApiResponseDTO<{ items: PostResponseDTO[]; total: number; page: number; pages: number }>> {
        try {
            const res = await api.get<ApiResponseDTO<{ items: PostResponseDTO[]; total: number; page: number; pages: number }>>(`/community/tags/${encodeURIComponent(tag)}/posts`, { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    // Social
    async followUser(userId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.post<ApiResponseDTO>(`/community/users/${encodeURIComponent(userId)}/follow`, {});
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async unfollowUser(userId: string): Promise<ApiResponseDTO> {
        try {
            const res = await api.post<ApiResponseDTO>(`/community/users/${encodeURIComponent(userId)}/unfollow`, {});
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getUserWall(userId: string): Promise<ApiResponseDTO<UserWallResponseDTO>> {
        try {
            const res = await api.get<ApiResponseDTO<UserWallResponseDTO>>(`/community/users/${encodeURIComponent(userId)}/wall`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async getFollowing(userId: string): Promise<ApiResponseDTO<string[]>> {
        try {
            const res = await api.get<ApiResponseDTO<string[]>>(`/community/users/${encodeURIComponent(userId)}/following`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    async isFollowing(targetUserId: string): Promise<ApiResponseDTO<boolean>> {
        try {
            const res = await api.get<ApiResponseDTO<boolean>>(`/community/users/${encodeURIComponent(targetUserId)}/is-following`);
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    // MUAs and social discovery
    async getTopActiveMuas(limit?: number): Promise<ApiResponseDTO<UserWallResponseDTO[]>> {
        try {
            const params = typeof limit === 'number' ? { limit } : undefined;
            const res = await api.get<ApiResponseDTO<UserWallResponseDTO[]>>('/community/muas/top-active', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    // Following of current user (auth required on backend)
    async getFollowingUsers(limit?: number): Promise<ApiResponseDTO<UserWallResponseDTO[] | null>> {
        try {
            const params = typeof limit === 'number' ? { limit } : undefined;
            const res = await api.get<ApiResponseDTO<UserWallResponseDTO[] | null>>('/community/users/following-user', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },

    // Posts by users the current user is following (paginated)
    async getPostsByFollowingUsers(params?: { page?: number; limit?: number }): Promise<
        ApiResponseDTO<{ items: PostResponseDTO[]; total: number; page: number; pages: number }>
    > {
        try {
            const res = await api.get<ApiResponseDTO<{ items: PostResponseDTO[]; total: number; page: number; pages: number }>
            >('/community/feed/following-users', { params });
            return res.data;
        } catch (error: any) {
            throw error?.response?.data || error;
        }
    },
};