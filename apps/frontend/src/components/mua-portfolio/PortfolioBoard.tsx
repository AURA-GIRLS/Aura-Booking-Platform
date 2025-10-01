'use client'
import { Star, MapPin, Calendar, MessageCircle, User, Check, Camera, Heart, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lib/ui/card"
import { Button } from "../lib/ui/button"
import { Badge } from "../lib/ui/badge"
import TestimonialsSection from "./TestimonialsSection"
import PortfolioSection from "./PortfolioSection"
import ServicesSection from "./ServicesSection"
import HeroSection from "./HeroSection"
import { useEffect, useState } from "react"
import { UserResponseDTO } from "@/types/user.dtos"
import { ArtistService } from "@/services/artist"
import { useParams, useRouter } from "next/navigation"
import { ArtistDetailDTO } from "@/types/artist.dto"
import Navigation from "./Navigation"
import Link from "next/link"
import LoadingPortfolio from "./LoadingPortfolio"

export default function MakeupArtistPortfolio() {
 const params = useParams();
  const artistId = params.id as string;
  
  const router = useRouter();
  const [data, setData] = useState<ArtistDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"intro" | "services" | "reviews" | "portfolio">("intro");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Add user state management
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await ArtistService.fetchArtistDetail(artistId);
        console.log("Fetched artist detail:", result);
        setData(result);
      } catch (e: any) {
        setError(e?.message || "Artist not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [artistId]);

  // Initialize user from localStorage
  useEffect(() => {
    setUser(localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser') as string) : null);
  }, []);

  const handleBookService = (serviceId?: string) => {
    // Navigate to booking page with artist and service parameters
    if(!serviceId) serviceId = data?.services?.[0]?._id || "";
    if(!artistId || !serviceId) {
      alert("Missing artist or service information");
      return;
    }
    router.push(`/user/booking/${artistId}/${serviceId}`);
  };
    if (loading)  return <LoadingPortfolio/>;
  
    if (error || !data) {
      return (
        <main className="min-h-screen" style={{ backgroundColor: '#faf8f9' }}>
          <div className="w-[85%] mx-auto px-3 sm:px-4 lg:px-6 py-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">💄</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Artist Not Found</h1>
              <p className="text-gray-600 mb-6 text-base">{error}</p>
              <Link
                href="/user/artists/makeup-artist-list"
                className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                style={{ backgroundColor: '#ecbdc5' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a8b1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ecbdc5'}
              >
                <ArrowLeft size={16} />
                Back to Artists
              </Link>
            </div>
          </div>
        </main>
      );
    }

  return (
    <div className="min-h-screen bg-white">
    {/* Hero Section */}
    {data?.artist && <HeroSection  muaDetail={data.artist} handleBook={handleBookService} />}
      {/* Navigation */}
      <Navigation handleBook={handleBookService}/>
      {/* Services & Packages */}
     <ServicesSection services={data?.services ?? []} handleBook={handleBookService}/>
      {/* Portfolio */}
   <PortfolioSection/>

      {/* Testimonials */}
     <TestimonialsSection muaId={artistId}/>

    </div>
  )
}
