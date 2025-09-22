import { Router } from "express";
import { authenticateToken } from "middleware/auth.middleware";
import { DashboardController } from "@controllers/dashboard.controller";

const router = Router();
const ctrl = new DashboardController();

// Dashboard - Summary & Recent bookings for MUA
router.get("/mua/:muaId/summary", authenticateToken, (req, res) => ctrl.getMuaSummary(req, res));
router.get("/mua/:muaId/recent", authenticateToken, (req, res) => ctrl.getMuaRecent(req, res));

export default router;
