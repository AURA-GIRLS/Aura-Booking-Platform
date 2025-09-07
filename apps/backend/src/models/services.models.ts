import { Schema, model } from "mongoose";

const ServicePackageSchema = new Schema({
  muaId: { type: Schema.Types.ObjectId, ref: "MUA" },
  name: String,
  description: String,
  price: Number,
  duration: Number,
  isAvailable: Boolean,
  createdAt: { type: Date, default: Date.now },
  options: [{ type: Schema.Types.ObjectId, ref: "BookingOption" }]
});

export const ServicePackage = model("ServicePackage", ServicePackageSchema);
