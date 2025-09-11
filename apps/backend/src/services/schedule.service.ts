import { redisClient } from "../config/redis";
import { MUA_WorkingSlot, MUA_OverrideSlot, MUA_BlockedSlot } from "../models/muas.models";
import { Booking } from "@models/bookings.models";
import type { IWeeklySlot, ISlot } from "../types/schedule.interfaces";
import { toUTC } from "../utils/timeUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function sortSlots(slots: ISlot[]) {
  return slots.sort((a, b) => {
    const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

function mapSlot(slot: any, type: string): ISlot {
  return {
    slotId: slot._id?.toString?.() ?? "",
    day: dayjs(slot.date).format("ddd").toUpperCase(),
    startTime: slot.startTime,
    endTime: slot.endTime,
    type,
    note: slot.note || ""
  };
}


function mapBookingToSlot(booking: any): ISlot {
  const day = dayjs(booking.bookingDate).format("ddd").toUpperCase();
  const startTime = dayjs(booking.bookingDate).format("HH:mm");
  const endTime = dayjs(booking.bookingDate).add(booking.duration, "minutes").format("HH:mm");
  return {
    slotId: booking._id?.toString?.() ?? "",
    day,
    startTime,
    endTime,
    type: "booking",
    note: `Khách: ${booking.customerId?.name || ""}, Dịch vụ: ${booking.serviceId?.name || ""}`
  };
}

async function getWeeklySlotsFromDB(muaId: string, weekStart: string): Promise<ISlot[]> {
  const weekStartDate = toUTC(weekStart, "Asia/Ho_Chi_Minh");
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();

  const [working, override, blocked] = await Promise.all([
    MUA_WorkingSlot.find({ muaId, date: { $gte: weekStartDate, $lte: weekEndDate } }),
    MUA_OverrideSlot.find({ muaId, date: { $gte: weekStartDate, $lte: weekEndDate } }),
    MUA_BlockedSlot.find({ muaId, date: { $gte: weekStartDate, $lte: weekEndDate } }),
  ]);

  let slots: ISlot[] = [
    ...working.map((slot: any) => mapSlot(slot, "working")),
    ...override.map((slot: any) => mapSlot(slot, "override"))
  ];

  // Remove blocked slots
  slots = slots.filter(slot =>
    !blocked.some((b: any) =>
      dayjs(b.date).format("ddd").toUpperCase() === slot.day &&
      b.startTime === slot.startTime
    )
  );

  return slots;
}

async function getBookingSlots(muaId: string, weekStart: string): Promise<ISlot[]> {
  const weekStartDate = toUTC(weekStart, "Asia/Ho_Chi_Minh");
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();

  const bookings = await Booking.find({
    muaId,
    status: { $in: ["CONFIRMED", "COMPLETED"] },
    bookingDate: { $gte: weekStartDate, $lte: weekEndDate }
  }).populate("customerId serviceId");

  return bookings.map(mapBookingToSlot);
}

export async function getWeeklySlots(muaId: string, weekStart: string): Promise<IWeeklySlot> {
  const cacheKey = `weeklySlots:${muaId}:${weekStart}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Step 1: Lấy slots từ 3 loại slot
  const slots = await getWeeklySlotsFromDB(muaId, weekStart);

  // Step 2: Lấy booking slots
  const bookingSlots = await getBookingSlots(muaId, weekStart);

  // Step 3: Merge và sort
  const allSlots = sortSlots([...slots, ...bookingSlots]);

  const weekStartDate = toUTC(weekStart, "Asia/Ho_Chi_Minh");

  const result: IWeeklySlot = {
    muaId,
    weekStart: weekStartDate,
    slots: allSlots
  };

  await redisClient.set(cacheKey, JSON.stringify(result), { EX: 86400 });
  return result;
}   