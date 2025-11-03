import { api } from '@/config/api';
import type { ApiResponseDTO } from '../types/common.dtos';
import type {
  ConversationDTO,
  CreatePrivateConversationDTO,
  CreateGroupConversationDTO,
  MessageDTO,
  SendMessageDTO,
  ReactionDTO,
  CreateReactionDTO,
  PaginatedConversationsDTO,
  PaginatedMessagesDTO,
  ChatApiResponseDTO
} from '../types/chat.dtos';

export const ChatService = {

  // ===== CONVERSATIONS =====

  // CREATE - Create private conversation
  async createPrivateConversation(data: CreatePrivateConversationDTO): Promise<ChatApiResponseDTO<ConversationDTO>> {
    try {
      const res = await api.post<ChatApiResponseDTO<ConversationDTO>>('/chat/conversations/private', data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // CREATE - Create group conversation
  async createGroupConversation(data: CreateGroupConversationDTO): Promise<ChatApiResponseDTO<ConversationDTO>> {
    try {
      const res = await api.post<ChatApiResponseDTO<ConversationDTO>>('/chat/conversations/group', data);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Get conversations list with pagination
  async getConversations(params?: {
    page?: number;
    limit?: number;
  }): Promise<ChatApiResponseDTO<PaginatedConversationsDTO>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const res = await api.get<ChatApiResponseDTO<PaginatedConversationsDTO>>(
        `/chat/conversations?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // UPDATE - Pin conversation
  async pinConversation(conversationId: string): Promise<ChatApiResponseDTO<{ conversationId: string }>> {
    try {
      const res = await api.patch<ChatApiResponseDTO<{ conversationId: string }>>(
        `/chat/conversations/${conversationId}/pin`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // UPDATE - Unpin conversation
  async unpinConversation(conversationId: string): Promise<ChatApiResponseDTO<{ conversationId: string }>> {
    try {
      const res = await api.delete<ChatApiResponseDTO<{ conversationId: string }>>(
        `/chat/conversations/${conversationId}/pin`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // ===== MESSAGES =====

  // CREATE - Send message
  async sendMessage(conversationId: string, data: SendMessageDTO): Promise<ChatApiResponseDTO<MessageDTO>> {
    try {
      const res = await api.post<ChatApiResponseDTO<MessageDTO>>(
        `/chat/conversations/${conversationId}/messages`,
        data
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // READ - Get messages with pagination
  async getMessages(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ChatApiResponseDTO<PaginatedMessagesDTO>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const res = await api.get<ChatApiResponseDTO<PaginatedMessagesDTO>>(
        `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // ===== REACTIONS =====

  // CREATE - React to message
  async reactToMessage(messageId: string, data: CreateReactionDTO): Promise<ChatApiResponseDTO<ReactionDTO>> {
    try {
      const res = await api.post<ChatApiResponseDTO<ReactionDTO>>(
        `/chat/messages/${messageId}/react`,
        data
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // DELETE - Remove reaction from message
  async unreactToMessage(messageId: string): Promise<ChatApiResponseDTO<{ messageId: string }>> {
    try {
      const res = await api.delete<ChatApiResponseDTO<{ messageId: string }>>(
        `/chat/messages/${messageId}/react`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  // /services/chat.ts
async togglePinConversation(conversationId: string, shouldPin: boolean) {
  return shouldPin
    ? this.pinConversation(conversationId)
    : this.unpinConversation(conversationId);
}

};
