import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { CommunityController } from "@controllers/community.controller";

const router = Router();
const controller = new CommunityController();

// Posts
router.post("/posts", authenticateToken, (req, res) => controller.createPost(req, res));
router.get("/posts", (req, res) => controller.listPosts(req, res));
router.get("/posts/:id", (req, res) => controller.getPostById(req, res));
router.get("/posts/:id/comments", (req, res) => controller.listCommentsByPost(req, res));
router.put("/posts/:id", authenticateToken, (req, res) => controller.updatePost(req, res));
router.delete("/posts/:id", authenticateToken, (req, res) => controller.deletePost(req, res));

// Reactions
router.post("/reactions/like", authenticateToken, (req, res) => controller.like(req, res));
router.post("/reactions/unlike", authenticateToken, (req, res) => controller.unlike(req, res));
router.get("/reactions/my-liked-posts", authenticateToken, (req, res) => controller.getMyLikedPosts(req, res));
router.get("/reactions/my-liked-comments", authenticateToken, (req, res) => controller.getMyLikedComments(req, res));
router.get("/reactions/my-liked-comments", authenticateToken, (req, res) => controller.getMyLikedComments(req, res));

export default router;