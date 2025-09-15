"use client";

import Link from "next/link";
import { Calendar, Sparkles, Heart, Star, ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="relative w-full bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 py-20 px-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/8 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-20 right-1/4 w-20 h-20 bg-white/12 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-1/4 text-white/30 animate-pulse">
          <Sparkles size={24} />
        </div>
        <div className="absolute top-32 right-1/3 text-white/20 animate-bounce">
          <Heart size={20} />
        </div>
        <div className="absolute bottom-24 left-1/3 text-white/25 animate-pulse">
          <Star size={22} />
        </div>
        <div className="absolute bottom-40 right-1/4 text-white/30 animate-bounce">
          <Sparkles size={18} />
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm mb-8 border border-white/30">
          <Calendar size={16} />
          Ready to Transform?
        </div>

        {/* Main heading */}
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Not Sure Which
          <span className="block">Artist to Choose?</span>
        </h2>
        
        {/* Subheading */}
        <p className="text-xl lg:text-2xl text-white/90 mb-4 font-medium">
          Let AURA help you shine on your special day! ✨
        </p>
        
        {/* Description */}
        <p className="text-lg text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Our expert team will match you with the perfect makeup artist who understands your style and vision. 
          Book your consultation today and discover your most beautiful self.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Link
            href="/user/artists/makeup-artist-list"
            className="group px-10 py-5 bg-white text-pink-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-3 hover:bg-pink-50"
          >
            <Calendar size={24} />
            Book Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Star size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Premium Quality</h3>
            <p className="text-white/80 text-sm">Only verified professional artists</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Heart size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Personalized Service</h3>
            <p className="text-white/80 text-sm">Tailored to your unique style</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Satisfaction Guaranteed</h3>
            <p className="text-white/80 text-sm">Your beauty, our commitment</p>
          </div>
        </div>
      </div>
    </section>
  );
}
