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

export default function HomePage() {
    const [user, setUser] = useState<UserResponseDTO | null>(null);
  useEffect(() => {
    setUser(localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') as string) : null);
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {user?.role === "ARTIST" ? <ArtistNavbar user={user} setUser={setUser} /> : <Navbar user={user} setUser={setUser} />}
      <Hero />
      <FeaturedLocations />
      <FeaturedArtists />
      <CallToAction />
      <Footer />
    </main>
  );
}
