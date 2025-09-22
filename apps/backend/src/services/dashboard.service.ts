import mongoose from "mongoose";
import { Booking } from "models/bookings.models";
import { MUA } from "@models/muas.models";
import { BOOKING_STATUS } from "constants/index";
import type { BookingResponseDTO } from "types/booking.dtos";
import { formatBookingResponse } from "./booking.service";

export async function getMuaDashboardSummary(muaId: string): Promise<{
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}> {
  try {
    const [totalBookings, pendingBookings, confirmedBookings, completedBookings, revenueAgg, muaDoc] = await Promise.all([
      Booking.countDocuments({ muaId }),
      Booking.countDocuments({ muaId, status: BOOKING_STATUS.PENDING }),
      Booking.countDocuments({ muaId, status: BOOKING_STATUS.CONFIRMED }),
      Booking.countDocuments({ muaId, status: BOOKING_STATUS.COMPLETED }),
      Booking.aggregate([
        { $match: { muaId: new mongoose.Types.ObjectId(muaId), status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$totalPrice", 0] } } } }
      ]),
      MUA.findById(muaId).lean()
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;
    const averageRating = (muaDoc as any)?.ratingAverage || 0;
    const totalReviews = (muaDoc as any)?.feedbackCount || 0;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue,
      averageRating,
      totalReviews,
    };
  } catch (error) {
    throw new Error(`Failed to get MUA dashboard summary: ${error}`);
  }
}

export async function getRecentBookingsByMUA(
  muaId: string,
  limit: number = 5
): Promise<BookingResponseDTO[]> {
  try {
    const bookings = await Booking.find({ muaId })
      .populate("customerId serviceId")
      .sort({ bookingDate: -1 })
      .limit(limit)
      .exec();

    return bookings.map((b) => formatBookingResponse(b));
  } catch (error) {
    throw new Error(`Failed to get recent bookings for MUA: ${error}`);
  }
}
