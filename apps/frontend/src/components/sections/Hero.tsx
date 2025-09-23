"use client";

import { Sparkles, Heart, Star } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full px-6 py-16 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-pink-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-rose-200/40 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-rose-300/30 rounded-full blur-md animate-bounce"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full text-pink-700 font-medium text-sm mb-6 border border-pink-200">
              <Sparkles size={16} className="text-pink-500" />
              Professional Beauty Services
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent leading-tight">
              AURA
            </h1>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-4">
              Booking Makeup Online
            </h2>
            
            <p className="text-xl lg:text-2xl text-pink-600 font-medium mb-8 italic">
              Face it, You are Art! ✨
            </p>
            
            <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Connect with professional makeup artists for weddings, parties, photoshoots, and special occasions. Book your perfect look today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mb-8">
              <Link
                href="/user/artists/makeup-artist-list"
                className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                Find Your Artist
              </Link>
            
            </div>
          </div>

          {/* Right Visual Content */}
          <div className="relative">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100/50 overflow-hidden p-8">
              {/* Sparkle decorations */}
              <div className="absolute top-4 left-4 text-pink-300 animate-pulse">
                <Sparkles size={20} />
              </div>
              <div className="absolute top-6 right-6 text-rose-300 animate-bounce">
                <Heart size={18} />
              </div>
              <div className="absolute bottom-4 left-6 text-pink-400 animate-pulse">
                <Star size={16} />
              </div>

              {/* Main makeup showcase */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Bridal Makeup */}
                <div className="relative group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl overflow-hidden border-2 border-pink-200/50 group-hover:border-pink-300 transition-colors">
                    <img 
                      src="/images/bg-1.png" 
                      alt="Bridal Makeup" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Bridal</span>
                  </div>
                </div>

                {/* Party Makeup */}
                <div className="relative group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl overflow-hidden border-2 border-rose-200/50 group-hover:border-rose-300 transition-colors">
                    <img 
                      src="/images/bg-4.jpg" 
                      alt="Party Makeup" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Party</span>
                  </div>
                </div>
              </div>

              {/* Makeup tools showcase */}
              <div className="relative group cursor-pointer">
                <div className="aspect-[3/1] bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl overflow-hidden border-2 border-pink-200/50 group-hover:border-pink-300 transition-colors">
                  <img 
                    src="/images/hero.jpg" 
                    alt="Professional Makeup Tools" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-end justify-center pb-4">
                  <span className="text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">Professional Tools</span>
                </div>
              </div>

              {/* Service types badges */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Wedding</span>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">Party</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Photoshoot</span>
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">Special Events</span>
              </div>
            </div>

            {/* Floating elements around the showcase */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-300 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
              💄
            </div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-rose-300 rounded-full flex items-center justify-center text-white text-sm animate-pulse">
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
