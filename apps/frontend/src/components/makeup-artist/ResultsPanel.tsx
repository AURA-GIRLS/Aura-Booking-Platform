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
    // TODO: Implement booking modal or navigation
    alert(`Book service ${serviceId} from artist ${artistId}`);
  };

  return (
    <div className="space-y-6">
      {/* Tabs for occasions */}
      <div className="bg-white rounded-2xl shadow-sm border border-rose-200 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {occasionTabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onOccasionChange(key as ServiceCategory)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                occasion === key
                  ? "border-rose-500 text-rose-600 bg-rose-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort and Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-lg font-semibold text-gray-900">
          {total.toLocaleString("en-US")} Makeup Artists
          {occasion !== "ALL" && (
            <span className="text-gray-600 font-normal">
              {" "}
              for {SERVICE_CATEGORY_LABELS[occasion]} occasions
            </span>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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
              className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden animate-pulse"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Makeup Artist found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting the filters or searching with different keywords
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Load More Button */}
      {canLoadMore && !loading && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border-2 border-rose-300 text-rose-700 rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-colors font-medium"
          >
            Load More Makeup Artists
          </button>
        </div>
      )}
    </div>
  );
}
