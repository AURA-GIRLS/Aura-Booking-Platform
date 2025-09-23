"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, History } from "lucide-react";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const pathname = usePathname();

    const navigationItems = [
        {
        href: "/user/profile",
        label: "My Profile",
        icon: User,
        matchPaths: ["/user/profile", "/user/profile/edit-profile"]
        },
        {
        href: "/user/profile/booking-history",
        label: "Booking History", 
        icon: History,
        matchPaths: ["/user/profile/booking-history"]
        }
    ];

  const isActive = (item: typeof navigationItems[0]) => {
    if (pathname === "/user/profile/booking-history") {
      return item.href === "/user/profile/booking-history";
    }
    
    if (item.href === "/user/profile") {
      return pathname === "/user/profile" || pathname === "/user/profile/edit-profile";
    }

    return pathname === item.href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-rose-50/20 to-white relative overflow-hidden">
      {/* Floating background circles for depth - Responsive */}
      <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-pink-200/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-16 right-16 sm:bottom-32 sm:right-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-rose-200/20 rounded-full blur-3xl opacity-25"></div>
      <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-pink-300/15 rounded-full blur-2xl opacity-20"></div>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar Navigation - Glass Effect - Responsive */}
        <div className="hidden lg:flex lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0">
          <div className="w-full bg-gradient-to-b from-pink-50/60 via-rose-50/40 to-pink-50/60 backdrop-blur-xl border-r border-pink-100/50 shadow-lg">
            <div className="p-4 lg:p-6 xl:p-8">
              {/* Header */}
              <div className="mb-8 lg:mb-10 xl:mb-12">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Account Settings</h2>
                <p className="text-gray-600 text-xs lg:text-sm">Manage your profile and preferences</p>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2 lg:space-y-3 xl:space-y-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  
                  return (
                    <Link
                      key={item.href}
                      href={{ pathname: item.href }}
                      className={`
                        group flex items-center px-4 lg:px-5 xl:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-300 relative
                        ${active 
                          ? 'bg-white shadow-md border border-pink-100/50' 
                          : 'hover:bg-pink-50/60'
                        }
                      `}
                    >
                      {/* Active gradient left border */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 lg:h-10 bg-gradient-to-b from-pink-400 via-pink-500 to-rose-500 rounded-r-full"></div>
                      )}
                      
                      <Icon 
                        size={18} 
                        className={`mr-3 lg:mr-4 transition-colors lg:w-5 lg:h-5 ${
                          active 
                            ? 'text-pink-600' 
                            : 'text-gray-500 group-hover:text-pink-500'
                        }`} 
                      />
                      <span className={`text-sm lg:text-base font-medium transition-colors ${
                        active 
                          ? 'text-gray-800 font-semibold' 
                          : 'text-gray-600 group-hover:text-gray-800'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Responsive */}
        <div className="lg:hidden w-full bg-white/80 backdrop-blur-sm border-b border-pink-100/50 p-3 sm:p-4">
          <div className="flex space-x-1 sm:space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={{ pathname: item.href }}
                  className={`
                    flex-1 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300
                    ${active 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-pink-50'
                    }
                  `}
                >
                  <Icon size={16} className="sm:mr-2 mb-1 sm:mb-0" />
                  <span className="text-xs sm:text-sm font-medium text-center">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content - Responsive */}
        <div className="flex-1 bg-gradient-to-br from-white via-pink-50/10 to-rose-50/10">
          <div className="max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
