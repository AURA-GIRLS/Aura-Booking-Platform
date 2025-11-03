"use client";

import React from "react";
import Pagination from "../ui/Pagination";
import Link from "next/link";
import { SERVICE_CATEGORY_LABELS, ServiceCategory } from "../../constants/constants";
import type { IAvailableMuaServices } from "@/types/booking.dtos";
import ArtistCard from "./ArtistCard";
import { MapPin, Star } from "lucide-react";
import { Artist, SortKey } from "@/types/artist.dto";
import { Button } from "../lib/ui/button";
import { useAuthCheck } from "../../utils/auth";
import { useTranslate } from "@/i18n/hooks/useTranslate";

export interface ResultsPanelProps {
  occasion: ServiceCategory;
  onOccasionChange: (v: ServiceCategory) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  artists: Artist[];
  availableMuas: IAvailableMuaServices[];
  isDateFiltered: boolean;
  selectedDate: string;
  loading: boolean;
  total: number;
  error: string | null;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onViewProfile: (artistId: string, tab?: string) => void;
  onBookService: (artistId: string, serviceId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function ResultsPanel({
  occasion,
  onOccasionChange,
  sort,
  onSortChange,
  artists,
  availableMuas,
  isDateFiltered,
  selectedDate,
  loading,
  total,
  error,
  canLoadMore,
  onLoadMore,
  onViewProfile,
  onBookService,
  currentPage,
  totalPages,
  onPageChange,
}: ResultsPanelProps) {
  const { t } = useTranslate('artists');
  const { checkAuthAndExecute } = useAuthCheck();
  const occasionTabs = Object.entries(SERVICE_CATEGORY_LABELS);

  const handleBookService = (artistId: string, serviceId: string) => {
    checkAuthAndExecute(() => {
      onBookService(artistId, serviceId);
    });
  };
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "rating_desc", label: t('makeupArtistList.results.sortOptions.featured') },
    { value: "price_asc", label: t('makeupArtistList.results.sortOptions.priceLowToHigh') },
    { value: "price_desc", label: t('makeupArtistList.results.sortOptions.priceHighToLow') },
    { value: "newest", label: t('makeupArtistList.results.sortOptions.newest') },
    { value: "popular", label: t('makeupArtistList.results.sortOptions.popular') },
  ];

  const handleViewProfile = (artistId: string) => {
    // Navigate to artist portfolio page
    window.location.href = `/user/artists/portfolio/${artistId}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Tabs and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-slide-up">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {occasionTabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onOccasionChange(key as ServiceCategory)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg transform active:scale-95 ${
                occasion === key
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg "
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:border-rose-300 hover:text-rose-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('makeupArtistList.results.sortBy')}</span>
          <select
          title={t('makeupArtistList.results.sortBy')}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 hover:border-rose-400 hover:shadow-md transition-all duration-300"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold bg-clip-text text-gray-900 mb-1 animate-fade-in">
          {isDateFiltered 
            ? t('makeupArtistList.results.availableOnDate').replace('{date}', selectedDate).replace('{count}', total.toLocaleString("en-US"))
            : t('makeupArtistList.results.allAreas').replace('{count}', total.toLocaleString("en-US"))
          }
        </h2>
        <p className="text-gray-600 animate-slide-up">
          {isDateFiltered 
            ? t('makeupArtistList.results.availableForBooking').replace('{date}', selectedDate)
            : t('makeupArtistList.results.recentlyFound')
          }
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">{t('makeupArtistList.results.errorOccurred')}</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          <button
            onClick={onLoadMore}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            {t('makeupArtistList.results.tryAgain')}
          </button>
        </div>
      )}

      {/* Artists Grid */}
      <div className="space-y-4">
        {isDateFiltered ? (
          // Show available MUAs with their services for the selected date
          availableMuas.map((muaService) => (
            <div key={muaService.mua._id} className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💄</span>
                  </div>
                  <div className="flex-1">
                  <div className="flex items-start gap-4">
          {/* Artist Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {muaService.mua.userName}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                {muaService.mua.bio || t('makeupArtistList.results.professionalMakeupService')}
                </p>
                <span className="inline-flex items-center  py-1 rounded-full text-xs font-medium hover:from-rose-200 hover:to-pink-200  gap-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{muaService.mua.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-900">
                      {muaService.mua.ratingAverage?.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({muaService.mua.feedbackCount} {t('makeupArtistList.results.reviews')})</span>
                  </div>
                    <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-sm font-semibold">
                      {t('makeupArtistList.results.verified')}
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
                onClick={() => onViewProfile(muaService.mua._id, 'portfolio')}
                className="px-3 py-2 bg-white border border-rose-300 text-rose-600 text-xs font-medium rounded-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
              >
                {t('makeupArtistList.results.viewPortfolio')}
              </button>
            </div>
          </div>
        </div>
                     
                    {/* Available Services */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {t('makeupArtistList.results.availableServices').replace('{count}', muaService.services.length.toString())}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {muaService.services.map((service) => (
                          <div key={service._id} className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                            <div className="flex gap-3 items-start">
                              {/* Service Image */}
                              <div className="flex-shrink-0">
                                {service.imageUrl ? (
                                  <img 
                                    src={service.imageUrl} 
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
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{service.description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <div>
                                        <p className="text-sm text-rose-600 font-medium">
                                          {service.price.toLocaleString()} VND
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {service.duration} {t('makeupArtistList.results.mins')}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleBookService(muaService.mua._id, service._id)}
                                        className="px-3 py-1 bg-rose-500 text-white text-xs rounded-md hover:bg-rose-600 transition-colors flex-shrink-0"
                                      >
                                        {t('makeupArtistList.results.book')}
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

                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Show regular artist cards
          artists.map((artist) => (
            <ArtistCard
              key={artist._id}
              artist={artist}
              onViewProfile={handleViewProfile}
              onBookService={handleBookService}
            />
          ))
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden animate-pulse hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gradient-to-r from-rose-200 to-pink-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-rose-200 to-pink-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-rose-200 to-pink-200 rounded w-1/2 mb-3 animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gradient-to-r from-rose-200 to-pink-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1 h-8 bg-gradient-to-r from-rose-200 to-pink-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && ((isDateFiltered && availableMuas.length === 0) || (!isDateFiltered && artists.length === 0)) && !error && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">💄</div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent mb-2 animate-slide-up">
            {isDateFiltered 
              ? t('makeupArtistList.results.noArtistsAvailable').replace('{date}', selectedDate)
              : t('makeupArtistList.results.noArtistsFound')
            }
          </h3>
          <p className="text-gray-600 mb-6 animate-slide-up">
            {isDateFiltered 
              ? t('makeupArtistList.results.tryDifferentDate')
              : t('makeupArtistList.results.tryAdjustingFilters')
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-300 transform active:scale-95"
          >
            {t('makeupArtistList.results.resetSearch')}
          </button>
        </div>
      )}


      {/* Pagination UI (only khi không lọc theo ngày và có nhiều trang) */}
      {!isDateFiltered && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
