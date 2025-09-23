
import { Types } from 'mongoose'; 
import { Booking } from '../models/bookings.models'; 
import { FeedbackV2 } from '../models/feedbacks.models'; 


const allowedStatuses = new Set(['COMPLETED', 'DONE', 'FINISHED']); 


const httpError = (status: number, code: string, message: string) => { 
  const e: any = new Error(message); 
  e.status = status; 
  e.code = code; 
  return e; 
}; 


export class FeedbackService { 
  constructor() { 
    // Ensure unique index at runtime to satisfy 1 booking -> 1 feedback 
    FeedbackV2.collection.createIndex({ bookingId: 1 }, { unique: true }).catch(() => {}); 
  } 

  private async assertOwnershipAndStatus(userId: string, bookingId: string) { 
    if (!Types.ObjectId.isValid(bookingId)) { 
      throw httpError(400, 'invalid_booking_id', 'Invalid bookingId'); 
    } 
    const booking = await Booking.findById(bookingId); 
    if (!booking) { 
      throw httpError(404, 'booking_not_found', 'Booking not found'); 
    } 
    if (booking.customerId?.toString() !== userId) { 
      throw httpError(403, 'not_owner', 'You are not the owner of this booking'); 
    } 
    const status = (booking.status || '').toString().toUpperCase(); 
    if (!allowedStatuses.has(status)) { 
      throw httpError(409, 'invalid_status', 'Booking must be completed to leave feedback'); 
    } 
    return booking; 
  } 

  async getMine(userId: string, bookingId: string) { 
    await this.assertOwnershipAndStatus(userId, bookingId); 
    const feedback = await FeedbackV2.findOne({ bookingId: new Types.ObjectId(bookingId) }); 
    return feedback; 
  } 

  async create(userId: string, payload: { bookingId: string; rating: number; comment?: string }) { 
    const booking = await this.assertOwnershipAndStatus(userId, payload.bookingId); 

    const existing = await FeedbackV2.findOne({ bookingId: booking._id }); 
    if (existing) { 
      throw httpError(409, 'duplicate_feedback', 'Feedback already exists for this booking'); 
    } 

    const created = await FeedbackV2.create({ 
      bookingId: booking._id, 
      userId: new Types.ObjectId(userId), 
      muaId: booking.muaId, 
      rating: payload.rating, 
      comment: payload.comment ?? '' 
    }); 

    // Link to booking if field exists 
    if ('feedbackId' in booking) { 
      (booking as any).feedbackId = created._id; 
      await booking.save(); 
    } 

    return created; 
  } 

  async update(userId: string, feedbackId: string, patch: { rating?: number; comment?: string }) { 
    if (!Types.ObjectId.isValid(feedbackId)) { 
      throw httpError(400, 'invalid_feedback_id', 'Invalid feedbackId'); 
    } 
    const feedback = await FeedbackV2.findById(feedbackId); 
    if (!feedback) { 
      throw httpError(404, 'feedback_not_found', 'Feedback not found'); 
    } 
    if (feedback.userId.toString() !== userId) { 
      throw httpError(403, 'not_owner', 'You are not the owner of this feedback'); 
    } 

    if (typeof patch.rating !== 'undefined') (feedback as any).rating = patch.rating; 
    if (typeof patch.comment !== 'undefined') (feedback as any).comment = patch.comment; 
    await feedback.save(); 
    return feedback; 
  } 

  async remove(userId: string, feedbackId: string) { 
    if (!Types.ObjectId.isValid(feedbackId)) { 
      throw httpError(400, 'invalid_feedback_id', 'Invalid feedbackId'); 
    } 
    const feedback = await FeedbackV2.findById(feedbackId); 
    if (!feedback) { 
      throw httpError(404, 'feedback_not_found', 'Feedback not found'); 
    } 
    if (feedback.userId.toString() !== userId) { 
      throw httpError(403, 'not_owner', 'You are not the owner of this feedback'); 
    } 

    // Unlink booking if linked 
    await Booking.updateOne({ feedbackId: feedback._id }, { $unset: { feedbackId: '' } }); 

    await FeedbackV2.deleteOne({ _id: feedback._id }); 
  } 
} 
