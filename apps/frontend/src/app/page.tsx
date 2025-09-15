'use client';
import Navbar from "../components/generalUI/Navbar";
import Hero from "../components/sections/Hero";
import FeaturedLocations from "../components/sections/FeaturedLocations";
import FeaturedArtists from "../components/sections/FeaturedArtists";
import CallToAction from "../components/sections/CallToAction";
import Footer from "../components/generalUI/Footer";
import { useEffect, useState } from "react";
import ArtistNavbar from "@/components/manage-artist/general-components/ArtistNavbar";
import { UserResponseDTO } from "../types";
import { MuaResponseDTO } from "../types/user.dtos";

export default function HomePage() {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  
  useEffect(() => {
    // Initial load from localStorage
    const loadUserData = () => {
      const storedUser = localStorage.getItem('currentUser');
      const storedMua = localStorage.getItem('currentMUA');
      
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setMua(storedMua ? JSON.parse(storedMua) : null);
    };
    
    loadUserData();
    
    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser' || e.key === 'currentMUA') {
        loadUserData();
      }
    };
    
    // Listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      loadUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {user?.role === "ARTIST" ? (
        <ArtistNavbar mua={mua} setMua={setMua} />
      ) : (
        <Navbar user={user} setUser={setUser} />
      )}
      <Hero />
      <FeaturedLocations />
      <FeaturedArtists />
      <CallToAction />
      <Footer />
    </main>
  );
}
