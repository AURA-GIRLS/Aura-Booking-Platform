import { TRANSACTION_STATUS } from "constants/index";
import { model, Schema } from "mongoose";

const TransactionSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  currency: String,
  status: { type: String, enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.HOLD },
  paymentMethod: String,
  paymentReference: String,
}, { timestamps: true });
export const Transaction = model("Transaction", TransactionSchema);