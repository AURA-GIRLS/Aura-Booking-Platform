'use client';

import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/generalUI/Footer";
import ArtistNavbar from "@/components/manage-artist/general-components/ArtistNavbar";
import { MuaResponseDTO } from "@/types/user.dtos";
import { useState, useEffect } from "react";

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  
  useEffect(() => {
    // Load MUA from localStorage on mount
    const storedMua = localStorage.getItem('currentMUA');
    if (storedMua) {
      try {
        const parsedMua = JSON.parse(storedMua);
        setMua(parsedMua);
      } catch (error) {
        console.error('Error parsing stored MUA:', error);
      }
    }

    // Listen for localStorage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentMUA') {
        if (e.newValue) {
          try {
            const parsedMua = JSON.parse(e.newValue);
            setMua(parsedMua);
          } catch (error) {
            console.error('Error parsing MUA from storage event:', error);
          }
        } else {
          setMua(null);
        }
      }
    };

    // Listen for custom muaUpdated event (from same tab)
    const handleMuaUpdated = () => {
      const storedMua = localStorage.getItem('currentMUA');
      if (storedMua) {
        try {
          const parsedMua = JSON.parse(storedMua);
          setMua(parsedMua);
        } catch (error) {
          console.error('Error parsing updated MUA:', error);
        }
      } else {
        setMua(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('muaUpdated', handleMuaUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('muaUpdated', handleMuaUpdated);
    };
  }, []);
  
  return (
    <AuthGuard requiredRole="ARTIST">
      <main className="flex flex-col min-h-screen bg-white">
        <ArtistNavbar mua={mua} setMua={setMua} />
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </AuthGuard>
  );
}
