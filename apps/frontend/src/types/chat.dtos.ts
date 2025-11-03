// ===== CHAT DTOs =====

import { UserResponseDTO } from "./user.dtos";

// Attachment/Media interface
export interface AttachmentDTO {
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  fileName: string;
  fileSize: number;
  duration?: number; // for video/audio
}

// Conversation DTOs
export interface ConversationDTO {
  _id: string;
  type: 'private' | 'group';
  name?: string;
  participants: UserResponseDTO[]; // User IDs
  lastMessage?: LastMessageDTO; // Message ID
  adminId?: string; // For group conversations
  avatarUrl?: string;
  isDeleted: boolean;
  isPinned?: boolean; // Added by frontend service
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrivateConversationDTO {
  otherUserId: string;
}

export interface CreateGroupConversationDTO {
  name: string;
  participantIds: string[];
  avatarUrl?: string;
}

// Message DTOs
export interface MessageDTO {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: AttachmentDTO[];
  type: 'text' | 'media' | 'system';
  status: 'sent' | 'delivered' | 'read';
  repliedTo?: string; // Message ID
  reactions: ReactionDTO[]; // Reaction IDs
  isPinned: boolean;
  deletedBy: string[]; // User IDs
  createdAt: string;
}
export interface LastMessageDTO {
  content: string;
  createdAt: string;
  senderId:
  {
    _id: "68fdd54ac305931b56d556ae",
    fullName: "Huyền Cao",
    avatarUrl: string
  };
  _id: string;
  type: 'text' | 'media' | 'system';
  status: 'sent' | 'delivered' | 'read';
}

export interface SendMessageDTO {
  content?: string;
  attachments?: AttachmentDTO[];
  repliedTo?: string;
}

// Reaction DTOs
export interface ReactionDTO {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    avatarUrl: string;
  },
  emoji: string;
  createdAt: string;
}

export interface CreateReactionDTO {
  emoji: string;
}

// Paginated responses
export interface PaginatedConversationsDTO {
  items: ConversationDTO[];
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedMessagesDTO {
  items: MessageDTO[];
  total: number;
  page: number;
  pages: number;
}

// API Response wrapper
export interface ChatApiResponseDTO<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}