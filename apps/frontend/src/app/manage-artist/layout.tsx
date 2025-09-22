'use client';

import Footer from "@/components/generalUI/Footer";
import ArtistNavbar from "@/components/manage-artist/general-components/ArtistNavbar";
import { MuaResponseDTO, UserResponseDTO } from "@/types/user.dtos";
import { Poppins } from "next/font/google";
import { useState,useEffect } from "react";


export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  useEffect(() => {
    setMua(localStorage.getItem('currentMUA') ? JSON.parse(localStorage.getItem('currentMUA') as string) : null);
  }, []);
  return (
    <main
      className="flex flex-col min-h-screen bg-white text-[#191516]"
      style={{
        fontFamily: 'Montserrat, Poppins, Arial, sans-serif',
        letterSpacing: '0.04em',
      }}
    >
      <ArtistNavbar mua={mua} setMua={setMua} />
      <div className="flex-1 px-10">{children}</div>
      <Footer />
    </main>
  );
}
