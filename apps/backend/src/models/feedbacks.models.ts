import { Schema, model, Types, Document } from 'mongoose'; 


export interface FeedbackV2Document extends Document { 
  bookingId: Types.ObjectId; 
  userId: Types.ObjectId; 
  muaId: Types.ObjectId; 
  rating: number; 
  comment?: string; 
  createdAt: Date; 
  updatedAt: Date; 
} 


const FeedbackV2Schema = new Schema<FeedbackV2Document>( 
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true }, 
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    muaId: { type: Schema.Types.ObjectId, ref: 'MUA', required: true }, 
    rating: { type: Number, required: true }, 
    comment: { type: String, default: '' } 
  },
  { timestamps: true, collection: 'feedbacks' } 
); 

//unique index to ensure 1 feedback per booking
FeedbackV2Schema.index({ bookingId: 1 }, { unique: true }); 


export const FeedbackV2 = model<FeedbackV2Document>('FeedbackV2', FeedbackV2Schema, 'feedbacks'); 
