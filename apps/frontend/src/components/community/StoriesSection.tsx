import { Plus } from 'lucide-react';
import type { Story, User } from './community.types';

export default function StoriesSection({ stories, currentUser }: { stories: Story[]; currentUser: User }) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        <div className="flex-shrink-0 text-center cursor-pointer">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full p-1 relative">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <p className="text-xs mt-1 text-gray-600">Top Artist Wall</p>
        </div>
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
            <div className={`w-16 h-16 rounded-full p-1 ${story.isViewed ? 'bg-gray-300' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
              <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-black rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{getInitials(story.user.fullName)}</span>
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-600">{story.user.fullName.split(' ')[0]}'s Wall</p>
          </div>
        ))}
      </div>
    </div>
  );
}
