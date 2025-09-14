import { Router } from 'express';
import { ArtistsController } from '../controllers/artists.controller';

const router = Router();
const artistsController = new ArtistsController();

// Public routes (no authentication required)
router.get('/', artistsController.getArtists.bind(artistsController));
router.get('/:id', artistsController.getArtistById.bind(artistsController));
router.get('/:id/detail', artistsController.getArtistDetail.bind(artistsController));
router.get('/:id/services', artistsController.getArtistServices.bind(artistsController));
router.get('/:id/portfolio', artistsController.getArtistPortfolio.bind(artistsController));

// Booking route (TODO: add authentication middleware when ready)
router.post('/bookings', artistsController.createBooking.bind(artistsController));

export default router;
