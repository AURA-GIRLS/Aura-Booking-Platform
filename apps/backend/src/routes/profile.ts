import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();
const ctrl = new ProfileController();
const upload = multer({ dest: 'tmp/' });

// Upload avatar (multipart/form-data) - field name: "avatar"
router.post('/avatar', authenticateToken, upload.single('avatar'), (req, res) => ctrl.uploadAvatar(req, res));

export default router;
