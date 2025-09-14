"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/lib/ui/avatar';
import { NavbarProps } from '@/types/user.dtos';

export default function ArtistNavbar({ user, setUser }:  Readonly<NavbarProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(user?._id || null);
  }, [user]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    
    setUser(null);
    window.location.href = '/auth/login';
  };

  const avatarUrl = user?.avatarUrl || '/images/danang.jpg';

  return (
    <nav className="w-full bg-pink-50 shadow-sm border-b border-pink-100">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        {/* Left: Logo + Site name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-pink-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow">A</div>
          <span className="font-semibold text-pink-600 text-lg tracking-wide">AURA.com</span>
        </div>

        {/* Center: Menu */}
        <ul className="hidden md:flex items-center gap-6 text-pink-700 font-medium">
          <li><Link href={`/manage-artist/${id}/dashboard`}>Dashboard</Link></li>
          <li><Link href={`/manage-artist/${id}/portfolio`}>My Portfolio</Link></li>
          <li><Link href={`/manage-artist/${id}/calendar`}>My Calendar</Link></li>
          <li><Link href={`/manage-artist/${id}/feedback`}>My Feedback</Link></li>
          <li><Link href={`/manage-artist/${id}/blog`}>My Blog</Link></li>
          <li><Link href="/about">About Us</Link></li>
        </ul>

        {/* Right: Icons */}
        <div className="hidden md:flex items-center gap-3 text-pink-700">
          <button aria-label="Cart" className="p-2 hover:bg-pink-100 rounded-full">🛒</button>
          <button aria-label="Notifications" className="p-2 hover:bg-pink-100 rounded-full">🔔</button>
          {!user ? (
            <Link href="/auth/login">
              <button className="h-8 px-4 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Login</button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="h-9 w-9 rounded-full bg-pink-100 overflow-hidden border-2 border-pink-300 hover:border-pink-500 transition focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt="avatar" />
                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                <DropdownMenuItem asChild>
                  <Link href="/profile/my-profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/booking">Booking History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-red-500 cursor-pointer">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-pink-700 text-2xl">☰</button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-8 pb-4 bg-pink-50 border-t border-pink-100">
          <ul className="flex flex-col gap-2 text-pink-700 font-medium">
            <li><Link href={`/manage-artist/${id}/dashboard`}>Dashboard</Link></li>
            <li><Link href={`/manage-artist/${id}/portfolio`}>My Portfolio</Link></li>
            <li><Link href={`/manage-artist/${id}/calendar`}>My Calendar</Link></li>
            <li><Link href={`/manage-artist/${id}/feedback`}>My Feedback</Link></li>
            <li><Link href={`/manage-artist/${id}/blog`}>My Blog</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
          <div className="mt-3 flex items-center gap-3">
            <button aria-label="Cart" className="p-2 hover:bg-pink-100 rounded-full">🛒</button>
            <button aria-label="Notifications" className="p-2 hover:bg-pink-100 rounded-full">🔔</button>
            {!user ? (
              <Link href="/auth/login">
                <button className="h-8 px-4 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Login</button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="Account" className="h-9 w-9 rounded-full bg-pink-100 overflow-hidden border-2 border-pink-300 hover:border-pink-500 transition focus:outline-none">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarUrl} alt="avatar" />
                      <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                  <DropdownMenuItem asChild>
                    <Link href="/">My Public Portfolio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">My Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-red-500 cursor-pointer">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
