import { BOOKING_STATUS, BOOKING_TYPES } from "constants/index";
import { Schema, model } from "mongoose";


const FeedbackSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const BookingSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "User" },
  serviceId: { type: Schema.Types.ObjectId, ref: "ServicePackage" },
  bookingDate: Date,
  duration: Number,
  locationType: { type: String, enum: Object.values(BOOKING_TYPES)},
  address: String,
  status: { type: String, enum: Object.values(BOOKING_STATUS) },
  travelFee: Number,
  createdAt: { type: Date, default: Date.now },
  feedback: { type: Schema.Types.ObjectId, ref: "Feedback" }
});

export const Booking = model("Booking", BookingSchema);
export const Feedback = model("Feedback", FeedbackSchema);
