import mongoose from "mongoose";
import { Conversation, Message, ChatReaction, PinnedConversation } from "@models/chat.models";
import { getIO } from "config/socket";
import type { IAttachment } from "@models/chat.models";
import { User } from "@models/users.models";

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export class ChatService {
	// Create or get existing private conversation between two users
	async createPrivateConversation(userA: string, userB: string) {
		const participants = [userA, userB].map(toObjectId);
		const existing = await Conversation.findOne({
			type: "private",
			participants: { $all: participants, $size: 2 },
		}).lean();
		if (existing) return existing;

		const participantsSorted = [userA, userB].sort();
		const hash = participantsSorted.join("_");
		const conv = await Conversation.create({
			type: "private",
			participants: participantsSorted,
			participantHash: hash,
		});

		// Populate the created conversation to match the shape returned by listConversations
		let convPop: any = null;
		try {
			convPop = await Conversation.findById(conv._id)
				.populate({
					path: 'participants',
					select: '_id fullName email avatarUrl role status',
				})
				.populate({
					path: 'lastMessage',
					select: 'content type status createdAt senderId',
					populate: {
						path: 'senderId',
						select: 'fullName avatarUrl'
					}
				})
				.lean();
		} catch (e) {
			convPop = null;
		}

		// ✅ Emit realtime to both participants. Emit per-recipient enriched object including isPinned for that user
		try {
			const io = getIO();
			for (const p of participants) {
				let convForUser: any = convPop ? { ...convPop } : { ...conv };
				// Determine pinned status for this recipient
				try {
					const pinned = await PinnedConversation.findOne({ userId: p, conversationId: conv._id }).lean();
					convForUser.isPinned = !!pinned;
				} catch {
					convForUser.isPinned = false;
				}

				io.to(`user:${p}`).emit("conversation:created", {
					conversation: convForUser,
				});
			}
		} catch { }

		return conv;
	}

	async deleteConversation(conversationId: string) {
		const conv = await Conversation.findById(conversationId);
		if (!conv) throw new Error("Conversation not found");

		conv.isDeleted = true;
		await conv.save();

		// ✅ Emit deletion to all participants
		try {
			const io = getIO();
			conv.participants.forEach((p) => {
				io.to(`user:${p}`).emit("conversation:deleted", {
					conversationId,
				});
			});
		} catch { }

		return { conversationId };
	}

	async pinConversation(userId: string, conversationId: string) {
		await PinnedConversation.updateOne(
			{ userId: toObjectId(userId), conversationId: toObjectId(conversationId) },
			{ $set: { pinnedAt: new Date() } },
			{ upsert: true }
		);

		// ✅ Emit update
		try {
			const io = getIO();
			io.to(`user:${userId}`).emit("conversation:update", {
				conversationId,
				data: { isPinned: true },
			});
		} catch { }

		return { conversationId };
	}

	async unpinConversation(userId: string, conversationId: string) {
		await PinnedConversation.deleteOne({
			userId: toObjectId(userId),
			conversationId: toObjectId(conversationId),
		});

		// ✅ Emit update
		try {
			const io = getIO();
			io.to(`user:${userId}`).emit("conversation:update", {
				conversationId,
				data: { isPinned: false },
			});
		} catch { }

		return { conversationId };
	}

	async createGroupConversation(creatorId: string, dto: { name: string; participantIds: string[]; avatarUrl?: string }) {
		const participants = Array.from(new Set([creatorId, ...(dto.participantIds || [])])).map(toObjectId);
		const conv = await Conversation.create({ type: 'group', name: dto.name, participants, adminId: toObjectId(creatorId), avatarUrl: dto.avatarUrl });
		return conv;
	}

	// List conversations for a user, with pinned info
	async listConversations(userId: string, query: { page?: number; limit?: number; pinnedOnly?: boolean }) {
		const page = Math.max(1, Number(query.page) || 1);
		const limit = Math.min(50, Number(query.limit) || 20);
		const skip = (page - 1) * limit;

		// Base filter: user is participant and not deleted
		const filter: any = { participants: toObjectId(userId), isDeleted: { $ne: true } };

		// Find conversations with populated participants (excluding sensitive data)
		let convs = await Conversation.find(filter)
			.populate({
				path: 'participants',
				select: '_id fullName email avatarUrl role status',
				// match: { _id: { $ne: toObjectId(userId) } } // Exclude the current user from participants
			})
			.populate({
				path: 'lastMessage',
				select: 'content type status createdAt senderId',
				populate: {
					path: 'senderId',
					select: 'fullName avatarUrl'
				}
			})
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Attach pinned info
		const convIds = convs.map((c: any) => c._id.toString());
		const pinned = await PinnedConversation.find({
			userId: toObjectId(userId),
			conversationId: { $in: convIds }
		}).lean();

		const pinnedMap = new Map(pinned.map((p: any) => [String(p.conversationId), p]));

		// Process conversations
		const items = convs.map((conv: any) => ({
			...conv,
			isPinned: pinnedMap.has(String(conv._id)),
			// Keep all participants in the participants array
			participants: conv.participants || []
		}));

		const total = await Conversation.countDocuments(filter);
		const pages = Math.ceil(total / limit) || 1;
		return { items, total, page, pages };
	}



	// Send message in conversation
	async sendMessage(senderId: string, conversationId: string, body: { content?: string; attachments?: IAttachment[]; repliedTo?: string }) {
		const conv = await Conversation.findById(conversationId);
		if (!conv) throw new Error('Conversation not found');
		const message = await Message.create({ conversationId: toObjectId(conversationId), senderId: toObjectId(senderId), content: body.content || '', attachments: body.attachments || [], repliedTo: body.repliedTo ? toObjectId(body.repliedTo) : undefined });
		// update conversation lastMessage and updatedAt
		conv.lastMessage = message._id as any;
		await conv.save();

		// Emit via socket
		try {
			const io = getIO();
			io.to(`conversation:${conversationId}`).emit('message:new', { conversationId, message });
		} catch { }

		return message;
	}

	// List messages with pagination (newest first)
	async listMessages(conversationId: string, query: { page?: number; limit?: number }) {
		const page = Math.max(1, Number(query.page) || 1);
		const limit = Math.min(100, Number(query.limit) || 50);
		const skip = (page - 1) * limit;
		const filter: any = { conversationId: toObjectId(conversationId) };

		// Get messages with pagination
		const messages = await Message.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		// Get all message IDs
		const messageIds = messages.map(msg => msg._id);

		// Get all reactions for these messages
		const reactions = await ChatReaction.find({
			messageId: { $in: messageIds }
		}).populate('userId', 'fullName avatarUrl');

		// Group reactions by message ID
		// First, collect all unique user IDs from reactions
		const userIds = [...new Set(reactions.map(r => r.userId._id.toString()))];

		// Fetch all users in a single query
		const users = await User.find({ _id: { $in: userIds } }, 'fullName avatarUrl');
		const userMap = new Map(users.map(user => [user._id.toString(), user]));

		// Then process reactions
		const reactionsByMessage = reactions.reduce((acc, reaction) => {
			const messageId = reaction.messageId.toString();
			const user = userMap.get(reaction.userId._id.toString());

			if (!acc[messageId]) {
				acc[messageId] = [];
			}

			acc[messageId].push({
				_id: reaction._id,
				user: {
					_id: reaction.userId._id,
					fullName: user?.fullName || 'Unknown User',
					avatarUrl: user?.avatarUrl
				},
				emoji: reaction.emoji,
				createdAt: reaction.createdAt
			});

			return acc;
		}, {} as Record<string, any[]>);

		// Attach reactions to messages
		const messagesWithReactions = messages.map(message => ({
			...message,
			reactions: reactionsByMessage[message._id.toString()] || []
		}));

		const total = await Message.countDocuments(filter);
		const pages = Math.ceil(total / limit) || 1;

		return {
			items: messagesWithReactions,
			total,
			page,
			pages
		};
	}

	// React to a message
	async reactToMessage(userId: string, messageId: string, emoji: string) {
		// upsert reaction
		const message = await Message.findById(messageId);
		if (!message) throw new Error("Message not found");
		const convId = message.conversationId.toString();

		const reaction = await ChatReaction.findOneAndUpdate({ messageId: toObjectId(messageId), userId: toObjectId(userId) }, { $set: { emoji } }, { upsert: true, new: true, setDefaultsOnInsert: true });
		try {
			const io = getIO();
			io.to(`conversation:${convId}`).emit("message:react", { messageId, reaction });
		} catch { }
		return reaction;
	}

	async unreactToMessage(userId: string, messageId: string) {
		await ChatReaction.deleteOne({ messageId: toObjectId(messageId), userId: toObjectId(userId) });
		const message = await Message.findById(messageId);
		if (!message) throw new Error("Message not found");
		const convId = message.conversationId.toString();
		try {
			const io = getIO();
			io.to(`conversation:${convId}`).emit("message:unreact", { messageId, userId });
		} catch { }
		return { messageId };
	}
}

export default new ChatService();

