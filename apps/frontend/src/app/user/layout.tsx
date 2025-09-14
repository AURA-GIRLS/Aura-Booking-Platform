'use client';

import Footer from "@/components/generalUI/Footer";
import Navbar from "@/components/generalUI/Navbar";
import ArtistNavbar from "@/components/manage-artist/general-components/ArtistNavbar";
import { UserResponseDTO } from "@/types/user.dtos";
import { Poppins } from "next/font/google";
import { useState,useEffect } from "react";


export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  useEffect(() => {
    setUser(localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') as string) : null);
  }, []);
  return (
    <main
      className="flex flex-col min-h-screen bg-white text-[#191516]"
      style={{
        fontFamily: 'Montserrat, Poppins, Arial, sans-serif',
        letterSpacing: '0.04em',
      }}
    >
      <Navbar user={user} setUser={setUser} />
      <div className="flex-1 px-20 py-8">{children}</div>
      <Footer />
    </main>
  );
}
