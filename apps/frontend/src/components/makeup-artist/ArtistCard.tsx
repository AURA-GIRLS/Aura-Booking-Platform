import React from "react";
import { MapPin, Star, Eye } from "lucide-react";
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

  // Display up to 2 services as preview
  const servicePreview = services.slice(0, 2);

  return (
    <article className="group w-full rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Compact Artist Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-pink-100 ring-2 ring-white shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-300 flex items-center justify-center text-white font-semibold text-lg">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
          </div>
          
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl leading-tight mb-1">
                  {fullName}
                </h3>
                <p className="text-pink-600 text-sm font-medium mb-2">
                  Professional Makeup Artist & Beauty Expert
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-pink-500" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900">
                        {ratingAverage.toFixed(1)}
                      </span>
                    </div>
                    <span>({feedbackCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            {bio && (
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
                {bio}
              </p>
            )}

            {/* Action Button - Below Info, Left Aligned */}
            <div>
              <button
                onClick={() => onViewProfile(_id, 'portfolio')}
                className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white text-sm font-medium rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-sm"
              >
                <Eye size={14} className="inline mr-2" />
                    View Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Service Preview Section */}
      {servicePreview.length > 0 && (
        <div className="border-t border-gray-100 p-6 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Dịch vụ nổi bật ({totalServices} gói)
          </h4>
          
          <div className="space-y-3">
            {servicePreview.map((service) => (
              <div key={service._id} className="border border-gray-200 rounded-xl p-4 hover:border-pink-200 hover:bg-pink-50/30 transition-all">
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
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                                >
                                  {SERVICE_ADDON_LABELS[addon] || addon}
                                </span>
                              ))}
                              {service.addons.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                  +{service.addons.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side - Price and Button */}
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-pink-600 mb-3">
                          {formatVND(service.price)}
                        </div>
                        <button
                          onClick={() => onBookService(_id, service._id)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all text-sm font-medium whitespace-nowrap"
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
