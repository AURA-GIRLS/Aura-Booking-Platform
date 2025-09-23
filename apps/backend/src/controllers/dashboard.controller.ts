import type { Request, Response } from "express";
import type { ApiResponseDTO } from "types";
import { getMuaDashboardSummary, getRecentBookingsByMUA } from "@services/dashboard.service";

export class DashboardController {
  // GET /dashboard/mua/:muaId/summary
  async getMuaSummary(req: Request, res: Response): Promise<void> {
    try {
      const { muaId } = req.params;
      if (!muaId) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: "muaId is required",
        };
        res.status(400).json(response);
        return;
      }
      const data = await getMuaDashboardSummary(muaId);
      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: "MUA dashboard summary retrieved successfully",
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Failed to get MUA dashboard summary",
      };
      res.status(500).json(response);
    }
  }

  // GET /dashboard/mua/:muaId/recent?limit=5
  async getMuaRecent(req: Request, res: Response): Promise<void> {
    try {
      const { muaId } = req.params;
      const { limit = "5" } = req.query as Record<string, string>;
      if (!muaId) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: "muaId is required",
        };
        res.status(400).json(response);
        return;
      }
      const data = await getRecentBookingsByMUA(muaId, Number(limit));
      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: "MUA recent bookings retrieved successfully",
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Failed to get MUA recent bookings",
      };
      res.status(500).json(response);
    }
  }
}
