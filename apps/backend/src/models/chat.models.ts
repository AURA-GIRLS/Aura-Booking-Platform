// chat.models.ts

import { Schema, model, Document, Types } from 'mongoose';

// --- Interface cho Media/File đính kèm (Hình ảnh, File, Ghi âm) ---
export interface IAttachment {
  type: 'image' | 'video' | 'file' | 'audio'; // Loại file
  url: string; // URL lưu trữ (ví dụ: Cloudinary/S3)
  fileName: string;
  fileSize: number; // Kích thước file (bytes)
  duration?: number; // Chỉ dùng cho 'video' và 'audio' (giây)
}

const AttachmentSchema = new Schema<IAttachment>({
  type: { type: String, enum: ['image', 'video', 'file', 'audio'], required: true },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  duration: { type: Number, required: false },
}, { _id: false });


// --- Interface cho Conversation (Nhóm/Cá nhân) ---
export interface IConversation extends Document {
  _id: Types.ObjectId;
  type: 'private' | 'group'; // Loại cuộc trò chuyện
  name?: string; // Tên nhóm (chỉ có nếu type là 'group')
  participants: Types.ObjectId[]; // ID của tất cả User tham gia (User model)
  participantHash?: string; // Hash duy nhất cho cuộc trò chuyện cá nhân
  lastMessage: Types.ObjectId; // Tin nhắn cuối cùng (Message model)
  adminId?: Types.ObjectId; // ID Admin nhóm (chỉ có nếu type là 'group')
  avatarUrl?: string;
  isDeleted: boolean; // Dùng để soft delete conversation
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  type: { type: String, enum: ['private', 'group'], required: true },
  name: { type: String, trim: true, minlength: 1, required: function() { return this.type === 'group'; } },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  participantHash: { type: String, unique: true, sparse: true },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', required: false }, // Có thể là null ban đầu
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: function() { return this.type === 'group'; } },
  avatarUrl: { type: String, required: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// ConversationSchema.index({ participantHash: 1, type: 1 }, {
//   unique: true,
//   partialFilterExpression: { type: 'private' }
// });


// Index bổ sung cho nhóm: Đổi thứ tự field để tránh bị Mongoose coi là trùng lặp.
ConversationSchema.index(
  { type: 1, participants: 1 },
  { partialFilterExpression: { type: 'group' } }
);

// --- Interface cho Message (Tin nhắn) ---
export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId; // ID Conversation cha
  senderId: Types.ObjectId; // ID người gửi
  content: string; // Nội dung text (có thể rỗng nếu chỉ gửi file)
  attachments: IAttachment[]; // File/Media đính kèm (bao gồm ghi âm)
  type: 'text' | 'media' | 'system'; // Phân loại tin nhắn (text, file, hoặc tin hệ thống)
  status: 'sent' | 'delivered' | 'read';
  repliedTo?: Types.ObjectId; // Trả lời tin nhắn nào (Message model)
  reactions: IChatReaction[]; // Reactions cho tin nhắn (sẽ là sub-document)
  isPinned: boolean; // Tin nhắn được ghim trong conversation
  deletedBy: Types.ObjectId[]; // User nào đã xoá tin nhắn (chỉ xoá phía họ)
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
  type: { type: String, enum: ['text', 'media', 'system'], default: 'text' },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  repliedTo: { type: Schema.Types.ObjectId, ref: 'Message', required: false }, // Tin nhắn được trả lời
  reactions: { type: [Schema.Types.ObjectId], ref: 'ChatReaction', default: [] }, // Sẽ là tham chiếu tới ChatReaction model
  isPinned: { type: Boolean, default: false }, // Ghim tin nhắn
  deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }], // Xoá tin nhắn cá nhân
}, { timestamps: { createdAt: true, updatedAt: false } }); // Tin nhắn chỉ cần createdAt

// Index để load tin nhắn theo thời gian trong 1 conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });


// --- Interface cho Reaction (Reaction trên tin nhắn) ---
export interface IChatReaction extends Document {
  _id: Types.ObjectId;
  messageId: Types.ObjectId; // Tin nhắn được react
  userId: Types.ObjectId; // Người thực hiện reaction
  emoji: string; // Emoji sử dụng (ví dụ: 👍, ❤️, 😂)
  createdAt: Date;
}

const ChatReactionSchema = new Schema<IChatReaction>({
  messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Index để đảm bảo 1 user chỉ reaction 1 lần cho 1 tin nhắn
ChatReactionSchema.index({ messageId: 1, userId: 1 }, { unique: true });


// --- Export Models ---
export const Conversation = model<IConversation>('Conversation', ConversationSchema);
export const Message = model<IMessage>('Message', MessageSchema);
export const ChatReaction = model<IChatReaction>('ChatReaction', ChatReactionSchema);
// Lưu ý: Reaction có thể là Sub-document trong Message để truy vấn nhanh hơn,
// nhưng tạo thành Model riêng giúp quản lý và cập nhật dễ dàng hơn.

// --- Bổ sung: Model cho ghim cuộc trò chuyện (Optional nhưng hữu ích) ---
export interface IPinnedConversation extends Document {
    userId: Types.ObjectId;
    conversationId: Types.ObjectId;
    pinnedAt: Date;
}

const PinnedConversationSchema = new Schema<IPinnedConversation>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    pinnedAt: { type: Date, default: Date.now },
});

// Đảm bảo 1 user chỉ ghim 1 conversation 1 lần
PinnedConversationSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

export const PinnedConversation = model<IPinnedConversation>('PinnedConversation', PinnedConversationSchema);