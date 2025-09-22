import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { CommunityController } from "@controllers/community.controller";

const router = Router();
const controller = new CommunityController();

// Posts
router.post("/posts",authenticateToken, (req, res) => controller.createPost(req, res));
router.get("/posts", (req, res) => controller.listPosts(req, res));
router.get("/posts/:id", (req, res) => controller.getPostById(req, res));
router.get("/posts/:id/comments", (req, res) => controller.listCommentsByPost(req, res));
router.put("/posts/:id", authenticateToken, (req, res) => controller.updatePost(req, res));
router.delete("/posts/:id", authenticateToken, (req, res) => controller.deletePost(req, res));

// Tags
router.get("/tags", (req, res) => controller.getAllTags(req, res));
router.get("/tags/trending", (req, res) => controller.getTrendingTags(req, res));
router.get("/tags/:tag/posts", (req, res) => controller.getPostsByTag(req, res));

// Reactions
router.post("/reactions/like", authenticateToken, (req, res) => controller.like(req, res));
router.post("/reactions/unlike", authenticateToken, (req, res) => controller.unlike(req, res));
router.get("/reactions/my-liked-posts", authenticateToken, (req, res) => controller.getMyLikedPosts(req, res));
router.get("/reactions/my-liked-comments", authenticateToken, (req, res) => controller.getMyLikedComments(req, res));

// Social: follow/unfollow and user wall
router.post("/users/:id/follow", authenticateToken, (req, res) => controller.followUser(req, res));
router.post("/users/:id/unfollow", authenticateToken, (req, res) => controller.unfollowUser(req, res));
router.get("/users/:id/wall", (req, res) => controller.getUserWall(req, res));
router.get("/users/:id/following", (req, res) => controller.getFollowing(req, res));
router.get("/users/:id/is-following", authenticateToken, (req, res) => controller.isFollowing(req, res));

router.get("/muas/top-active", (req, res) => controller.getTopActiveMuas(req, res));
router.get("/users/following-user", authenticateToken, (req, res) => controller.getFollowingUsers(req, res));
router.get("/feed/following-users", authenticateToken, (req, res) => controller.getPostsByFollowingUsers(req, res));
export default router;