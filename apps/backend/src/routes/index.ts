import { Router } from 'express';
import authRoutes from './auth';
import artistsRoutes from "./artists";
const router = Router();

// API routes
router.get('/', (req, res) => {
  res.json({ 
    message: 'AURA API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use("/artists", artistsRoutes);
export default router;
