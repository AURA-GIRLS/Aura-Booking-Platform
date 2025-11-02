"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/lib/ui/avatar';
import { NavbarProps } from '@/types/user.dtos';
import { initSocket, getSocket } from '@/config/socket';

export default function Navbar({ user, setUser }: Readonly<NavbarProps>)  {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    // Simulate checking for user from localStorage or other async source
    const timer = setTimeout(() => {
      setIsUserLoaded(true);
    }, 100); // Short delay to ensure user state is properly loaded
    if(user){
      const socket = getSocket();
      socket?.emit("auth:user", user?._id);
    }

    return () => clearTimeout(timer);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentMUA');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const avatarUrl = user?.avatarUrl || '/images/danang.jpg';

  if (!isUserLoaded) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          {/* Logo skeleton */}
          <div className="h-12 w-24 bg-rose-100 rounded animate-pulse"></div>
          
          {/* Menu skeleton */}
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-12 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-4 w-14 bg-rose-100 rounded animate-pulse"></div>
          </div>
          
          {/* Right icons skeleton */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-8 w-8 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-rose-100 rounded-full animate-pulse"></div>
          </div>
          
          {/* Mobile toggle skeleton */}
          <div className="md:hidden h-6 w-6 bg-rose-100 rounded animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Site name */}
        <button type="button" onClick={() => { window.location.href = "/"; }} className="h-12 w-24 focus:outline-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="AURA" src="/images/LOGO_black.png" className="h-12 w-24" />
        </button>

        {/* Center: Menu */}
        <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/user/artists/makeup-artist-list">Makeup Artist</Link></li>
          {/* <li><Link href="/booking">Booking</Link></li> */}
          <li><Link href="/user/community">Community</Link></li>
          <li><Link href={{ pathname: "/user/about" }}>About Us</Link></li>
        </ul>

        {/* Right: Icons */}
        <div className="hidden md:flex items-center gap-3 text-gray-700">
          <button aria-label="Cart" className="p-2 hover:bg-gray-100 rounded">🛒</button>
          <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded">🔔</button>
          {!user ? (
            <Link href="/auth/login">
              <button className="h-8 px-4 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition">Login</button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt="avatar" />
                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-100">
                  <Link href="/user/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-100">
                  <Link href={{ pathname: "/user/profile/booking-history" }}>Booking History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-red-500 cursor-pointer focus:bg-rose-100">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">☰</button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4">
          <ul className="flex flex-col gap-2 text-gray-700 font-medium">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/user/artists/makeup-artist-list">Makeup Artist</Link></li>
          {/* <li><Link href="/booking">Booking</Link></li> */}
          <li><Link href="/user/community">Community</Link></li>
          <li><Link href={{ pathname: "/user/about" }}>About Us</Link></li>
          </ul>
          <div className="mt-3 flex items-center gap-3">
            <button aria-label="Cart" className="p-2 hover:bg-gray-100 rounded">🛒</button>
            <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded">🔔</button>
            {!user ? (
              <Link href="/auth/login">
                <button className="h-8 px-4 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition">Login</button>
              </Link>
            ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt="avatar" />
                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-100">
                  <Link href="/user/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-rose-100">
                  <Link href={{ pathname: "/user/profile/booking-history" }}>Booking History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-red-500 cursor-pointer focus:bg-rose-100">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
