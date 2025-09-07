import { Schema, model } from "mongoose";

const MUASchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  experienceYears: Number,
  bio: String,
  location: String,
  ratingAverage: Number,
  feedbackCount: Number,
  bookingCount: Number,
  isVerified: Boolean
});

const WorkingSlotSchema = new Schema({
  muaId: { type: Schema.Types.ObjectId, ref: "MUA" },
  weekday: { type: String, enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] },
  startTime: String,
  endTime: String,
  note: String
});

const OverrideSlotSchema = new Schema({
  muaId: { type: Schema.Types.ObjectId, ref: "MUA" },
  overrideDate: Date,
  startTime: String,
  endTime: String,
  note: String
});

const BlockedSlotSchema = new Schema({
  muaId: { type: Schema.Types.ObjectId, ref: "MUA" },
  blockDate: Date,
  blockStart: String,
  blockEnd: String,
  reason: String
});

export const MUA = model("MUA", MUASchema);
export const MUA_WorkingSlot = model("MUA_WorkingSlot", WorkingSlotSchema);
export const MUA_OverrideSlot = model("MUA_OverrideSlot", OverrideSlotSchema);
export const MUA_BlockedSlot = model("MUA_BlockedSlot", BlockedSlotSchema);
