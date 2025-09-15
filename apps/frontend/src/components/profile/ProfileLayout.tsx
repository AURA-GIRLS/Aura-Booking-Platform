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
      {/* Floating background circles for depth */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-32 right-32 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl opacity-25"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-300/15 rounded-full blur-2xl opacity-20"></div>

      <div className="flex min-h-screen">
        {/* Sidebar Navigation - Glass Effect */}
        <div className="hidden lg:flex lg:w-80 flex-shrink-0">
          <div className="w-full bg-gradient-to-b from-pink-50/60 via-rose-50/40 to-pink-50/60 backdrop-blur-xl border-r border-pink-100/50 shadow-lg">
            <div className="p-8">
              {/* Header */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Settings</h2>
                <p className="text-gray-600 text-sm">Manage your profile and preferences</p>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  
                  return (
                    <Link
                      key={item.href}
                      href={{ pathname: item.href }}
                      className={`
                        group flex items-center px-6 py-4 rounded-2xl transition-all duration-300 relative
                        ${active 
                          ? 'bg-white shadow-md border border-pink-100/50' 
                          : 'hover:bg-pink-50/60'
                        }
                      `}
                    >
                      {/* Active gradient left border */}
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-pink-400 via-pink-500 to-rose-500 rounded-r-full"></div>
                      )}
                      
                      <Icon 
                        size={20} 
                        className={`mr-4 transition-colors ${
                          active 
                            ? 'text-pink-600' 
                            : 'text-gray-500 group-hover:text-pink-500'
                        }`} 
                      />
                      <span className={`font-medium transition-colors ${
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

        {/* Mobile Navigation */}
        <div className="lg:hidden w-full bg-white/80 backdrop-blur-sm border-b border-pink-100/50 p-4">
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              
              return (
                <Link
                  key={item.href}
                  href={{ pathname: item.href }}
                  className={`
                    flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300
                    ${active 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-pink-50'
                    }
                  `}
                >
                  <Icon size={18} className="mr-2" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content - Full Space */}
        <div className="flex-1 bg-gradient-to-br from-white via-pink-50/10 to-rose-50/10">
          <div className="max-w-5xl mx-auto p-8 lg:p-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
