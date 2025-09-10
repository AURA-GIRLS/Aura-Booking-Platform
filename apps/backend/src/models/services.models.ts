import { Schema, model } from "mongoose";
import { SERVICE_CATEGORIES } from "../constants/index";

const ServicePackageSchema = new Schema({
  muaId: { type: Schema.Types.ObjectId, ref: "MUA" },
  name: String,
  description: String,
  price: Number,
  duration: Number,
  category: {
    type: String,
    enum: Object.values(SERVICE_CATEGORIES),
    required: true,
    default: SERVICE_CATEGORIES.DAILY
  },
  isAvailable: Boolean,
  createdAt: { type: Date, default: Date.now },
  options: [{ type: Schema.Types.ObjectId, ref: "BookingOption" }]
});

// Add indexes for better query performance
ServicePackageSchema.index({ muaId: 1 });
ServicePackageSchema.index({ category: 1, isAvailable: 1 });

export const ServicePackage = model("ServicePackage", ServicePackageSchema);
