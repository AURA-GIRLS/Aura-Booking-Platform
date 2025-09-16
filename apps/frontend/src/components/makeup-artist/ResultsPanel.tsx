"use client";

import React from "react";
import Link from "next/link";
import type { Artist, SortKey } from "@/config/types";
import { SERVICE_CATEGORY_LABELS, ServiceCategory } from "../../constants/constants";
import ArtistCard from "./ArtistCard";

interface ResultsPanelProps {
  occasion: ServiceCategory;
  onOccasionChange: (occasion: ServiceCategory) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  artists: Artist[];
  loading: boolean;
  total: number;
  error: string | null;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onViewProfile: (artistId: string, tab?: string) => void;
  onBookService: (artistId: string, serviceId: string) => void;
}

export default function ResultsPanel({
  occasion,
  onOccasionChange,
  sort,
  onSortChange,
  artists,
  loading,
  total,
  error,
  canLoadMore,
  onLoadMore,
  onViewProfile,
  onBookService,
}: ResultsPanelProps) {
  const occasionTabs = Object.entries(SERVICE_CATEGORY_LABELS);
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "rating_desc", label: "Featured" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Popular" },
  ];

  const handleViewProfile = (artistId: string) => {
    // Navigate to artist portfolio page
    window.location.href = `/user/artists/portfolio/${artistId}`;
  };

  const handleBookService = (artistId: string, serviceId: string) => {
    window.location.href = `/user/booking/${artistId}/${serviceId}`;
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
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
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
          All Areas: {total.toLocaleString("en-US")} Makeup Artists waiting for you to choose
        </h2>
        <p className="text-gray-600 animate-slide-up">
          Recently found high-quality makeup services nationwide
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-red-800 font-medium">An error occurred</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
          <button
            onClick={onLoadMore}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Artists Grid */}
      <div className="space-y-4">
        {artists.map((artist) => (
          <ArtistCard
            key={artist._id}
            artist={artist}
            onViewProfile={handleViewProfile}
            onBookService={handleBookService}
          />
        ))}
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
      {!loading && artists.length === 0 && !error && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">💄</div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent mb-2 animate-slide-up">
            No Makeup Artist found
          </h3>
          <p className="text-gray-600 mb-6 animate-slide-up">
            Try adjusting the filters or searching with different keywords
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-300 transform active:scale-95"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Load More Button */}
      {canLoadMore && !loading && (
        <div className="text-center pt-6 animate-slide-up">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border-2 border-rose-300 text-rose-700 rounded-xl hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:border-rose-400 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-300 font-medium transform active:scale-95"
          >
            Load More Makeup Artists
          </button>
        </div>
      )}
    </div>
  );
}
