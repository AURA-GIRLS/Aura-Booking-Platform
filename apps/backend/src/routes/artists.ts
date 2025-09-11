import { Router } from "express";
import { ArtistsController } from "../controllers/artists.controller";

const router = Router();
const ctrl = new ArtistsController();

router.get("/", (req, res) => ctrl.list(req, res));
router.get("/:id", (req, res) => ctrl.getDetail(req, res));
router.get("/:muaId/week", (req, res) => ctrl.getWeeklySlotsController(req, res));


export default router;
