"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Clock, Calendar, Award } from "lucide-react";
import { fetchArtistDetail } from "@/config/api";
import type { ArtistDetailDTO } from "@/config/types";
import Navbar from "@/components/generalUI/Navbar";
import Footer from "@/components/generalUI/Footer";

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
export default function ArtistDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<ArtistDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"intro" | "services" | "reviews" | "portfolio">("intro");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchArtistDetail(params.id);
        setData(result);
      } catch (e: any) {
        setError(e?.message || "Artist not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleBookService = (serviceId: string, serviceName: string) => {
    // TODO: Implement booking modal or navigation
    alert(`Book service: ${serviceName} (ID: ${serviceId})`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 rounded-xl" style={{ backgroundColor: '#f4e8eb' }}></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/artists/makeup-artist-list"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
            >
              <ArrowLeft size={16} />
              Back to Artists
            </Link>
          </div>
        </div>
    );
  }

  const { artist, services, portfolio } = data;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
        {/* Back Link */}
        <Link
          href="/artists/makeup-artist-list"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to List
        </Link>

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
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Service Packages</h2>
                {services.length > 0 ? (
                  <div className="grid gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {service.name || "Service Package"}
                          </h3>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              {formatPrice(service.price)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} />
                              {formatDuration(service.duration)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleBookService(service._id, service.name)}
                            className="w-full lg:w-auto px-4 py-2 text-white rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
                            style={{ backgroundColor: '#f0a8b1' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0a8b1'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0a8b1'}
                          >
                            <Calendar size={14} />
                            Book Now
                          </button>
                        </div>
                        {service.description && (
                          <p className="text-gray-700">{service.description}</p>
                        )}
                        {service.isAvailable === false && (
                          <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                            Service Unavailable
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No service packages available yet
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
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
            )}

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
              <button className="w-full px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold transition">
                BOOK NOW!
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
