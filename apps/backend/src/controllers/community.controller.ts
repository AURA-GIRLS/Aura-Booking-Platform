import type { Request, Response } from "express";
import { CommunityService } from "@services/community.service";
import type { ApiResponseDTO } from "../types";

export class CommunityController {
   
    private readonly service: CommunityService;

    constructor() {
        this.service = new CommunityService();
    }

    // POST /api/community/posts
    async createPost(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            const data = await this.service.createRealtimePost(userId, req.body);
            const response: ApiResponseDTO = { success: true, data };
            res.status(201).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : "Failed to create post",
            };
            res.status(400).json(response);
        }
    }

    // GET /api/community/posts
    async listPosts(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, authorId, tag, status, q } = req.query as any;
            const data = await this.service.listPosts({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                authorId: authorId as string,
                tag: tag as string,
                status: status as string,
                q: q as string,
            });
            const response: ApiResponseDTO = {
                success: true,
                data: {
                    items: data.items,
                    total: data.total,
                    page: data.page,
                    pages: data.pages,
                },
            };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : "Failed to list posts",
            };
            res.status(500).json(response);
        }
    }

    // GET /api/community/posts/:id
    async getPostById(req: Request, res: Response): Promise<void> {
        try {
            const data = await this.service.getPostById(req.params.id);
            const response: ApiResponseDTO = { success: true, data };
            res.status(200).json(response);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to get post";
            const status = message === "Post not found" ? 404 : 500;
            const response: ApiResponseDTO = { success: false, message };
            res.status(status).json(response);
        }
    }

    // GET /api/community/posts/:id/comments
    async listCommentsByPost(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit } = req.query as any;
            const data = await this.service.listCommentsByPost(req.params.id, {
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            const response: ApiResponseDTO = {
                success: true,
                data: {
                    items: data.items,
                    total: data.total,
                    page: data.page,
                    pages: data.pages,
                },
            };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : "Failed to list comments",
            };
            res.status(500).json(response);
        }
    }

    // PATCH /api/community/posts/:id
    async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            const data = await this.service.updateRealtimePost(req.params.id, userId, req.body);
            const response: ApiResponseDTO = { success: true, data };
            res.status(200).json(response);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update post";
            let status = 400;
            if (message === "Post not found") status = 404;
            else if (message === "Forbidden") status = 403;
            const response: ApiResponseDTO = { success: false, message };
            res.status(status).json(response);
        }
    }

    // DELETE /api/community/posts/:id
    async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            await this.service.deleteRealtimePost(req.params.id, userId);
            const response: ApiResponseDTO = { success: true };
            res.status(200).json(response);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete post";
            let status = 400;
            if (message === "Post not found") status = 404;
            else if (message === "Forbidden") status = 403;
            const response: ApiResponseDTO = { success: false, message };
            res.status(status).json(response);
        }
    }

    // POST /api/community/reactions/like
    async like(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            const data = await this.service.like({ ...req.body, userId });
            const response: ApiResponseDTO = { success: true, data };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : "Failed to like",
            };
            res.status(400).json(response);
        }
    }

    // POST /api/community/reactions/unlike
    async unlike(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            await this.service.unlike({ ...req.body, userId });
            const response: ApiResponseDTO = { success: true };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : "Failed to unlike",
            };
            res.status(400).json(response);
        }
    }

    // GET /api/community/reactions/my-liked-posts
    async getMyLikedPosts(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            const postIdsParam = (req.query.postIds as string) || '';
            const postIds = postIdsParam ? postIdsParam.split(',').filter(Boolean) : undefined;
            const data = await this.service.listMyLikedPostIds(userId, postIds);
            const response: ApiResponseDTO = { success: true, data };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : 'Failed to get liked posts',
            };
            res.status(500).json(response);
        }
    }
    // GET /api/community/reactions/my-liked-comments
    async getMyLikedComments(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId as string;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized" } as ApiResponseDTO);
                return;
            }
            const commentIdsParam = (req.query.commentIds as string) || '';
            const commentIds = commentIdsParam ? commentIdsParam.split(',').filter(Boolean) : undefined;
            const data = await this.service.listMyLikedCommentIds(userId, { commentIds });
            const response: ApiResponseDTO = { success: true, data };
            res.status(200).json(response);
        } catch (err) {
            const response: ApiResponseDTO = {
                success: false,
                message: err instanceof Error ? err.message : 'Failed to get liked comments',
            };
            res.status(500).json(response);
        }
    }
}