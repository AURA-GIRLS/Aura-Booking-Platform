
import type { Request, Response } from 'express'; 
import { FeedbackService } from '../services/feedback.service'; 


const svc = new FeedbackService(); 


export class FeedbackController { 
  async getMine(req: Request, res: Response) { 
    try { 
      const userId = (req as any).user?.userId as string; 
      const bookingId = (req.query.bookingId as string) || ''; 
      const data = await svc.getMine(userId, bookingId); 
      res.status(200).json(data); 
    } catch (e: any) { 
      res.status(e.status || 500).json({ code: e.code || 'internal_error', message: e.message || 'Server error' }); 
    } 
  } 

  async create(req: Request, res: Response) { 
    try { 
      const userId = (req as any).user?.userId as string; 
      const { bookingId, rating, comment } = req.body || {}; 
      const data = await svc.create(userId, { bookingId, rating, comment }); 
      res.status(201).json(data); 
    } catch (e: any) { 
      res.status(e.status || 500).json({ code: e.code || 'internal_error', message: e.message || 'Server error' }); 
    } 
  } 

  async update(req: Request, res: Response) { 
    try { 
      const userId = (req as any).user?.userId as string; 
      const feedbackId = req.params.id; 
      const { rating, comment } = req.body || {}; 
      const data = await svc.update(userId, feedbackId, { rating, comment }); 
      res.status(200).json(data); 
    } catch (e: any) { 
      res.status(e.status || 500).json({ code: e.code || 'internal_error', message: e.message || 'Server error' }); 
    } 
  } 

  async remove(req: Request, res: Response) { 
    try { 
      const userId = (req as any).user?.userId as string; 
      const feedbackId = req.params.id; 
      await svc.remove(userId, feedbackId); 
      res.status(204).send(); 
    } catch (e: any) { 
      res.status(e.status || 500).json({ code: e.code || 'internal_error', message: e.message || 'Server error' }); 
    } 
  } 
} 
