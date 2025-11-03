import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { UserController } from "../controllers/user.controller";

const router = Router();
const controller = new UserController();

// Upload via public URL
router.get('/:id', authenticateToken, (req, res) => controller.getUserById(req, res));

export default router;
