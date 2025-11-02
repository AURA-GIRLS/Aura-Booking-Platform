"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/lib/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/lib/ui/avatar';
import { ArtistNavbarProps } from "@/types/user.dtos";
import { getSocket } from "@/config/socket";

export default function ArtistNavbar({ mua, setMua }:  Readonly<ArtistNavbarProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  // Defer reading from localStorage until client-side to avoid SSR ReferenceError
  const [user, setUser] = useState<any>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  // Helper: convert full name to `A+B+C` format for query param `wn`
  const toPlusSeparated = (name?: string) => (name || "").trim().split(/\s+/).filter(Boolean).join("+");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('currentUser');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to parse currentUser from localStorage', e);
      } finally {
        // Set loaded to true after attempting to load user
        setIsUserLoaded(true);
      }
    }
  }, []);
  
  useEffect(() => {
    setId(mua?._id || null);
     if(user){
      const socket = getSocket();
          socket?.emit("auth:user", user?._id);
        }
  }, [mua]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentMUA');
    setMua(null);
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
            <div className="h-4 w-16 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-rose-100 rounded animate-pulse"></div>
            <div className="h-4 w-18 bg-rose-100 rounded animate-pulse"></div>
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
          <img alt="AURA" src="/images/LOGO_black.png" className="h-12 w-24" />
        </button>

        {/* Center: Menu */}
        {id && (
          <ul className="hidden md:flex items-center gap-6 text-[#111] font-medium hover:*:text-[#EC5A86] *:transition-colors">
            <li><a href={`/manage-artist/${id}/dashboard`}>Dashboard</a></li>
            <li><a href={`/manage-artist/${id}/portfolio`}>My Portfolio</a></li>
            <li><a href={`/manage-artist/${id}/calendar`}>My Calendar</a></li>
            <li><a href={`/manage-artist/${id}/feedback`}>My Feedback</a></li>
            <li><Link href={`/manage-artist/${id}/community?wall=${user?._id}&wn=${toPlusSeparated(user?.fullName)}`}>Community</Link></li>
            <li><a href="/manage-artist/about">About Us</a></li>
          </ul>
        )}

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
                    <AvatarFallback>{user?.fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                  <DropdownMenuItem asChild  className="cursor-pointer focus:bg-rose-100">
                    <Link href={`/manage-artist/${id}/wallet`}>My Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild  className="cursor-pointer focus:bg-rose-100">
                    <Link href={`/manage-artist/${id}/public-portfolio`}>My Public Portfolio</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/manage-artist/${id}/certificates` as any} className="cursor-pointer focus:bg-rose-100">My Certificates</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="px-2 py-2 text-red-500 cursor-pointer">Logout</DropdownMenuItem>
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
          {id && (
            <ul className="flex flex-col gap-2 text-[#111] font-medium hover:*:text-[#EC5A86] *:transition-colors">
               <li><a href={`/manage-artist/${id}/dashboard`}>Dashboard</a></li>
            <li><a href={`/manage-artist/${id}/portfolio`}>My Portfolio</a></li>
            <li><a href={`/manage-artist/${id}/calendar`}>My Calendar</a></li>
            <li><a href={`/manage-artist/${id}/feedback`}>My Feedback</a></li>
            <li><Link href={`/manage-artist/${id}/community?wall=${user?._id}&wn=${toPlusSeparated(user?.fullName)}`}>Community</Link></li>
            <li><a href="/manage-artist/about">About Us</a></li>
            </ul>
          )}
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
                      <AvatarFallback>{user?.fullName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                  <DropdownMenuItem asChild  className="cursor-pointer focus:bg-rose-100">
                    <Link href={`/manage-artist/${id}/wallet`}>My Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild  className="cursor-pointer focus:bg-rose-100">
                    <Link href={`/manage-artist/${id}/public-portfolio`}>My Public Portfolio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/manage-artist/${id}/certificates` as any} className="cursor-pointer focus:bg-rose-100">My Certificates</Link>
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
