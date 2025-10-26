import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Event } from './community.types';
import type { ConversationDTO } from '../../types/chat.dtos';
import { Input } from '../lib/ui/input';
import { useAuthCheck } from '../../utils/auth';
import { ChatService } from '../../services/chat';
import { UserWallResponseDTO } from '@/types/community.dtos';

export default function RightSidebar({ 
  selectedTab, 
  setSelectedTab, 
  currentUser, 
  events,
  onConversationClick 
}: Readonly<{
  selectedTab: string;
  setSelectedTab: (t: string) => void;
  currentUser: UserWallResponseDTO|null;
  events: Event[];
  onConversationClick: (conversation: ConversationDTO) => void;
}>) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthCheck();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoading(true);
        const response = await ChatService.getConversations({ page: 1, limit: 50 });
        console.log("response conversations:", response);
        if (response.success && response.data) {
          setConversations(response.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [conversations.length]);

  // Filter conversations based on selected tab
  const filteredConversations = conversations.filter(conv => {
    if (selectedTab === 'Primary') {
      return conv.isPinned === true;
    } else {
      return conv.isPinned !== true;
    }
  });


  return (
    <div className="w-80 bg-white h-screen sticky top-0 border-l border-gray-200 relative">
      <div className="px-4 relative w-full max-w-sm mt-4 mb-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search posts, users, tags..."
          className="pl-10 bg-white text-gray-800 placeholder-gray-400 border-[0.5px] border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded-md"
        />
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex space-x-4">
          {['Primary', 'General'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setSelectedTab(tab)} 
              className={`text-sm font-medium pb-2 border-b-2 ${selectedTab === tab ? 'text-rose-600 border-rose-600' : 'text-gray-500 border-transparent'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {selectedTab === 'Primary' ? 'No pinned conversations' : 'No conversations'}
          </div>
        ) : (
          filteredConversations.map(conv => {
            // For private conversations, find the other participant
            const otherParticipant = conv.type === 'private' 
              ? conv.participants.find(p => p._id !== currentUser?._id)
              : null;
            const displayName = conv.type === 'group' 
              ? conv.name || 'Group Chat'
              : otherParticipant 
                ? otherParticipant.fullName 
                : 'Unknown User';

            const avatarUrl = conv.type === 'group' 
              ? conv.avatarUrl 
              : otherParticipant 
                ? otherParticipant.avatarUrl 
                : undefined;

            return (
              <div
                key={conv._id}
                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => onConversationClick(conv)}
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-medium">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm">{getInitials(displayName)}</span>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
                    {conv.isPinned && (
                      <span className="ml-2 text-rose-500">📌</span>
                    )}
                  </div>
                  <p className={`text-sm text-gray-500 truncate ${conv.lastMessage?.status === 'read' ? 'font-normal' : 'font-semibold'}`}>
                    {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(conv.updatedAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isAuthenticated() && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Login to experience
          </button>
        </div>
      )}
    </div>
  );
}
