import { Router } from 'express';
import authRoutes from './auth';
import artistsRoutes from "./artists";
import artistScheduleRoutes from "./artist-schedule";
import bookingRoutes from "./booking";
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
router.use("/artist-schedule", artistScheduleRoutes);
router.use("/booking",bookingRoutes);

export default router;
