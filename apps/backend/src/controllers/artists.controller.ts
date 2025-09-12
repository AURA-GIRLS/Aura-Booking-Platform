// apps/backend/src/controllers/artists.controller.ts
import type { Request, Response } from "express";
import { getArtists, ArtistsService } from "../services/artists.service";
import type { ListArtistsQueryDTO } from "../types/artists.dtos";
import { computeFinalSlots, getOriginalWorkingSlots, getRawWeeklySlots } from "@services/schedule.service";

export class ArtistsController {
  private artistsService = new ArtistsService();

  async list(req: Request, res: Response): Promise<void> {
    try {
      const {
        q = "",
        location = "",
        occasion = "",
        style = "",
        ratingMin,
        priceMin,
        priceMax,
        sort = "rating_desc",
        page = "1",
        limit = "12",
      } = req.query as Record<string, string>;

      const query: ListArtistsQueryDTO = {
        q,
        location,
        occasion,
        style,
        ratingMin: ratingMin ? Number(ratingMin) : undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        sort: sort as any,
        page: Number(page),
        limit: Number(limit),
      };

      const data = await getArtists(query);

      res.status(200).json({
        status: 200,
        success: true,
        message: "OK",
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch artists",
      });
    }
  }

  async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.artistsService.getDetail(id);

      if (!data) {
        res.status(404).json({
          success: false,
          message: "Artist not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch artist detail",
      });
    }
  }

  async getArtistWeeklyFinalSlots(req: Request, res: Response) {
  const { muaId } = req.params;
  const { weekStart } = req.query;
  if (!weekStart) return res.status(400).json({ message: "weekStart is required" });
  try {
    const data = await getRawWeeklySlots(muaId, weekStart as string);
    const result = await computeFinalSlots(data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
}

 async getArtistWeeklyOriginalSlots(req: Request, res: Response) {
  const { muaId } = req.params;
  const { weekStart } = req.query;
  if (!weekStart) return res.status(400).json({ message: "weekStart is required" });

  try {
    const data = await getOriginalWorkingSlots(muaId, weekStart as string);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
}
}
