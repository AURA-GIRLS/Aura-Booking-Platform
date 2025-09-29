'use client';

import React from 'react';
import { Bell, Search, User, Settings, LogOut, Menu } from 'lucide-react';
import { UserResponseDTO } from '@/types/user.dtos';

interface AdminHeaderProps {
  user: UserResponseDTO | null;
  onMenuToggle?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onMenuToggle }) => {
   const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/auth/login';
  };
  return (
    <header className="bg-white border-b border-rose-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-rose-50 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, transactions, MUAs..."
              className="pl-10 pr-4 py-2 w-80 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-rose-50 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full"></span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-rose-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">24</div>
              <div className="text-xs text-rose-600">Pending</div>
            </div>
            <div className="w-px h-8 bg-rose-200"></div>
            <div className="text-center">
              <div className="text-sm font-semibold text-pink-600">156</div>
              <div className="text-xs text-rose-600">Active</div>
            </div>
            <div className="w-px h-8 bg-rose-200"></div>
            <div className="text-center">
              <div className="text-sm font-semibold text-rose-600">$12.5k</div>
              <div className="text-xs text-rose-600">Today</div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {user && (
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-xs text-rose-600">Administrator</div>
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-rose-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <a href="/admin/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50">
                  <User className="w-4 h-4" />
                  Profile
                </a>
                <hr className="my-2 border-rose-100" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;