"use client";

import { MapPin, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export default function FeaturedLocations() {
  const cities = [
    { 
      name: "Hanoi", 
      img: "/images/hanoi.jpg", 
      artistCount: 150,
      description: "Capital beauty experts"
    },
    { 
      name: "Ho Chi Minh", 
      img: "/images/hcm.jpg", 
      artistCount: 200,
      description: "Southern glamour specialists"
    },
    { 
      name: "Da Nang", 
      img: "/images/danang.jpg", 
      artistCount: 80,
      description: "Coastal beauty artists"
    },
    { 
      name: "Hoi An", 
      img: "/images/danang.jpg", 
      artistCount: 45,
      description: "Traditional & modern styles"
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-b from-pink-50 to-white py-20 px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-rose-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full text-pink-700 font-medium text-sm mb-6 border border-pink-200">
            <MapPin size={16} className="text-pink-500" />
            Popular Locations
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Enhance Your Natural
            <span className="block bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Beauty Everywhere
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Professional makeup artists in major cities across Vietnam, ready to make you shine on your special day
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cities.map((city, i) => (
            <Link
              key={i}
              href={`/artists/makeup-artist-list?location=${city.name}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-100/50 hover:border-pink-200 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Floating sparkle */}
                <div className="absolute top-4 right-4 text-white/80 group-hover:text-pink-300 transition-colors">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                
                {/* Artist count badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-pink-600 font-semibold text-sm flex items-center gap-1">
                  <Users size={14} />
                  {city.artistCount}+
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {city.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {city.artistCount} Makeup Artists
                  </span>
                  <div className="flex items-center gap-1 text-pink-500 group-hover:text-pink-600 transition-colors">
                    <span className="font-medium">Explore</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-300/50 transition-colors pointer-events-none"></div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/artists/makeup-artist-list"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <MapPin size={20} />
            View All Locations
            <Sparkles size={18} className="animate-pulse" />
          </Link>
        </div>
      </div>
    </section>
  );
}