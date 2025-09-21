import { Users } from 'lucide-react';
import type { User, Page } from './community.types';

export default function LeftSidebar({ currentUser, pages }: Readonly<{ currentUser: User; pages: Page[] }>) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 p-4">
      {/* Profile */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">{getInitials(currentUser.fullName)}</span>
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-gray-900">{currentUser.fullName}</h3>
          <p className="text-sm text-gray-500">@{currentUser.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between mb-6 text-center">
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followerCount}</div>
          <div className="text-xs text-gray-500">Follower</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.followingCount}</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{currentUser.postCount}</div>
          <div className="text-xs text-gray-500">Post</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <button className="flex items-center w-full text-left px-3 py-2 text-white bg-rose-600 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Feed
        </button>
        <button className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Following Users
        </button>
        <button className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Users className="w-5 h-5 mr-3" /> Following Artists
        </button>
        {/* <button className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Calendar className="w-5 h-5 mr-3" /> Event
        </button>
        <button className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <VideoIcon className="w-5 h-5 mr-3" /> Watch Videos
        </button>
        <button className="flex items-center w-full px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg">
          <Image className="w-5 h-5 mr-3" /> Photos
        </button> */}
      </nav>

      {/* Pages */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">TRENDING TAGS</h4>
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
              <span className="ml-3 text-sm text-gray-700">#{page.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
