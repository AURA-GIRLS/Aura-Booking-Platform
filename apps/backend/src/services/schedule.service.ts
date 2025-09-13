import { redisClient } from "../config/redis";
import { MUA_WorkingSlot, MUA_OverrideSlot, MUA_BlockedSlot } from "../models/muas.models";
import { Booking } from "@models/bookings.models";
import type { IWeeklySlot, ISlot, IFinalSlot } from "../types/schedule.interfaces";
import { toUTC, fromUTC } from "../utils/timeUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { SLOT_TYPES, type SlotType } from "constants/index";
import { BOOKING_STATUS } from "constants/index";

//---------------STAGE 1: Get and cache raw slots from DB/Redis--------
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function mapToSlot(
  slot: any,
  type: SlotType,
  weekStart?: string
): ISlot {
  let day: string;
  let startTime: string;
  let endTime: string;

  if (type === SLOT_TYPES.ORIGINAL_WORKING) {
    // Lấy thứ trong tuần
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const weekdayIdx = days.indexOf(slot.weekday);
    const slotDate = dayjs(weekStart).add(weekdayIdx, "day");

    day = slotDate.format("YYYY-MM-DD");
    startTime = slot.startTime ?? "";
    endTime = slot.endTime ?? "";
  } else if (type === SLOT_TYPES.OVERRIDE) {
    const localStartDate = fromUTC(slot.overrideStart, "Asia/Ho_Chi_Minh");
    const localEndDate = fromUTC(slot.overrideEnd, "Asia/Ho_Chi_Minh");

    day = localStartDate.format("YYYY-MM-DD");
    startTime = localStartDate.format("HH:mm");
    endTime = localEndDate.format("HH:mm");
  } else if (type === SLOT_TYPES.BLOCKED) {
    const localStartDate = fromUTC(slot.blockStart, "Asia/Ho_Chi_Minh");
    const localEndDate = fromUTC(slot.blockEnd, "Asia/Ho_Chi_Minh");

    day = localStartDate.format("YYYY-MM-DD");
    startTime = localStartDate.format("HH:mm");
    endTime = localEndDate.format("HH:mm");
  } else {
    throw new Error(`Unknown slot type: ${type}`);
  }

  return {
    slotId: slot._id?.toString?.() ?? "",
    day,
    startTime,
    endTime,
    type,
    note: slot.note || ""
  };
}

function mapBookingToSlot(booking: any): ISlot {
  const utcDate = fromUTC(booking.bookingDate, "Asia/Ho_Chi_Minh");
  const day = dayjs(utcDate).format("YYYY-MM-DD");
  const startTime = dayjs(utcDate).format("HH:mm");
  const endTime = dayjs(utcDate).add(booking.duration, "minutes").format("HH:mm");
  return {
    slotId: booking._id?.toString?.() ?? "",
    customerId: booking.customerId?._id?.toString?.() ?? "",
    serviceId: booking.serviceId?._id?.toString?.() ?? "",
    customerName: booking.customerId?.fullName ?? "",
    serviceName: booking.serviceId?.name ?? "",
    status: booking.status,
    day,
    startTime,
    endTime,
    type: SLOT_TYPES.BOOKING,
    note: `Khách: ${booking.customerId?.fullName || ""}, Dịch vụ: ${booking.serviceId?.name || ""}`
  };
}
async function getWeeklySlotsFromDB(muaId: string, weekStart: string): Promise<ISlot[]> {
  //output: date object utc
  const weekStartDate =  toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();

console.log("weekStartDate", weekStartDate, weekStartDate instanceof Date);
console.log("weekEndDate", weekEndDate, weekEndDate instanceof Date);

  //get working slots
  const workingSlots = await MUA_WorkingSlot.find({ muaId });
  const [override, blocked] = await Promise.all([
    MUA_OverrideSlot.find({ muaId, overrideStart: { $gte: weekStartDate, $lte: weekEndDate } }),
    MUA_BlockedSlot.find({ muaId, blockStart: { $gte: weekStartDate, $lte: weekEndDate } }),
  ]);
  
  let slots: ISlot[] = [
    ...workingSlots.map((slot: any) => mapToSlot(slot, SLOT_TYPES.ORIGINAL_WORKING, weekStart)),
    ...override.map((slot: any) => mapToSlot(slot, SLOT_TYPES.OVERRIDE)),
    ...blocked.map((slot: any) => mapToSlot(slot, SLOT_TYPES.BLOCKED))
  ];

  return slots;
}
//**get raw working slots from redis*/
async function getRawWeeklySlots(muaId: string, weekStart: string): Promise<IWeeklySlot> {
  const cacheKey = `weeklySlots:${muaId}:${dayjs(weekStart).format("YYYY-MM-DD")}`;

  // 1. Check cache trước
  const cached = await redisClient.json.get(cacheKey);
  if (cached) return cached as unknown as IWeeklySlot;

  // 2. Query DB (raw slots dạng array)
  const slots = await getWeeklySlotsFromDB(muaId, weekStart);

  // 3. Convert array -> object map
  const slotMap: Record<string, any> = {};
  slots.forEach((slot, idx) => {
    const slotId = slot.slotId?.toString() || `slot-${idx + 1}`;
    slotMap[slotId] = {
      slotId: slotId,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      note: slot.note
    };
  });

  // 4. Tạo result object
  const weekStartDate = toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const result: IWeeklySlot = {
  muaId,
  weekStart: weekStartDate.toISOString(), // đổi Date -> string
  weekStartStr: dayjs(weekStartDate).format("YYYY-MM-DD HH:mm:ss"),
  slots: slotMap
};

await redisClient.json.set(cacheKey, "$", JSON.parse(JSON.stringify(result)));
  return result;
}

//---------------STAGE 2: Compute final working slots for MUA and get booking slots --------

function applyBlockedSlots(merged: ISlot[], blockeds: ISlot[]): ISlot[] {
  let result = [...merged];
  for (const blocked of blockeds) {
    const blockedStart = dayjs(`${blocked.day} ${blocked.startTime}`, "YYYY-MM-DD HH:mm");
    const blockedEnd = dayjs(`${blocked.day} ${blocked.endTime}`, "YYYY-MM-DD HH:mm");

    const updated: ISlot[] = [];

    for (const slot of result) {
      const slotStart = dayjs(`${slot.day} ${slot.startTime}`, "YYYY-MM-DD HH:mm");
      const slotEnd = dayjs(`${slot.day} ${slot.endTime}`, "YYYY-MM-DD HH:mm");
      
      if (blockedEnd.isSameOrBefore(slotStart) || blockedStart.isSameOrAfter(slotEnd)) {
        updated.push(slot);
      } else if (blockedStart.isSameOrBefore(slotStart) && blockedEnd.isSameOrAfter(slotEnd)) {
        // Do nothing, slot is fully blocked
      } else if (blockedStart.isSameOrBefore(slotStart) && blockedEnd.isBefore(slotEnd)) {
        updated.push({
          ...slot,
          startTime: blockedEnd.format("HH:mm")
        });
      } else if (blockedStart.isAfter(slotStart) && blockedEnd.isSameOrAfter(slotEnd)) {
        updated.push({
          ...slot,
          endTime: blockedStart.format("HH:mm")
        });
      } else if (blockedStart.isAfter(slotStart) && blockedEnd.isBefore(slotEnd)) {
        updated.push({
          ...slot,
          endTime: blockedStart.format("HH:mm"),
          type:slot.type === SLOT_TYPES.ORIGINAL_WORKING ? SLOT_TYPES.NEW_WORKING : SLOT_TYPES.NEW_OVERRIDE
        });
        updated.push({
          ...slot,
          startTime: blockedEnd.format("HH:mm"),
          type: slot.type === SLOT_TYPES.ORIGINAL_WORKING ? SLOT_TYPES.NEW_WORKING : SLOT_TYPES.NEW_OVERRIDE
        });
      }
    }

    result = updated;
  }
  return result;
}
//**get final working slots
export async function computeMUAFinalSlots(data: IWeeklySlot): Promise<ISlot[]> {
  const { slots } = data;
  // 1. Nhóm slots theo day (YYYY-MM-DD)
  const slotsByDay: Record<string, ISlot[]> = {};
  Object.values(slots).forEach((slot: any) => {
    if (!slotsByDay[slot.day]) slotsByDay[slot.day] = [];
    slotsByDay[slot.day].push(slot);
  });

  const finalSlots: ISlot[] = [];

  // 2. Duyệt từng ngày
  for (const [day, daySlots] of Object.entries(slotsByDay)) {
    const overrides = daySlots.filter(s => s.type === SLOT_TYPES.OVERRIDE);
    const blockeds = daySlots.filter(s => s.type === SLOT_TYPES.BLOCKED);
    let workings = daySlots.filter(s => s.type === SLOT_TYPES.ORIGINAL_WORKING);

    // Rule 1: Nếu có override thì bỏ hết working
    if (overrides.length > 0) {
      workings = [];
    }

    let merged: ISlot[] = [...overrides, ...workings];

    // Rule 2: Apply blocked
    merged = applyBlockedSlots(merged, blockeds);

    // Luôn giữ blocked
    merged.push(...blockeds);

    finalSlots.push(...merged);
  }
 
  return finalSlots;
}
//**get booking slots
async function getConfirmedBookingSlots(muaId: string, weekStart: string): Promise<ISlot[]> {
   const weekStartDate =  toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();
  const bookings = await Booking.find({
    muaId,
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
    bookingDate: { $gte: weekStartDate, $lte: weekEndDate }
  }).populate("customerId serviceId muaId");

  return bookings.map(mapBookingToSlot);
}

async function getPendingBookingSlots(muaId: string, weekStart: string): Promise<ISlot[]> {
   const weekStartDate =  toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();
  const bookings = await Booking.find({
    muaId,
    status: BOOKING_STATUS.PENDING,
    bookingDate: { $gte: weekStartDate, $lte: weekEndDate }
  }).populate("customerId serviceId muaId");

  return bookings.map(mapBookingToSlot);
}
//---------------**UC X: merge booking x working --------
export async function getFinalSlots(muaId:string, weekStart:string): Promise<IFinalSlot> {
  const rawSlots = await getRawWeeklySlots(muaId, weekStart);
  //get working slots
  const workingSlots = await computeMUAFinalSlots(rawSlots);
  //get booking slots
  const bookingSlots = await getConfirmedBookingSlots(muaId, weekStart);
  const merged = [...workingSlots, ...bookingSlots];
   const weekStartDate = toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const result: IFinalSlot = {
  muaId,
  weekStart: weekStartDate.toISOString(), // đổi Date -> string
  weekStartStr: dayjs(weekStartDate).format("YYYY-MM-DD HH:mm:ss"),
  slots: merged
}
  return result;
}


//---------------UC X: Get original slots --------
export async function getOriginalWorkingSlots(muaId: string, weekStart: string): Promise<IFinalSlot> {
 const weekStartDate =  toUTC(weekStart, "Asia/Ho_Chi_Minh").toDate();
  const weekEndDate = dayjs(weekStartDate).add(6, "day").endOf("day").toDate();

console.log("weekStartDate", weekStartDate, weekStartDate instanceof Date);
console.log("weekEndDate", weekEndDate, weekEndDate instanceof Date);

  //get working slots
  const workingSlots = await MUA_WorkingSlot.find({ muaId });

 let slots: ISlot[] = workingSlots.map((slot: any) => mapToSlot(slot, SLOT_TYPES.ORIGINAL_WORKING, weekStart));

  const result: IFinalSlot = {
  muaId,
  weekStart: weekStartDate.toISOString(), // đổi Date -> string
  weekStartStr: dayjs(weekStartDate).format("YYYY-MM-DD HH:mm:ss"),
  slots
};
  return result;
}
