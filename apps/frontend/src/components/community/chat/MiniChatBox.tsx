import { X, Send, Users, Smile, Paperclip, Clock, ThumbsUp, Heart, Laugh, Angry, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
// Removed unused vi locale import
import { ChatService } from '@/services/chat';
import type { ConversationDTO, MessageDTO } from '../../../types/chat.dtos';
import { useAuthCheck } from '../../../utils/auth';
import { UserWallResponseDTO } from '@/types/community.dtos';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserService } from '@/services/user';
import { UserResponseDTO } from '@/types/user.dtos';

interface MiniChatBoxProps {
recipientUserId:string;
currentUser:UserWallResponseDTO|null;
position:any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniChatBox({ 
  isOpen, 
  onClose, 
  recipientUserId,
  currentUser,
  position
}: Readonly<MiniChatBoxProps>) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [showTimestampFor, setShowTimestampFor] = useState<string | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  
  const formatMessageTime = (dateString: string, detailed = false) => {
    if (detailed) {
      return format(new Date(dateString), 'HH:mm - dd/MM/yyyy');
    }
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true
    });
  };

  const toggleTimestamp = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTimestampFor(prev => prev === messageId ? null : messageId);
    setShowReactionsFor(null);
    return false;
  };

  const toggleReactions = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReactionsFor(prev => prev === messageId ? null : messageId);
    setShowTimestampFor(null);
    return false;
  };

  const handleReaction = async (e: React.MouseEvent, messageId: string, emoji: string) => {
    if (isReacting) return;
    setIsReacting(true);
    e.stopPropagation();
    
    try {
      const message = messages.find(m => m._id === messageId);
      if (!message) return;

      // Check if the user already reacted with this emoji
      const existingReaction = message.reactions?.find(
        r => r.user._id === currentUser?._id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await ChatService.unreactToMessage(messageId);
      } else {
        // Add reaction
        await ChatService.reactToMessage(messageId, { emoji });
      }

      // Refresh messages to get updated reactions
      if (conversation?._id) {
        const response = await ChatService.getMessages(conversation._id, {
          page: 1,
          limit: 50,
        });

        if (response.success && response.data) {
          setMessages(response.data.items || []);
        }
      }
    } catch (error) {
      console.error('Failed to handle reaction:', error);
    } finally {
      setShowReactionsFor(null);
      setIsReacting(false);
    }
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside of both popups and their buttons
      const target = e.target as HTMLElement;
      const isClickOnReactionButton = target.closest('.reaction-button');
      const isClickOnTimestampButton = target.closest('.timestamp-button');
      const isClickOnReactionPopup = target.closest('.reaction-popup');
      
      if (!isClickOnReactionButton && !isClickOnReactionPopup) {
        setShowReactionsFor(null);
      }
      
      if (!isClickOnTimestampButton) {
        setShowTimestampFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [inputValue, setInputValue] = useState('');
  const [conversation, setConversation] = useState<ConversationDTO | null>(null);
  const [recipientUser, setRecipientUser] = useState<UserResponseDTO|null>(null);
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkAuthAndExecute } = useAuthCheck();

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when component mounts or conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;

      try {
        setLoading(true);
        const response = await ChatService.getMessages(conversation._id, {
          page: 1,
          limit: 50, // Adjust the limit as needed
        });

        if (response.success && response.data) {
          setMessages(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  useEffect(() => {
    getRecipientInfo();
    scrollToBottom();
  }, [messages, recipientUserId]);

  const getRecipientInfo = async () => {
    if (!recipientUserId) return;
    try {
      const response = await UserService.getUserById(recipientUserId);
      if (response.success && response.data) {
        setRecipientUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch recipient info:', error);
      setRecipientUser(null);
    }
  };

  // Create or get conversation when component mounts or recipient changes
  const ensureConversation = useCallback(async () => {
    if (conversation || !recipientUserId) return conversation;

    try {
      // Try to get existing conversation first
      const convsResponse = await ChatService.getConversations({ page: 1, limit: 100 });
      if (convsResponse.success && convsResponse.data) {
        const existingConv = convsResponse.data.items.find((conv) =>
          conv.type === 'private' && conv.participants.some((p) => p._id === recipientUserId)
        );

        if (existingConv) {
          setConversation(existingConv);
          return existingConv;
        }
      }

      // If no existing conversation, create a new one
      const response = await ChatService.createPrivateConversation({
        otherUserId: recipientUserId,
      });

      if (response.success && response.data) {
        setConversation(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get or create conversation:', error);
    }
    return null;
  }, [conversation, recipientUserId]);

  // Ensure conversation exists when component mounts
  useEffect(() => {
    ensureConversation();
  }, [ensureConversation]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !recipientUserId) return;

    checkAuthAndExecute(async () => {
      try {
        setLoading(true);
        
        // Ensure conversation exists
        const conv = await ensureConversation();
        if (!conv) return;

        // Send message
        const response = await ChatService.sendMessage(conv._id, {
          content: inputValue.trim()
        });

        if (response.success && response.data) {
          setMessages(prev => [...prev, response.data!]);
          setInputValue('');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  if (loading && messages.length === 0) {
    return (
      <div 
        className="fixed bg-white rounded-t-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
        style={{
          width: '320px',
          height: '400px',
          right: position?.right || '20px',
          bottom: position?.bottom || '20px',
          zIndex: 50,
        }}
      >
        <div className="flex items-center justify-between p-3 bg-rose-50 border-b border-rose-100">
          <div className="flex items-center">
            {recipientUser?.avatarUrl ? (
              <img 
                src={recipientUser.avatarUrl} 
                alt={recipientUser.fullName} 
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-medium mr-2">
                {recipientUser?.fullName ? getInitials(recipientUser.fullName) : 'U'}
              </div>
            )}
            <span className="font-medium text-gray-900">
              {recipientUser?.fullName || 'Loading...'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mini Chat Box */}
      <div id={`${conversation?._id}`} className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {recipientUser?.avatarUrl ? (
                <img 
                  src={recipientUser.avatarUrl} 
                  alt={recipientUser.fullName} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-medium">
                  {getInitials(recipientUser?.fullName || 'User')}
                </span>
              )}
            </div>
            <span className="font-medium text-sm">
              {recipientUser?.fullName || 'Chat'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-1 hover:bg-white/20 rounded"
              title="Create group chat"
            >
              <Users className="w-4 h-4" />
            </button>
            <button title="Close chat"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : messages.length > 0 ? (
            [...messages]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((message) => {
                const isCurrentUser = message.senderId === currentUser?._id;
                const showDetailedTime = showTimestampFor === message._id;
                
                return (
                  <div
                    key={message._id}
                    className={`group flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end space-x-2 max-w-[80%] relative">
                      {!isCurrentUser && (
                        <div className="flex-shrink-0">
                          {recipientUser?.avatarUrl ? (
                            <img 
                              src={recipientUser.avatarUrl}
                              alt={recipientUser.fullName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                              {recipientUser?.fullName ? getInitials(recipientUser.fullName) : '?'}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="relative group/message flex items-end">
                        {/* Message bubble with actions container */}
                        <div className="relative">
                          {/* Message bubble */}
                          <div className="flex flex-col">
                            <div
                              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                isCurrentUser
                                  ? 'bg-rose-500 text-white rounded-br-none hover:bg-rose-600'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none hover:bg-gray-200'
                              }`}
                            >
                              {message.content}
                            </div>
                            
                            {/* Display reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className={`mt-1 flex flex-wrap gap-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                                  const reactions = message.reactions.filter(r => r.emoji === emoji);
                                  const userReacted = reactions.some(r => r.user._id === currentUser?._id);
                                  
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={(e) => handleReaction(e, message._id, emoji)}
                                      className={`text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                                        userReacted
                                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      <span className="text-xs">{reactions.length}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Timestamp display - appears below message */}
                          {showTimestampFor === message._id && (
                            <div className={`text-xs text-gray-600 mt-1 ${
                              isCurrentUser ? 'text-right' : 'text-left'
                            }`}>
                              {message.createdAt && formatMessageTime(message.createdAt, true)}
                            </div>
                          )}
                        </div>

                        {/* Hover action buttons - positioned horizontally next to message */}
                        <div className={`flex items-center space-x-1 px-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 ${
                          isCurrentUser ? 'order-first' : 'order-last'
                        }`}>
                          {/* Reaction button */}
                            <button
                              onClick={(e) => toggleReactions(e, message._id)}
                              className="p-1 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100 transition-colors reaction-button"
                              title="Add reaction"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                          
                          {/* Timestamp button */}
                            <button
                              onClick={(e) => toggleTimestamp(e, message._id)}
                              className="p-1 text-gray-600 hover:text-rose-500 rounded-full hover:bg-gray-100 transition-colors timestamp-button"
                              title="View timestamp"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reaction popup - positioned above the message */}
                        {showReactionsFor === message._id && (
                          <div 
                            className={`absolute bottom-full mb-1 bg-white rounded-full shadow-lg p-1 border border-gray-200 flex items-center space-x-1 z-10 reaction-popup ${
                              isCurrentUser ? 'right-0' : 'left-0'
                            }`}
                            onMouseLeave={() => setShowReactionsFor(null)}
                          >
                            {[
                              '👍', '❤️', '😆', '😮', '😢', '🙏'
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(e) => handleReaction(e, message._id, emoji)}
                                className="text-2xl hover:scale-125 transform transition-transform duration-150 p-1 hover:bg-gray-100 rounded-full"
                                title="Add reaction"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowReactionsFor(null);
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                              title="Close"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {isCurrentUser && (
                        <div className="flex-shrink-0">
                          {currentUser?.avatarUrl ? (
                            <img 
                              src={currentUser.avatarUrl}
                              alt={currentUser.fullName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs text-rose-600">
                              {currentUser?.fullName ? getInitials(currentUser.fullName) : 'You'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No messages yet. Start the conversation! 👋
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button title="Attach a file" className="p-1 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <button title="Add an emoji" className="p-1 text-gray-400 hover:text-gray-600">
              <Smile className="w-4 h-4" />
            </button>
            <div className="flex-1 flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-sm"
                disabled={loading}
              />
              <button title="Send message"
                onClick={sendMessage}
                disabled={loading || !inputValue.trim()}
                className="px-3 py-2 bg-rose-500 text-white rounded-r-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Chat Modal - Simple placeholder for now */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Group Chat</h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-gray-500 text-center py-8">
              Group chat creation coming soon...
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}