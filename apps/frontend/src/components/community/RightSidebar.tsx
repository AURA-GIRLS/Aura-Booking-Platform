import { Search } from 'lucide-react';
import type { Conversation, User, Event } from './community.types';
import { Input } from '../lib/ui/input';
import { useAuthCheck } from '../../utils/auth';

export default function RightSidebar({ selectedTab, setSelectedTab, conversations, currentUser, events }: Readonly<{
  selectedTab: string;
  setSelectedTab: (t: string) => void;
  conversations: Conversation[];
  currentUser: User;
  events: Event[];
}>) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const { isAuthenticated } = useAuthCheck();

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
            <button key={tab} onClick={() => setSelectedTab(tab)} className={`text-sm font-medium pb-2 border-b-2 ${selectedTab === tab ? 'text-rose-600 border-rose-600' : 'text-gray-500 border-transparent'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const other = conv.participants.find(p => p.id !== currentUser.id);
          if (!other) return null;
          return (
            <div key={conv.id} className="flex items-center p-4 hover:bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{getInitials(other.fullName)}</span>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900">{other.fullName}</h4>
                  {conv.unreadCount > 0 && <span className="flex items-center bg-rose-600 text-white text-xs rounded-full px-2">{conv.unreadCount}</span>}
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Events</h4>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          {events.slice(0, 3).map(e => (
            <div key={e.id}>
              <div className="font-medium">{e.title}</div>
              <div className="text-gray-400">{e.date.toLocaleDateString()} • {e.location}</div>
            </div>
          ))}
        </div>
      </div> */}
      
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
