import React from "react";
import { MapPin, Star } from "lucide-react";
import { formatVND } from "../../config/api";
import { SERVICE_ADDON_LABELS } from "../../constants/constants";
import type { Artist } from "../../config/types";

interface ArtistCardProps {
  artist: Artist;
  onViewProfile: (artistId: string, tab?: string) => void;
  onBookService: (artistId: string, serviceId: string) => void;
}

export default function ArtistCard({ artist, onViewProfile, onBookService }: ArtistCardProps) {
  const {
    _id,
    fullName,
    avatarUrl,
    location,
    bio,
    ratingAverage,
    feedbackCount,
    bookingCount,
    isVerified,
    services = [],
    totalServices = 0
  } = artist;

  // Display up to 3 services as preview
  const servicePreview = services.slice(0, 3);
  

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-rose-200/30  hover:border-gray-200 transition-all   group">
      {/* Artist Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 ring-2 ring-rose-200/50 group-hover:ring-rose-300 ">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-300 to-pink-300 flex items-center justify-center group-hover:from-rose-400 group-hover:to-pink-400 ">
                  <span className="text-white font-semibold text-lg">
                    {fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Artist Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {fullName}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Professional Makeup Artist & Beauty Expert
                </p>
                <span className="inline-flex items-center  py-1 rounded-full text-xs font-medium hover:from-rose-200 hover:to-pink-200  gap-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">
                      {ratingAverage.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({feedbackCount} reviews)</span>
                  </div>
                    <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-sm font-semibold">
                      Verified
                    </span>
                </span>
              </div>
              {/* Heart Icon */}
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* Bio */}
            {bio && (
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
                {bio}
              </p>
            )}

            {/* View Portfolio Button */}
            <div className="mt-2">
              <button
                onClick={() => onViewProfile(_id, 'portfolio')}
                className="px-3 py-2 bg-white border border-rose-300 text-rose-600 text-xs font-medium rounded-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
              >
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Service Preview Section */}
      {servicePreview.length > 0 && (
        <div className="border-t border-gray-100 p-6 pt-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors duration-300">
            Featured services ({totalServices} packages)
          </h4>
          
          <div className="space-y-3">
            {servicePreview.map((service) => (
              <div key={service._id} className="border border-gray-200 rounded-xl p-4 hover:border-rose-200 hover:bg-rose-50/30 transition-all">
                <div className="flex gap-4">
                  {/* Service Image */}
                  {service.images && service.images.length > 0 && (
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={service.images[0]}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Service Content */}
                  <div className="flex-1 min-w-0">
                    {/* Service Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-900 line-clamp-1 text-sm">
                        {service.name}
                      </h5>
                    </div>

                    <div className="flex justify-between gap-6">
                      {/* Left side - Benefits and Add-ons */}
                      <div className="flex-1">
                        {/* Benefits */}
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="mb-3">
                            <div className="space-y-1">
                              {service.benefits.slice(0, 3).map((benefit, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-green-700 flex items-center"
                                >
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                  {benefit}
                                </div>
                              ))}
                              {service.benefits.length > 3 && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                  +{service.benefits.length - 3} lợi ích khác
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Add-ons */}
                        {service.addons && service.addons.length > 0 && (
                          <div className="mb-0">
                            <div className="flex flex-wrap gap-1">
                              {service.addons.slice(0, 3).map((addon) => (
                                <span
                                  key={addon}
                                  className="text-xs px-2 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full hover:from-rose-200 hover:to-pink-200 hover:scale-105 transition-all duration-300 cursor-pointer"
                                >
                                  {SERVICE_ADDON_LABELS[addon] || addon}
                                </span>
                              ))}
                              {service.addons.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 rounded-full hover:from-rose-100 hover:to-pink-100 hover:scale-105 transition-all duration-300 cursor-pointer">
                                  +{service.addons.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side - Price and Button */}
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3 group-hover:from-rose-700 group-hover:to-pink-700 transition-all duration-300">
                          {formatVND(service.price)}
                        </div>
                        <button type="button"
                          onClick={() => onBookService(_id, service._id)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:scale-105 hover:shadow-lg hover:shadow-rose-300/50 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-300 text-sm font-medium whitespace-nowrap transform active:scale-95 group-hover:animate-pulse"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
