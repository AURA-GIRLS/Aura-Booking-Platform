import { Router } from "express";
import { ArtistsController } from "../controllers/artists.controller";
import { authenticateToken } from "middleware/auth.middleware";

const router = Router();
const ctrl = new ArtistsController();

router.get("/", (req, res) => ctrl.list(req, res));
router.get("/:id", (req, res) => ctrl.getDetail(req, res));
router.get("/:muaId/week/final", authenticateToken, (req, res) => ctrl.getArtistWeeklyFinalSlots(req, res));
router.get("/:muaId/week/original", authenticateToken, (req, res) => ctrl.getArtistWeeklyOriginalSlots(req, res));


export default router;
