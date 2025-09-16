"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/lib/ui/avatar';
import { ArtistNavbarProps } from "@/types/user.dtos";

export default function ArtistNavbar({ mua, setMua }:  Readonly<ArtistNavbarProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  // Defer reading from localStorage until client-side to avoid SSR ReferenceError
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('currentUser');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to parse currentUser from localStorage', e);
      }
    }
  }, []);
  useEffect(() => {
    setId(mua?._id || null);
  }, [mua]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentMUA');
    setMua(null);
    window.location.href = '/auth/login';
  };

  const avatarUrl = user?.avatarUrl || '/images/danang.jpg';

  return (
    <nav className="w-full bg-white shadow-sm border-b border-[#EC5A86]/30">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        {/* Left: Logo + Site name */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#EC5A86] text-white text-xs flex items-center justify-center rounded-full font-bold shadow">A</div>
          <span className="font-semibold text-[#111] text-lg tracking-wide">AURA.com</span>
        </div>

        {/* Center: Menu */}
        { /* Helper to build dynamic artist paths safely */ }
        {id && (
          <ul className="hidden md:flex items-center gap-6 text-[#111] font-medium hover:*:text-[#EC5A86] *:transition-colors">
            <li><a href={`/manage-artist/${id}/dashboard`}>Dashboard</a></li>
            <li><a href={`/manage-artist/${id}/portfolio`}>My Portfolio</a></li>
            <li><a href={`/manage-artist/${id}/calendar`}>My Calendar</a></li>
            <li><a href={`/manage-artist/${id}/feedback`}>My Feedback</a></li>
            <li><a href={`/manage-artist/${id}/blog`}>My Blog</a></li>
            <li><a href="/manage-artist/about">About Us</a></li>
          </ul>
        )}

        {/* Right: Icons */}
        <div className="hidden md:flex items-center gap-3 text-[#111]">
          <button aria-label="Cart" className="p-2 hover:bg-[#EC5A86]/10 rounded-full transition-colors">🛒</button>
          <button aria-label="Notifications" className="p-2 hover:bg-[#EC5A86]/10 rounded-full transition-colors">🔔</button>
          {!user ? (
            <Link href="/auth/login">
              <button className="h-8 px-4 rounded-full bg-[#EC5A86] text-white font-semibold hover:bg-[#d54e77] transition">Login</button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="h-9 w-9 rounded-full bg-white overflow-hidden border-2 border-[#EC5A86]/30 hover:border-[#EC5A86] transition focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl} alt="avatar" />
                    <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-[#EC5A86]/20">
                {/* <DropdownMenuItem asChild>
                  <a href="/user/profile">My Profile</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/user/profile/booking-history">Booking History</a>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-[#EC5A86] cursor-pointer hover:bg-[#EC5A86]/10">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#111] text-2xl hover:text-[#EC5A86] transition-colors">☰</button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-8 pb-4 bg-white border-t border-[#EC5A86]/30">
          {id && (
            <ul className="flex flex-col gap-2 text-[#111] font-medium hover:*:text-[#EC5A86] *:transition-colors">
              <li><a href={`/manage-artist/${id}/dashboard`}>Dashboard</a></li>
              <li><a href={`/manage-artist/${id}/portfolio`}>My Portfolio</a></li>
              <li><a href={`/manage-artist/${id}/calendar`}>My Calendar</a></li>
              <li><a href={`/manage-artist/${id}/feedback`}>My Feedback</a></li>
              <li><a href={`/manage-artist/${id}/blog`}>My Blog</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button aria-label="Cart" className="p-2 hover:bg-[#EC5A86]/10 rounded-full transition-colors">🛒</button>
            <button aria-label="Notifications" className="p-2 hover:bg-[#EC5A86]/10 rounded-full transition-colors">🔔</button>
            {!user ? (
              <Link href="/auth/login">
                <button className="h-8 px-4 rounded-full bg-[#EC5A86] text-white font-semibold hover:bg-[#d54e77] transition">Login</button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button aria-label="Account" className="h-9 w-9 rounded-full bg-white overflow-hidden border-2 border-[#EC5A86]/30 hover:border-[#EC5A86] transition focus:outline-none">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarUrl} alt="avatar" />
                      <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-[#EC5A86]/20">
                  <DropdownMenuItem asChild>
                    <Link href="/">My Public Portfolio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">My Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-[#EC5A86] cursor-pointer hover:bg-[#EC5A86]/10">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
