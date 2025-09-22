"use client";

import { useState, useEffect } from "react";
import ArtistsList from "@/components/mua-list/ArtistsList";
import type { UserResponseDTO } from "@/types/user.dtos";
// import ArtistsListPreview from "@/components/makeup-artist/ArtistsListPreview";

export default function Page() {
  const [user, setUser] = useState<UserResponseDTO | null>(null);

  // Initialize user from localStorage
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    setUser(currentUser ? JSON.parse(currentUser) : null);
  }, []);

  return (
    <div className="bg-gradient-to-b from-pink-50 to-pink-100 ">
      <ArtistsList/>
    </div>
  );
}