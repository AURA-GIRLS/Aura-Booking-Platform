"use client";

import { useState } from "react";
import { Star, Heart, Award, Sparkles, Calendar } from "lucide-react";
import Link from "next/link";

export default function FeaturedArtists() {
  const [artists] = useState([
    { 
      id: "1",
      name: "Sarah Johnson", 
      rating: 4.8, 
      reviews: 256, 
      img: "/images/mua_1.jpg",
      specialties: ["Bridal", "Glam"],
      experience: "5+ years",
      location: "Hanoi"
    },
    { 
      id: "2",
      name: "Emily Chen", 
      rating: 4.7, 
      reviews: 198, 
      img: "/images/mua_2.jpg",
      specialties: ["Party", "Editorial"],
      experience: "3+ years",
      location: "Ho Chi Minh"
    },
    { 
      id: "3",
      name: "Jessica Lee", 
      rating: 4.9, 
      reviews: 320, 
      img: "/images/mua_1.jpg",
      specialties: ["Natural", "Corporate"],
      experience: "7+ years",
      location: "Da Nang"
    },
    { 
      id: "4",
      name: "Amanda Rose", 
      rating: 4.6, 
      reviews: 145, 
      img: "/images/mua_1.jpg",
      specialties: ["Vintage", "Creative"],
      experience: "4+ years",
      location: "Hoi An"
    },
  ]);

  const handleBooking = (artist: any) => {
    // TODO: redirect to artist portfolio page
    window.location.href = `/artists/portfolio/${artist.id}`;
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-white to-pink-50 py-20 px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-24 h-24 bg-rose-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-pink-200/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-pink-300/10 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full text-pink-700 font-medium text-sm mb-6 border border-pink-200">
            <Award size={16} className="text-pink-500" />
            Featured Artists
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet Our Top
            <span className="block bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Beauty Experts
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover talented makeup artists who have mastered the art of enhancing natural beauty with their exceptional skills
          </p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {artists.map((artist, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-100/50 hover:border-pink-200 transform hover:-translate-y-3 cursor-pointer"
              onClick={() => handleBooking(artist)}
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={artist.img}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Heart icon */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors group-hover:scale-110">
                  <Heart size={18} />
                </div>
                
                {/* Rating badge */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900 text-sm">{artist.rating}</span>
                </div>

                {/* Experience badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-semibold">
                  {artist.experience}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{artist.location}</p>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {artist.specialties.slice(0, 2).map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Reviews */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={14} 
                        className={`${idx < Math.floor(artist.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({artist.reviews} reviews)</span>
                </div>

                {/* Book Button */}
                <button 
                  className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg transform group-hover:scale-105 flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(artist);
                  }}
                >
                  <Calendar size={18} />
                  Book Now
                </button>
              </div>

              {/* Sparkle decoration */}
              <div className="absolute top-6 right-16 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Sparkles size={16} className="animate-pulse" />
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-pink-300/50 transition-colors pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            href="/artists/makeup-artist-list"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Award size={20} />
            View All Artists
            <Sparkles size={18} className="animate-pulse" />
          </Link>
        </div>
      </div>
    </section>
  );
}
