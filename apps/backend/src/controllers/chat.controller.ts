import type { Request, Response } from 'express';
import ChatService from '@services/chat.service';
import type { ApiResponseDTO } from '../types';

export class ChatController {
	private readonly service: typeof ChatService;

	constructor() {
		this.service = ChatService;
	}

	// POST /api/chat/conversations/private
	async createPrivateConversation(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			const otherId = req.body.otherUserId as string;
		if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
		if (!otherId) {
			return res.status(400).json({ success: false, message: 'otherUserId required' } as ApiResponseDTO);
		}
			const data = await this.service.createPrivateConversation(userId, otherId);
			res.status(201).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to create conversation' } as ApiResponseDTO);
		}
	}

	// POST /api/chat/conversations/group
	async createGroupConversation(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
		if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
		const { name, participantIds, avatarUrl } = req.body;
		if (!name) 
                 return res.status(400).json({ success: false, message: 'name required' } as ApiResponseDTO);
			const data = await this.service.createGroupConversation(userId, { name, participantIds: participantIds || [], avatarUrl });
			res.status(201).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to create group' } as ApiResponseDTO);
		}
	}

	// GET /api/chat/conversations
	async listConversations(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const { page, limit } = req.query as any;
			const data = await this.service.listConversations(userId, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Failed to list conversations' } as ApiResponseDTO);
		}
	}

	// PATCH /api/chat/conversations/:id/pin
	async pinConversation(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const data = await this.service.pinConversation(userId, req.params.id);
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to pin' } as ApiResponseDTO);
		}
	}

	// DELETE /api/chat/conversations/:id/pin
	async unpinConversation(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const data = await this.service.unpinConversation(userId, req.params.id);
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to unpin' } as ApiResponseDTO);
		}
	}

	// POST /api/chat/conversations/:id/messages
	async sendMessage(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const data = await this.service.sendMessage(userId, req.params.id, req.body);
			res.status(201).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to send message' } as ApiResponseDTO);
		}
	}

	// GET /api/chat/conversations/:id/messages
	async listMessages(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const { page, limit } = req.query as any;
			const data = await this.service.listMessages(req.params.id, { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to list messages' } as ApiResponseDTO);
		}
	}

	// POST /api/chat/messages/:id/react
	async react(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const emoji = req.body.emoji as string;
			if (!emoji) 
                 return res.status(400).json({ success: false, message: 'emoji required' } as ApiResponseDTO);
			const data = await this.service.reactToMessage(userId, req.params.id, emoji);
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to react' } as ApiResponseDTO);
		}
	}

	// DELETE /api/chat/messages/:id/react
	async unreact(req: Request, res: Response): Promise<Response | void> {
		try {
			const userId = (req as any).user?.userId as string;
			if (!userId) 
                 return res.status(401).json({ success: false, message: 'Unauthorized' } as ApiResponseDTO);
			const data = await this.service.unreactToMessage(userId, req.params.id);
			res.status(200).json({ success: true, data } as ApiResponseDTO);
		} catch (err) {
			res.status(400).json({ success: false, message: err instanceof Error ? err.message : 'Failed to unreact' } as ApiResponseDTO);
		}
	}
}

export default new ChatController();
