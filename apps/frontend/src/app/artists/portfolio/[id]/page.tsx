"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MapPin, Clock, Calendar, Award } from "lucide-react";
import { fetchArtistDetail } from "@/config/api";
import type { ArtistDetailDTO } from "@/config/types";
import Navbar from "@/components/generalUI/Navbar";
import Footer from "@/components/generalUI/Footer";

/* ===== Helper Components ===== */
function Stars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const arr = Array.from({ length: 5 }, (_, i) => i < full);
  return (
    <div className="flex items-center gap-1 text-amber-500 text-sm">
      {arr.map((f, i) => (
        <span key={i}>{f ? "★" : "☆"}</span>
      ))}
      <span className="text-gray-600 ml-1">{Number(value).toFixed(1)}</span>
    </div>
  );
}

function formatPrice(price?: number) {
  return typeof price === "number" ? `${price.toLocaleString("en-US")} VND` : "Contact";
}

function formatDuration(duration?: number) {
  return typeof duration === "number" ? `${duration} minutes` : "Not specified";
}

function formatDate(date?: Date) {
  if (!date) return "Not specified";
  return new Date(date).toLocaleDateString("en-US");
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
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
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
              <ArrowLeft size={20} />
              Back to List
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const { artist, services, portfolio, certificates } = data;
  const firstPortfolioImage = portfolio[0]?.media?.[0]?.url;

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
        <section className="relative rounded-2xl overflow-hidden mb-8">
          {/* Banner Image */}
          <div className="h-96 bg-gradient-to-r from-rose-100 to-pink-100 relative">
            {firstPortfolioImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstPortfolioImage}
                alt="Portfolio banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Artist Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {artist.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artist.avatarUrl}
                    alt={artist.fullName || "Artist"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    👤
                  </div>
                )}
              </div>

              {/* Artist Details */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {artist.fullName || "Makeup Artist"}
                </h1>
                <div className="flex items-center gap-4 mb-2">
                  <Stars value={artist.ratingAverage} />
                  <span className="text-sm">({artist.bookingCount || 0} bookings)</span>
                  {artist.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      <Award size={12} />
                      Verified
                    </span>
                  )}
                </div>
                {artist.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    {artist.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {[
              { key: "intro", label: "Introduction" },
              { key: "services", label: "Service Packages" },
              { key: "reviews", label: "Customer Reviews" },
              { key: "portfolio", label: "Portfolio" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "intro" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-4">Introduction</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {artist.bio || "Artist introduction information will be updated soon."}
                  </p>
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
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock size={14} />
                              {formatDuration(service.duration)}
                            </div>
                          </div>
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
                  Review feature will be available soon
                </div>
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
                {portfolio.length > 0 ? (
                  <div className="space-y-8">
                    {portfolio.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.title || "Portfolio Item"}
                          </h3>
                          {item.description && (
                            <p className="text-gray-700 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {item.category && (
                              <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full">
                                {item.category}
                              </span>
                            )}
                            {item.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(item.createdAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {item.media && item.media.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {item.media.map((media, index) => (
                              <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                {media.mediaType === "VIDEO" ? (
                                  <video
                                    src={media.url}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={media.url}
                                    alt={media.caption || `Portfolio ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No portfolio items available yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificates */}
            {certificates.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Certificates</h3>
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex gap-3">
                      {cert.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cert.imageUrl}
                            alt={cert.title || "Certificate"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.title || "Certificate"}
                        </h4>
                        {cert.issuer && (
                          <p className="text-xs text-gray-600">{cert.issuer}</p>
                        )}
                        {cert.issueDate && (
                          <p className="text-xs text-gray-500">
                            Issued: {formatDate(cert.issueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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

      <Footer />
    </main>
  );
}
