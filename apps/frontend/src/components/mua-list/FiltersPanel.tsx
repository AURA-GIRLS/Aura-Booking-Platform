import { useTranslate } from "@/i18n/hooks/useTranslate";
import React from "react";
import { SERVICE_ADDON_LABELS, ServiceAddon } from "../../constants/constants";

interface FiltersPanelProps {
  q: string;
  onQChange: (v: string) => void;
  budgetOptions: string[];
  selectedBudgets: string[];
  onToggleBudget: (v: string) => void;
  rating: number | null;
  onRatingChange: (v: number) => void;
  selectedAddons: ServiceAddon[];
  onToggleAddon: (addon: ServiceAddon) => void;
  onReset: () => void;
  isDateFiltered?: boolean;
  selectedDate?: string;
}

export default function FiltersPanel({
  q, onQChange,
  budgetOptions, selectedBudgets, onToggleBudget,
  rating, onRatingChange,
  selectedAddons, onToggleAddon,
  onReset,
  isDateFiltered,
  selectedDate
}: FiltersPanelProps) {
  const { t } = useTranslate('artists');
  const addonOptions = Object.entries(SERVICE_ADDON_LABELS);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Date Filter Status */}
      {isDateFiltered && selectedDate && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-rose-800">{t('makeupArtistList.filters.dateFilterActive')}</span>
          </div>
          <p className="text-xs text-rose-700 mb-2">
            {t('makeupArtistList.filters.showingMuasAvailable').replace('{date}', selectedDate)}
          </p>
          <p className="text-xs text-rose-600">
            {t('makeupArtistList.filters.additionalFilters')}
          </p>
        </div>
      )}
      {/* Search by Name or Location */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
        <h3 className="text-sm font-semibold text-black mb-3 transition-all duration-300">
          {isDateFiltered ? t('makeupArtistList.filters.searchWithinAvailable') : t('makeupArtistList.filters.searchByName')}
        </h3>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black transition-colors duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder={isDateFiltered ? t('makeupArtistList.filters.searchAvailablePlaceholder') : t('makeupArtistList.filters.searchPlaceholder')}
            className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-gray-400 hover:border-gray-300 hover:shadow-sm transition-all duration-300 group-hover:bg-rose-50/30"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
        <h3 className="text-sm font-semibold text-black transition-all duration-300 pb-2">
          {isDateFiltered ? t('makeupArtistList.filters.filterByPrice') : t('makeupArtistList.filters.budget')}
        </h3>
        {isDateFiltered && (
          <p className="text-xs text-gray-600 mb-2">{t('makeupArtistList.filters.filterMuasWithPrice')}</p>
        )}
        <div className="space-y-2">
          {budgetOptions.map((budget) => (
            <label key={budget} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-all duration-200 hover:scale-105">
              <input
                type="checkbox"
                className="w-4 h-4 text-rose-600 border-gray-300 rounded hover:border-gray-400"
                checked={selectedBudgets.includes(budget)}
                onChange={() => onToggleBudget(budget)}
              />
              <span className="text-sm text-black hover:text-gray-800 transition-colors duration-200">{budget}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
        <h3 className="text-sm font-semibold text-black mb-3 transition-all duration-300">
          {isDateFiltered ? t('makeupArtistList.filters.filterByRating') : t('makeupArtistList.filters.minimumRating')}
        </h3>
        {isDateFiltered && (
          <p className="text-xs text-gray-600 mb-2">{t('makeupArtistList.filters.showOnlyRating')}</p>
        )}
        <div className="flex gap-2">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`h-8 px-2 rounded-md border text-xs flex items-center gap-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 hover:scale-110 hover:shadow-md ${
                rating === star
                  ? "border-black bg-black text-white shadow-md"
                  : "border-gray-300 text-black hover:bg-gray-100 hover:border-gray-400"
              }`}
              aria-pressed={rating === star}
            >
              <span className={rating === star ? "text-white" : "text-black hover:text-gray-600 transition-colors duration-200"}>★</span>
              <span>{star}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={onReset}
        className="w-full h-10 px-4 rounded-md border-[1px] border-rose-300 active:border-2 active:border-rose-300 text-rose-500 hover:bg-rose-100 hover:border-rose-600 hover:shadow-lg focus:outline-none transition-all duration-300 text-sm font-medium transform "
      >
        {isDateFiltered ? t('makeupArtistList.filters.resetAdditionalFilters') : t('makeupArtistList.filters.resetFilters')}
      </button>
    </div>
  );
}
