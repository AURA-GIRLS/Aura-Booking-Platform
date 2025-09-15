"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Clock, Calendar, Award, Eye, Heart } from "lucide-react";
import { fetchArtistDetail } from "@/config/api";
import type { ArtistDetailDTO } from "@/config/types";
import type { UserResponseDTO } from "@/types/user.dtos";

/* ===== Helper Components ===== */
function Stars({ value = 0, size = "sm" }: { value?: number; size?: "sm" | "lg" }) {
  const full = Math.floor(value);
  const arr = Array.from({ length: 5 }, (_, i) => i < full);
  const starSize = size === "lg" ? "text-lg" : "text-sm";
  
  return (
    <div className={`flex items-center gap-1 text-amber-400 ${starSize}`}>
      {arr.map((f, i) => (
        <span key={i}>{f ? "★" : "☆"}</span>
      ))}
      <span className="text-gray-600 ml-1 text-sm font-medium">
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
}

function formatPrice(price?: number) {
  return typeof price === "number" ? `${price.toLocaleString("vi-VN")} VND` : "Contact";
}

function formatDuration(duration?: number) {
  return typeof duration === "number" ? `${duration} min` : "Contact";
}

/* ===== Main Component ===== */
export default function ArtistDetailPage() {
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
        const result = await fetchArtistDetail(artistId);
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

  const handleBookService = (serviceId: string, serviceName: string) => {
    // TODO: Implement booking modal or navigation
    alert(`Book service: ${serviceName} (ID: ${serviceId})`);
  };

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#faf8f9' }}>
        <div className="w-[85%] mx-auto px-3 sm:px-4 lg:px-6 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-6 rounded w-24" style={{ backgroundColor: '#f4e8eb' }}></div>
            <div className="h-64 rounded-xl" style={{ backgroundColor: '#f4e8eb' }}></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl" style={{ backgroundColor: '#f4e8eb' }}></div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-48 rounded-xl" style={{ backgroundColor: '#f4e8eb' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

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

  const { artist, services, portfolio } = data;

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#faf8f9' }}>
      <div className="w-[85%] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/user/artists/makeup-artist-list"
            className="inline-flex items-center gap-2 text-gray-600 transition-colors group"
            style={{ color: '#8b5a6b' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ecbdc5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8b5a6b'}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Makeup Artists</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-6" style={{ borderColor: '#f4e8eb', borderWidth: '1px' }}>
          <div className="p-6 lg:p-8" style={{ backgroundColor: '#ecbdc5' }}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 overflow-hidden bg-white/30 backdrop-blur-sm shadow-md" style={{ borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.fullName || "Artist"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
                      {(artist.fullName || "A").charAt(0)}
                    </div>
                  )}
                </div>
                {artist.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 border-white" style={{ backgroundColor: '#f9d71c' }}>
                    <Award size={14} className="text-white" />
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-white">
                <h1 className="text-2xl lg:text-3xl font-bold mb-3">
                  {artist.fullName || "Makeup Artist"}
                </h1>
                <p className="text-base mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Professional Makeup Artist & Beauty Expert
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-base font-medium">
                      {artist.ratingAverage?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      ({artist.feedbackCount || 0} reviews)
                    </span>
                  </div>
                  <span className="text-base" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {artist.bookingCount || 0} bookings
                  </span>
                </div>

                {artist.location && (
                  <div className="flex items-center gap-2 text-base mb-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <MapPin size={16} />
                    {artist.location}
                  </div>
                )}

                {artist.experienceYears && (
                  <div className="text-base mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {artist.experienceYears}+ years of experience
                  </div>
                )}

                {/* Action Button */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => alert("Favorite feature coming soon!")}
                    className="px-6 py-2 backdrop-blur-sm text-white rounded-lg transition-all duration-300 font-medium border flex items-center gap-2 text-sm"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                  >
                    <Heart size={16} />
                    Save Artist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-sm p-6" style={{ borderColor: '#f4e8eb', borderWidth: '1px' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0a8b1' }}>
                  <Eye size={12} className="text-white" />
                </div>
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {artist.bio || "Professional makeup artist passionate about enhancing natural beauty and creating stunning looks for every occasion. With years of experience and a keen eye for detail, I specialize in creating personalized makeup experiences that make you feel confident and beautiful."}
              </p>
            </section>

            {/* Services Section */}
            <section className="bg-white rounded-xl shadow-sm p-6" style={{ borderColor: '#f4e8eb', borderWidth: '1px' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0a8b1' }}>
                  <Calendar size={12} className="text-white" />
                </div>
                Services & Packages
              </h2>
              
              {services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service._id} 
                      onClick={() => setSelectedServiceId(service._id)}
                      className={`group border rounded-xl p-4 hover:shadow-sm transition-all duration-300 cursor-pointer ${
                        selectedServiceId === service._id
                          ? 'border-pink-500 shadow-lg shadow-pink-200/50'
                          : 'border-gray-200 hover:border-pink-300'
                      }`} 
                      style={{ borderColor: selectedServiceId === service._id ? '#ec4899' : '#f4e8eb', backgroundColor: '#fdfcfc' }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Service Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:transition-colors" 
                                style={{ color: '#8b5a6b' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ecbdc5'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#8b5a6b'}>
                              {service.name || "Service Package"}
                            </h3>
                            <div className="text-right lg:hidden">
                              <div className="text-xl font-bold" style={{ color: '#f0a8b1' }}>
                                {formatPrice(service.price)}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={12} />
                                {formatDuration(service.duration)}
                              </div>
                            </div>
                          </div>
                          
                          {service.description && (
                            <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                              {service.description}
                            </p>
                          )}

                          {/* Benefits */}
                          {service.benefits && service.benefits.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-xs font-semibold text-gray-900 mb-2">What's Included:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {service.benefits.slice(0, 4).map((benefit, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-green-700">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    {benefit}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add-ons */}
                          {service.addons && service.addons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {service.addons.slice(0, 3).map((addon) => (
                                <span
                                  key={addon}
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{ backgroundColor: '#f0e6f7', color: '#6b46c1' }}
                                >
                                  {addon.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          )}

                          {selectedServiceId === service._id && (
                            <div className="mt-3">
                              <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full font-medium">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Pricing & Booking */}
                        <div className="lg:ml-4 flex lg:flex-col items-center lg:items-end gap-3">
                          <div className="text-right hidden lg:block">
                            <div className="text-xl font-bold mb-1" style={{ color: '#d23f51' }}>
                              {formatPrice(service.price)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              {formatDuration(service.duration)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookService(service._id, service.name);
                            }}
                            className="w-full lg:w-auto px-4 py-2 text-white rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                            style={{ backgroundColor: '#d23f51' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a8b1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d23f51'}
                          >
                            <Calendar size={14} />
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-3">📅</div>
                  <p className="text-base">No services available yet</p>
                </div>
              )}
            </section>

            {/* Portfolio Section */}
            {portfolio.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6" style={{ borderColor: '#f4e8eb', borderWidth: '1px' }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0a8b1' }}>
                    <Eye size={12} className="text-white" />
                  </div>
                  Portfolio
                </h2>
                
                <div className="space-y-6">
                  {portfolio.map((item) => (
                    <div key={item.id} className="border rounded-xl p-4 hover:transition-colors" style={{ borderColor: '#f4e8eb' }}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.title || "Portfolio Item"}
                      </h3>
                      
                      {item.description && (
                        <p className="text-gray-700 mb-3 leading-relaxed text-sm">
                          {item.description}
                        </p>
                      )}
                      
                      {item.media && item.media.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.media.map((media, index) => (
                            <div key={index} className="aspect-square rounded-xl overflow-hidden group cursor-pointer" style={{ backgroundColor: '#faf8f9' }}>
                              {media.mediaType === "VIDEO" ? (
                                <video
                                  src={media.url}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  controls
                                />
                              ) : (
                                <img
                                  src={media.url}
                                  alt={media.caption || `Portfolio ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ borderColor: '#f4e8eb', borderWidth: '1px' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Artist Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Experience</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {artist.experienceYears || 0}+ years
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Bookings</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {artist.bookingCount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Rating</span>
                  <div className="flex items-center gap-2">
                    <Stars value={artist.ratingAverage} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Reviews</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {artist.feedbackCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Book Your Session */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Book Your Session Today</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Whether you're preparing for a wedding, special event, or personal photoshoot,{" "}
                <span className="font-semibold">{artist.fullName || "this artist"}</span> will help you look and feel your absolute best.
              </p>
              <p className="text-gray-600 mb-6 text-sm">
                Limited slots available - book your desired date now!
              </p>
              <button 
                onClick={() => {
                  if (selectedServiceId) {
                    router.push(`/user/booking/${params.id}/${selectedServiceId}` as any);
                  } else {
                    alert('Please select a service package first!');
                  }
                }}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition ${
                  selectedServiceId 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedServiceId}
              >
                {selectedServiceId ? 'BOOK NOW!' : 'SELECT A SERVICE FIRST'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
