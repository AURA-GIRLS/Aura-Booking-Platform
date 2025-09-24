import { Calendar, Users, Edit, BarChart3, MapPin, Star, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MuaResponseDTO } from '@/types/user.dtos';

interface ProfileHeaderProps {
  linkId: string;
}

export default function ProfileHeader({ linkId }: ProfileHeaderProps) {
  const router = useRouter();
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const storedMua = localStorage.getItem("currentMUA");
      const storedUser = localStorage.getItem("currentUser");
      if (storedMua && storedMua !== "undefined") {
        setMua(JSON.parse(storedMua));
      }
      if (storedUser && storedUser !== "undefined") {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
    }
  }, []);

  const navigateTo = (path: string) => {
    window.location.href = `/manage-artist/${linkId}${path}`;
  };
  
  const displayAvatar: string | undefined = currentUser?.avatarUrl || (mua as any)?.user?.avatarUrl || (mua as any)?.avatarUrl || '/default-avatar.jpg';
  const displayName: string = currentUser?.fullName || (mua as any)?.user?.fullName || (mua as any)?.fullName || (mua as any)?.user?.userName || (mua as any)?.userName || 'Artist';
  const displayLocation: string = (mua as any)?.location || 'Ho Chi Minh City';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center overflow-hidden">
            {displayAvatar ? (
              <img 
                src={displayAvatar} 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-pink-600">
                {displayName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {displayName}
              </h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                <CheckCircle size={12} />
                Verified
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{displayLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} />
                <span>5 years experience</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateTo('/calendar')}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            <Calendar size={16} />
            Manage Schedule
          </button>
          <button 
            onClick={() => navigateTo('/services')}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            <Users size={16} />
            Manage Services
          </button>
          <button 
            onClick={() => navigateTo('/profile')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit size={16} />
            Edit Profile
          </button>
          <button 
            onClick={() => navigateTo('/analytics')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
