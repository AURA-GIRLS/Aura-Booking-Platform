import React from "react";
import { MapPin, Star } from "lucide-react";
import { SERVICE_ADDON_LABELS } from "../../constants/constants";
import { Artist } from "@/types/artist.dto";
import { ArtistService } from "@/services/artist";
import { Button } from "../lib/ui/button";

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
                  {bio || "Professional Makeup Artist & Beauty Expert"}
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
              <Button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Button>
            </div>
            

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {servicePreview.map((service) => (
              <div key={service._id} className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                <div className="flex gap-3 items-start">
                  {/* Service Image */}
                  <div className="flex-shrink-0">
                    {(service.images && service.images.length > 0) ? (
                      <img 
                        src={service.images[0]} 
                        alt={service.name}
                        className="w-16 h-16 rounded-lg object-cover border border-rose-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkVGMkY0Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iI0Y0M0Y1RSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHA+dGggZD0iTTI4IDI4TDM2IDM2TDI4IDI4WiIgc3Ryb2tlPSIjRjQzRjVFIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200 flex items-center justify-center">
                        <span className="text-rose-400 text-xl">💄</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">Professional makeup service</p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="text-sm text-rose-600 font-medium">
                              {ArtistService.formatVND(service.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              60 mins
                            </p>
                          </div>
                          <button
                            onClick={() => onBookService(_id, service._id)}
                            className="px-3 py-1 bg-rose-500 text-white text-xs rounded-md hover:bg-rose-600 transition-colors flex-shrink-0"
                          >
                            Book
                          </button>
                        </div>
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
