import { X, Send, Users, Smile, Paperclip, Clock, Loader2, Pin } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { formatDistanceToNow, format } from "date-fns";
import { ChatService } from "@/services/chat";
import type { ConversationDTO, MessageDTO } from "../../../types/chat.dtos";
import { useAuthCheck } from "../../../utils/auth";
import { UserWallResponseDTO } from "@/types/community.dtos";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserService } from "@/services/user";
import { UserResponseDTO } from "@/types/user.dtos";
import { UploadService } from "@/services/upload";
import { toast } from "sonner";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFileAudio,
  FaFileVideo,
  FaFileCode,
  FaFileImage,
  FaFileAlt,
  FaFile,
} from "react-icons/fa";
import { initSocket, getSocket } from "@/config/socket"; 

interface MiniChatBoxProps {
  recipientUserId: string;
  currentUser: UserWallResponseDTO | null;
  position: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniChatBox({
  isOpen,
  onClose,
  recipientUserId,
  currentUser,
  position,
}: Readonly<MiniChatBoxProps>) {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [conversation, setConversation] = useState<ConversationDTO | null>(null);
  const [recipientUser, setRecipientUser] = useState<UserResponseDTO | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showTimestampFor, setShowTimestampFor] = useState<string | null>(null);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkAuthAndExecute } = useAuthCheck();

  // ====================== Utility ======================
  const formatMessageTime = (dateString: string, detailed = false) =>
    detailed
      ? format(new Date(dateString), "HH:mm - dd/MM/yyyy")
      : formatDistanceToNow(new Date(dateString), { addSuffix: true });

  // ====================== Conversation Logic ======================

  useEffect(() => {
    if (!recipientUserId) return;
    UserService.getUserById(recipientUserId)
      .then((res) => res.success && res.data && setRecipientUser(res.data))
      .catch(() => setRecipientUser(null));
  }, [recipientUserId]);

  // ====================== Fetch Messages ======================
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?._id) return;
      try {
        setLoading(true);
        const res = await ChatService.getMessages(conversation._id, { page: 1, limit: 50 });
        if (res.success && res.data) setMessages(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversation?._id]);

  // ====================== initSocket() HANDLING ======================
  useEffect(() => {
    if (!conversation?._id) return;
    const roomId = `conversation:${conversation._id}`;
   const socket = getSocket();
    socket?.emit("join", roomId);
    console.log(`🔌 Joined room: ${roomId}`);

    const handleNew = (payload: any) => {
      if (payload.conversationId !== conversation._id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === payload.message._id);
        return exists ? prev : [...prev, payload.message];
      });
      scrollToBottom();
      // Play notification sound for incoming messages from other users
      try {
        const senderId = typeof payload.message.senderId === 'object' ? payload.message.senderId._id : payload.message.senderId;
        if (String(senderId) !== String(currentUser?._id)) {
          // small beep using WebAudio API
          const playBeep = (volume = 0.6) => {
            try {
              const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
              if (!AudioContext) return;
              const ctx = new AudioContext();
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              // Use a brighter frequency and slightly wider bandwidth for clarity
              o.type = 'sine';
              o.frequency.value = 1200; // Hz
              o.connect(g);
              g.connect(ctx.destination);
              // Start from near-zero gain, ramp quickly to target volume then fade out
              const now = ctx.currentTime;
              g.gain.setValueAtTime(0.00001, now);
              // Quick attack
              g.gain.linearRampToValueAtTime(Math.min(Math.max(volume, 0.05), 1), now + 0.01);
              o.start(now);
              // Short decay to make it less jarring
              g.gain.linearRampToValueAtTime(0.00001, now + 0.28);
              // Stop oscillator and close context after sound
              setTimeout(() => {
                try { o.stop(); ctx.close(); } catch { }
              }, 350);
            } catch (e) {
              // ignore sound errors
            }
          };

          // Try to resume AudioContext on user gesture if needed
          playBeep();
        }
      } catch (e) {
        // ignore
      }
    };

    const handleReact = (payload: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? {
                ...m,
                reactions: [
                  ...(m.reactions || []).filter(
                    (r) => r.user && r.user._id !== payload.reaction.user?._id
                  ),
                  payload.reaction,
                ],
              }
            : m
        )
      );
    };

    const handleUnreact = (payload: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload.messageId
            ? {
                ...m,
                reactions: (m.reactions || []).filter(
                  (r) => r.user && r.user._id !== payload.userId
                ),
              }
            : m
        )
      );
    };

   const handleConvUpdate = (payload: any) => {
  if (payload.conversationId === conversation?._id && payload.data) {
    setConversation((prev) => (prev ? { ...prev, ...payload.data } : prev));
    if (payload.data.isPinned !== undefined) {
      toast(payload.data.isPinned ? "📌 Conversation pinned" : "Conversation unpinned");
    }
  }
};


    socket?.on("message:new", handleNew);
    socket?.on("message:react", handleReact);
    socket?.on("message:unreact", handleUnreact);
    socket?.on("conversation:update", handleConvUpdate);

    return () => {
      socket?.emit("leave", roomId);
      socket?.off("message:new", handleNew);
      socket?.off("message:react", handleReact);
      socket?.off("message:unreact", handleUnreact);
      socket?.off("conversation:update", handleConvUpdate);
      console.log(`🚪 Left room: ${roomId}`);
    };
  }, [conversation?._id]);

 
  // ====================== UI logic (unchanged except initSocket()) ======================



  if (!isOpen) return null;

 

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


  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const getFileIcon = (extension: string) => {
    const iconClass = 'w-5 h-5';
    
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FaFilePdf className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FaFileWord className={`${iconClass} text-blue-600`} />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FaFileExcel className={`${iconClass} text-green-600`} />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className={`${iconClass} text-orange-500`} />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FaFileArchive className={`${iconClass} text-yellow-600`} />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
        return <FaFileAudio className={`${iconClass} text-purple-500`} />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return <FaFileVideo className={`${iconClass} text-blue-400`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return <FaFileImage className={`${iconClass} text-green-400`} />;
      case 'html':
      case 'css':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
        return <FaFileCode className={`${iconClass} text-blue-400`} />;
      case 'txt':
      case 'md':
        return <FaFileAlt className={`${iconClass} text-gray-500`} />;
      default:
        return <FaFile className={`${iconClass} text-gray-400`} />;
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when component mounts or conversation changes


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

const sendMessage = async (fileUrl?: string) => {
  const content = inputValue.trim();
  if ((!content && !fileUrl) || !recipientUserId) return;

  checkAuthAndExecute(async () => {
    try {
      setLoading(true);
      const conv = await ensureConversation();
      if (!conv) return;

      let messageContent = content;
      if (fileUrl) {
        messageContent = content ? `${content}\n${fileUrl}` : fileUrl;
      }

      const response = await ChatService.sendMessage(conv._id, {
        content: messageContent,
      });

      if (response.success) {
        setInputValue('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  });
};

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsFileUploading(true);

    // Validate file type
    const validTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/pdf',
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'image/apng',
      'image/bmp',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(zip|rar|7z|doc|docx|ppt|pptx|xls|xlsx|txt|pdf)$/i)) {
      toast.error('File type not supported. Please upload a valid document file.');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload file
      const uploadResponse = await UploadService.uploadFile(file, {
        resourceType: 'raw',
        folder: 'chat/files',
        options: {
          onUploadProgress: (progressEvent: any) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(progress);
          }
        }
      });

      if (uploadResponse.success && uploadResponse.data) {
        // Send message with file URL
        await sendMessage(uploadResponse.data.url);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsFileUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
const handleTogglePin = async () => {
  if (!conversation?._id) return;
  try {
    const shouldPin = !conversation.isPinned;
    const response = await ChatService.togglePinConversation(conversation._id, shouldPin);
    if (response.success) {
      setConversation((prev) => prev ? { ...prev, isPinned: shouldPin } : prev);
      toast.success(shouldPin ? "📌 Conversation pinned" : "Conversation unpinned");
    } else {
      toast.error("Failed to update pin status");
    }
  } catch (error) {
    console.error("Failed to toggle pin:", error);
    toast.error("Error updating pin status");
  }
};

  if (!isOpen) return null;

  if (loading && messages.length === 0) {
    return (
      <div
        className="fixed w-80 h-96  bg-white rounded-t-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
        style={{
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
      <div id={`${conversation?._id}`}
       style={{
          right: position?.right || '20px',
          bottom: position?.bottom || '20px',
          zIndex: 50,
        }}
      className="fixed w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
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
            {/* 📌 Pin / Unpin */}
  <button
    onClick={handleTogglePin}
    title={conversation?.isPinned ? "Unpin conversation" : "Pin conversation"}
    className={`p-1 rounded hover:bg-white/20 transition-colors ${
      conversation?.isPinned ? "text-yellow-300" : "text-white"
    }`}
  >
    <Pin className="w-4 h-4" fill={conversation?.isPinned ? "currentColor" : "none"} />
  </button>
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
                            <div className="space-y-2">
                              {/* Render message text if exists */}
                              {message.content && !message.content.startsWith('http') && (
                                <div className={`px-3 py-2 rounded-lg text-sm ${isCurrentUser
                                  ? 'bg-rose-500 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                  }`}>
                                  {message.content}
                                </div>
                              )}

                              {/* Render files/images if URL exists in content */}
                              {message.content && message.content.startsWith('http') && (
                                <div className="w-full max-w-[280px]">
                                  <div className="grid grid-cols-1 gap-2">
                                    {message.content.split('\n').map((url, idx) => {
                                      if (!url.startsWith('http')) return null;
                                      const isImage = /.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
                                      const fileName = url.split('/').pop() || 'file';
                                      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

                                      if (isImage) {
                                        return (
                                          <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block overflow-hidden rounded-md"
                                          >
                                            <img
                                              src={url}
                                              alt="Uploaded content"
                                              className="w-full h-24 object-cover rounded-md hover:opacity-90 transition-opacity"
                                            />
                                          </a>
                                        );
                                      } else {
                                        return (
                                          <a
                                            key={idx}
                                            href={url}
                                            download={fileName} // This will preserve the original filename and extension
                                            title={fileName}
                                            className={`col-span-2 block p-3 rounded-lg text-sm hover:bg-gray-200 ${isCurrentUser
                                                ? 'bg-white text-rose-600 border border-rose-100'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                              } hover:shadow-sm transition-shadow w-full`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <div className="flex items-center space-x-2">
                                              <div className="flex-shrink-0">
                                                {getFileIcon(fileExt)}
                                              </div>
                                              <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                  {fileName}
                                                </p>
                                              </div>
                                            </div>
                                          </a>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Display reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className={`mt-1 flex flex-wrap gap-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                                  const reactions = message.reactions.filter(r => r.emoji === emoji);
                                  const userReacted = reactions.some(r => r.user?._id && currentUser?._id && r.user._id === currentUser._id);

                                  return (
                                    <button
                                      key={emoji}
                                      onClick={(e) => handleReaction(e, message._id, emoji)}
                                      className={`text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 ${userReacted
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
                            <div className={`text-xs text-gray-600 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'
                              }`}>
                              {message.createdAt && formatMessageTime(message.createdAt, true)}
                            </div>
                          )}
                        </div>

                        {/* Hover action buttons - positioned horizontally next to message */}
                        <div className={`flex items-center space-x-1 px-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 ${isCurrentUser ? 'order-first' : 'order-last'
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
                            className={`absolute bottom-full mb-1 bg-white rounded-full shadow-lg p-1 border border-gray-200 flex items-center space-x-1 z-10 reaction-popup ${isCurrentUser ? 'right-0' : 'left-0'
                              }`}
                            onMouseLeave={() => setShowReactionsFor(null)}
                          >
                            {[
                              '👍', '❤️', '😆', '😮', '😢'
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(e) => handleReaction(e, message._id, emoji)}
                                className="text-xl hover:scale-125 transform transition-transform duration-150 p-1 hover:bg-gray-100 rounded-full"
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
          ) :null}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-2 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={isUploading}
                title="Attach a file"
                className="p-2 text-gray-500 hover:text-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>
              <input
              title="Upload file"
              placeholder="Upload file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".zip,.rar,.7z,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.pdf,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/pdf,.jpg,.jpeg,.png,.gif,.webp"
              />
              {isUploading && (
                <div className="absolute bottom-full left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add an emoji"
                className="p-2 text-gray-500 hover:text-rose-500"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker
                    onEmojiClick={(emojiData: EmojiClickData) => {
                      setInputValue(prev => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                      messageInputRef.current?.focus();
                    }}
                    width={280}
                    height={350}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                    searchDisabled={false}
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
              <input
                ref={messageInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isFileUploading ? "Uploading..." : "Type a message..."}
                disabled={isFileUploading}
                className="flex-1 w-10 px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                title="Send message"
                onClick={() => sendMessage()}
                disabled={loading || (!inputValue.trim() && !isUploading)}
                className="px-3 bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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