import mongoose from "mongoose";
import { MUA } from "../models/muas.models";
import { ServicePackage } from "../models/services.models";
import { Portfolio, Certificate } from "../models/portfolios.models";
import { mapServiceDoc, mapPortfolioDoc, mapCertificateDoc } from "../mappers/artist.mappers";
import { toU, toDateU, toNumberOr } from "../utils/normalize";
import type {
  ListArtistsQueryDTO,
  ListArtistsDataDTO,
  SortKey,
  ArtistDetailDTO,
} from "../types/artists.dtos";

/* =========================================
   LIST ARTISTS (lọc / sắp xếp / phân trang)
   ========================================= */
export async function getArtists(query: ListArtistsQueryDTO): Promise<ListArtistsDataDTO> {
  const {
    q = "",
    location = "",
    occasion = "",
    style = "",
    ratingMin,
    priceMin,
    priceMax,
    sort = "rating_desc",
    page = 1,
    limit = 12,
  } = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));

  const pipeline: any[] = [];
  const $and: any[] = [];

  // 1) Match cơ bản theo MUA
  if (location) $and.push({ location: { $regex: new RegExp(location, "i") } });
  if (typeof ratingMin === "number") $and.push({ ratingAverage: { $gte: ratingMin } });
  if ($and.length) pipeline.push({ $match: { $and } });

  // 2) Join user (để lấy fullName/avatar + search theo tên)
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  );

  // 3) Search q theo bio hoặc tên user
  if (q) {
    const rx = new RegExp(q, "i");
    pipeline.push({
      $match: {
        $or: [
          { bio: { $regex: rx } },
          { "user.fullName": { $regex: rx } },
          { "user.name": { $regex: rx } },
          { "user.username": { $regex: rx } },
        ],
      },
    });
  }

  // 4) Tính minPrice từ ServicePackage
  pipeline.push(
    {
      $lookup: {
        from: "servicepackages",
        localField: "_id",
        foreignField: "muaId",
        as: "services",
      },
    },
    { $addFields: { minPrice: { $min: "$services.price" } } },
  );

  // 5) Lọc theo minPrice
  if (typeof priceMin === "number" || typeof priceMax === "number") {
    const priceMatch: any = {};
    if (typeof priceMin === "number") priceMatch.$gte = priceMin;
    if (typeof priceMax === "number") priceMatch.$lte = priceMax;
    pipeline.push({ $match: { minPrice: priceMatch } });
  }

  // 6A) occasion (dịp) → match Portfolio.category theo code
  if (occasion && occasion.trim() && occasion.toLowerCase() !== "all") {
    const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const OCC_MAP: Record<string, string> = {
      bridal: "BRIDAL",
      party: "PARTY",
      glam: "GLAM",
      casual: "CASUAL", // nếu có dùng CASUAL
    };
    const occCode = OCC_MAP[norm(occasion)] ?? occasion;

    pipeline.push(
      {
        $lookup: {
          from: "portfolios",
          let: { mid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$muaId", "$$mid"] } } },
            { $match: { category: occCode } },
            { $limit: 1 },
          ],
          as: "occPort",
        },
      },
      { $match: { occPort: { $ne: [] } } },
    );
  }

  // 6B) style (tone - free-text) → match portfolio + services bằng regex
  if (style && style.trim()) {
    const rx = new RegExp(String(style).trim(), "i");

    pipeline.push(
      {
        $lookup: {
          from: "portfolios",
          let: { mid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$muaId", "$$mid"] } } },
            {
              $match: {
                $or: [
                  { tags: { $elemMatch: { $regex: rx } } },
                  { title: { $regex: rx } },
                  { description: { $regex: rx } },
                  { category: { $regex: rx } }, // nếu muốn cho phép style khớp category text
                ],
              },
            },
            { $limit: 1 },
          ],
          as: "stylePort",
        },
      },
      {
        $match: {
          $or: [
            { stylePort: { $ne: [] } },
            { "services.name": { $regex: rx } },
            { "services.description": { $regex: rx } },
          ],
        },
      }
    );
  }

  // 7) Project
  pipeline.push({
    $project: {
      _id: 1,
      "user.fullName": 1,
      "user.avatarUrl": 1,
      bio: 1,
      location: 1,
      ratingAverage: 1,
      bookingCount: 1,
      minPrice: 1,
    },
  });

  // 8) Sort
  const sortMap = {
    price_asc:  { minPrice: 1 as const,  ratingAverage: -1 as const, _id: 1 as const },
    price_desc: { minPrice: -1 as const, ratingAverage: -1 as const, _id: 1 as const },
    newest:     { _id: -1 as const },
    popular:    { bookingCount: -1 as const, ratingAverage: -1 as const },
    relevance:  { ratingAverage: -1 as const, bookingCount: -1 as const },
    rating_desc:{ ratingAverage: -1 as const, bookingCount: -1 as const, _id: -1 as const },
  } satisfies Record<SortKey, Record<string, 1 | -1>>;
  pipeline.push({ $sort: sortMap[sort] ?? sortMap.rating_desc });

  // 9) Phân trang + tổng
  pipeline.push(
    {
      $facet: {
        items: [{ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }],
        total: [{ $count: "count" }],
      },
    },
    {
      $project: {
        items: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
      },
    },
  );

  const [agg] = await MUA.aggregate(pipeline).exec();
  const docs = agg?.items ?? [];
  const total = agg?.total ?? 0;

  const items = docs.map((doc: any) => ({
    id: doc._id?.toString(),
    fullName: doc.user?.fullName || "Makeup Artist",
    avatarUrl: doc.user?.avatarUrl || null,
    bio: doc.bio || "",
    location: doc.location || "",
    ratingAverage: doc.ratingAverage || 0,
    bookingCount: doc.bookingCount || 0,
    ratePerHour: typeof doc.minPrice === "number" ? doc.minPrice : null,
  }));

  return {
    items,
    total,
    page: pageNum,
    pages: Math.max(1, Math.ceil(total / limitNum)),
    limit: limitNum,
  };
}

/* =========================================
   GET DETAIL (portfolio + services + certs)
   ========================================= */
export class ArtistsService {
  async getDetail(id: string): Promise<ArtistDetailDTO | null> {
    // Validate ObjectId, return null if invalid
    if (!mongoose.isValidObjectId(id)) return null;
    const _id = new mongoose.Types.ObjectId(id);

    // Fetch MUA by _id and populate userId (fullName, avatarUrl)
    const muaDoc = await MUA.findById(_id)
      .populate({ path: "userId", model: "User", select: "fullName avatarUrl" })
      .lean();
    if (!muaDoc) return null;

    // Fetch service packages (isAvailable != false), sorted by price asc
    const services = await ServicePackage.find({ muaId: _id, isAvailable: { $ne: false } })
      .select("_id name description price duration isAvailable")
      .sort({ price: 1 })
      .lean();

    // Fetch portfolios (title/description/category/createdAt/media), sorted by createdAt desc
    const portfolios = await Portfolio.find({ muaId: _id })
      .select("_id title description category createdAt media")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch certificates (title/issuer/description/issueDate/expireDate/imageUrl), sorted by issueDate desc
    const certificates = await Certificate.find({ muaId: _id })
      .select("_id title issuer description issueDate expireDate imageUrl")
      .sort({ issueDate: -1 })
      .lean();

    // Map all docs to DTO using mappers
    return {
      artist: {
        id: String(muaDoc._id),
        fullName: toU((muaDoc as any)?.userId?.fullName),
        avatarUrl: toU((muaDoc as any)?.userId?.avatarUrl),
        bio: toU(muaDoc.bio),
        location: toU(muaDoc.location),
        ratingAverage: toNumberOr(muaDoc.ratingAverage),
        bookingCount: toNumberOr(muaDoc.bookingCount),
        isVerified: Boolean(muaDoc.isVerified),
      },
      services: services.map(mapServiceDoc),
      portfolio: portfolios.map(mapPortfolioDoc),
      certificates: certificates.map(mapCertificateDoc),
    };
  }
}