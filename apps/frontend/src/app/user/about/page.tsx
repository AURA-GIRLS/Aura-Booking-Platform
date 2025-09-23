'use client';

import Image from 'next/image';
import { Heart, Star, Users, Award, Sparkles, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-200/40 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-pink-300/30 rounded-full blur-xl animate-bounce"></div>
        </div>

        <div className="relative bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-rose-600 font-medium mb-6 animate-fade-in">
              <Sparkles size={16} className="text-rose-500" />
              <span>About AURA</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent mb-6 animate-slide-up">
              ABOUT US
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Connecting beauty professionals with clients through seamless, modern experiences
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Brand Story Section */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-2 rounded-full text-rose-700 font-medium">
                <Heart size={16} className="text-rose-500" />
                <span>Our Story</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                AURA<span className="text-rose-500">.</span>
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  AURA was born out of an idea to connect clients and makeup artists through a seamless, modern experience—
                  online and in-person. Since our start, we've focused on bridging craft and technology to offer sophisticated,
                  comfortable booking experiences for a modern, on‑the‑go lifestyle.
                </p>
                <p className="text-lg">
                  From casual events to milestone moments, AURA helps you find the right artist, discover looks, and book with
                  confidence. We believe beauty is personal, and every client deserves an experience as unique as they are.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">500+</div>
                  <div className="text-sm text-gray-600">Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">10K+</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-200/50 to-pink-200/50 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-rose-100">
                <Image
                  src="/images/brand.jpg"
                  alt="AURA Beauty Experience"
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-rose-50/50 to-pink-50/50 rounded-3xl mb-16">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-rose-600 font-medium mb-6">
                <Award size={16} className="text-rose-500" />
                <span>Our Values</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                What We Stand For
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our core values guide everything we do, from connecting artists to creating experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="text-rose-500" size={32} />,
                  title: "Community First",
                  description: "Building connections between talented artists and clients who appreciate quality beauty services."
                },
                {
                  icon: <Star className="text-rose-500" size={32} />,
                  title: "Excellence",
                  description: "We maintain the highest standards in service quality, ensuring every experience exceeds expectations."
                },
                {
                  icon: <Heart className="text-rose-500" size={32} />,
                  title: "Personal Touch",
                  description: "Every client is unique, and we believe in creating personalized experiences that celebrate individuality."
                }
              ].map((value, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="bg-gradient-to-r from-rose-100 to-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    {value.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative animate-slide-up order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200/50 to-rose-200/50 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-100">
                <Image
                  src="/images/smile2.jpg"
                  alt="Our Journey"
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-6 animate-slide-up order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-2 rounded-full text-pink-700 font-medium">
                <MapPin size={16} className="text-pink-500" />
                <span>Our Journey</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                HISTORY OF THE BRAND
              </h3>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  AURA launched with a desire to challenge convention in beauty services and modernize how people discover and
                  book professionals. We started with a simple idea: make artistry more accessible while respecting the
                  craft—and the people behind it.
                </p>
                <p className="text-lg">
                  Today, AURA connects clients and artists across cities with a growing community and curated experiences—
                  from weddings and editorial shoots to everyday confidence. We've built more than a platform; we've created
                  a movement that celebrates beauty in all its forms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Promise Section */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-2 rounded-full text-rose-700 font-medium mb-8">
              <Sparkles size={16} className="text-rose-500" />
              <span>Our Promise</span>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              OUR PROMISE TO YOU
            </h3>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              We aim to leave a mark through the experiences we craft. By being bold and focusing on quality, we push limits
              and redefine how beauty services are discovered, booked, and delivered. AURA is the bridge—connecting cultures,
              ideas, artists, and communities.
            </p>

            {/* CTA */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Ready to Experience AURA?</h4>
              <p className="text-rose-100 mb-6">Join thousands of satisfied clients who trust AURA for their beauty needs</p>
              <button 
                onClick={() => window.location.href = '/user/artists/makeup-artist-list'}
                className="bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Find Your Artist
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
