"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + Site name */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-red-500 text-white text-[10px] flex items-center justify-center rounded">Logo</div>
          <span className="font-semibold">AURA.com</span>
        </div>

        {/* Center: Menu */}
        <ul className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/artists">Makeup Artist</Link></li>
          <li><Link href="/booking">Booking</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/about">About Us</Link></li>
        </ul>

        {/* Right: Icons */}
        <div className="hidden md:flex items-center gap-3 text-gray-700">
          <button aria-label="Cart" className="p-2 hover:bg-gray-100 rounded">🛒</button>
          <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded">🔔</button>
          <button aria-label="Account" className="h-8 w-8 rounded-full bg-gray-200" />
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-700">☰</button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4">
          <ul className="flex flex-col gap-2 text-gray-700 font-medium">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/artists">Makeup Artist</Link></li>
            <li><Link href="/booking">Booking</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
          <div className="mt-3 flex items-center gap-3">
            <button aria-label="Cart" className="p-2 hover:bg-gray-100 rounded">🛒</button>
            <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded">🔔</button>
            <button aria-label="Account" className="h-8 w-8 rounded-full bg-gray-200" />
          </div>
        </div>
      )}
    </nav>
  );
}
