'use client';

import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/generalUI/Footer";
import Navbar from "@/components/generalUI/Navbar";
import ArtistNavbar from "@/components/manage-artist/general-components/ArtistNavbar";
import { UserResponseDTO } from "@/types/user.dtos";
import { Poppins } from "next/font/google";
import { useState, useEffect } from "react";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseDTO | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Listen for localStorage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user from storage event:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    // Listen for custom userUpdated event (from same tab)
    const handleUserUpdated = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing updated user:', error);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  return (
    <AuthGuard requiredRole="ADMIN">
      <main className="flex flex-col min-h-screen bg-white ">
        <Navbar user={user} setUser={setUser} />
        <div className="flex-1 ">{children}</div>
        <Footer />
      </main>
    </AuthGuard>

  );
}
