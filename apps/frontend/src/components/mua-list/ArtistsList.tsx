"use client";

import { useTranslate } from "@/i18n/hooks/useTranslate";
import React, { useEffect, useMemo, useState } from "react";
import { PROVINCES, BUDGET_OPTIONS, type ServiceCategory, ServiceAddon } from "../../constants/constants";
import { BookingService } from "@/services/booking";
import type { IAvailableMuaServices } from "@/types/booking.dtos";
import FiltersPanel from "./FiltersPanel";
import ResultsPanel from "./ResultsPanel";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiResp, Artist, SortKey } from "@/types/artist.dto";
import { ArtistService } from "@/services/artist";

const budgetToRange = (b: string) => {
  const m = b.match(/(\d[\d\.]*)\s*VND\s*-\s*(\d[\d\.]*)/i);
  if (m) return { min: Number(m[1].replaceAll(".", "")), max: Number(m[2].replaceAll(".", "")) };
  if (/Above/i.test(b)) return { min: 1_200_000, max: undefined };
  
  return {};
};

export default function ArtistsList() {
  const { t } = useTranslate('artists');
  // Data
  const [artists, setArtists] = useState<Artist[]>([]);
  const [availableMuas, setAvailableMuas] = useState<IAvailableMuaServices[]>([]);
  const [filteredAvailableMuas, setFilteredAvailableMuas] = useState<IAvailableMuaServices[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  const router = useRouter();
  // Filters
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("All Areas");
  
  // Tabs = occasion (dịp)
  const [occasion, setOccasion] = useState<ServiceCategory>("ALL");
  
  // Free-text tone
  const [styleText, setStyleText] = useState<string>("");
  
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ServiceAddon[]>([]);
  const [sort, setSort] = useState<SortKey>("rating_desc");
  const [page, setPage] = useState(1);
  const limit = 6;
  
  const { priceMin, priceMax } = useMemo(() => {
    const mins = selectedBudgets.map((b) => budgetToRange(b).min).filter((n): n is number => typeof n === "number");
    const maxs = selectedBudgets.map((b) => budgetToRange(b).max).filter((n): n is number => typeof n === "number");
    return { priceMin: mins.length ? Math.min(...mins) : undefined, priceMax: maxs.length ? Math.max(...maxs) : undefined };
  }, [selectedBudgets]);
  
  // Client-side filtering for date-filtered MUAs
  const filteredMuas = useMemo(() => {
    if (!isDateFiltered || availableMuas.length === 0) {
      return availableMuas;
    }

    return availableMuas.map((muaService) => {
      const mua = muaService.mua;
      
      // Location filter
      if (location !== "All Areas" && mua.location !== location) {
        return null;
      }

      // Rating filter
      if (rating !== null && (mua.ratingAverage || 0) < rating) {
        return null;
      }

      // Search query filter
      if (q.trim()) {
        const searchTerm = q.toLowerCase();
        const matchesName = mua.userName?.toLowerCase().includes(searchTerm);
        const matchesBio = mua.bio?.toLowerCase().includes(searchTerm);
        const matchesLocation = mua.location?.toLowerCase().includes(searchTerm);
        const matchesServices = muaService.services.some(service => 
          service.name.toLowerCase().includes(searchTerm)
        );
        
        if (!matchesName && !matchesBio && !matchesLocation && !matchesServices) {
          return null;
        }
      }

      // Filter services by price range - combine multiple selected budget ranges
      let filteredServices = muaService.services;
      if (selectedBudgets.length > 0) {
        // Create array of all price ranges from selected budgets
        const priceRanges = selectedBudgets.map(budget => budgetToRange(budget));
        
        filteredServices = muaService.services.filter(service => {
          // Check if service price falls within ANY of the selected ranges
          return priceRanges.some(range => {
            const { min, max } = range;
            if (min !== undefined && service.price < min) return false;
            if (max !== undefined && service.price > max) return false;
            return true;
          });
        });
        
        // If no services match any price range, exclude this MUA
        if (filteredServices.length === 0) {
          return null;
        }
      }

      // Return MUA with filtered services
      return {
        ...muaService,
        services: filteredServices
      };
    }).filter((muaService): muaService is IAvailableMuaServices => muaService !== null);
  }, [availableMuas, isDateFiltered, location, rating, selectedBudgets, q]);

  // Fetch artists or available MUAs by date
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (selectedDate && isDateFiltered) {
          // Fetch available MUAs for the selected date
          const response = await BookingService.getAvailableMuaByDay(selectedDate);
          if (response.success && response.data) {
            const muaData = Array.isArray(response.data) ? response.data : [response.data];
            setAvailableMuas(muaData);
            setArtists([]); // Clear regular artists when showing date-filtered results
          }
        } else {
          // Regular artist search
          const data: ApiResp = await ArtistService.fetchArtists({
            q,
            location,
            occasion, 
            style: styleText,
            rating,
            priceMin,
            priceMax,
            addons: selectedAddons,
            sort,
            page,
            limit,
          });

          setTotal(data.total ?? 0);
          setPages(data.pages ?? 1);
          setArtists(data.items);
          setAvailableMuas([]); // Clear available MUAs when showing regular results
        }
      } catch (e: any) {
        setError(e?.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, occasion, styleText, rating, priceMin, priceMax, selectedAddons, sort, page, selectedDate, isDateFiltered]);

  // Update total count when filters change for date-filtered results
  useEffect(() => {
    if (isDateFiltered) {
      setTotal(filteredMuas.length);
    }
  }, [filteredMuas, isDateFiltered]);

  const canLoadMore = page < pages;
  const metaLine = `${location}: ${total.toLocaleString("en-US")} Makeup Artists waiting for you to choose`;

  const handleReset = () => {
    setQ("");
    setLocation("All Areas");
    setOccasion("ALL");
    setStyleText("");
    setSelectedBudgets([]);
    setRating(null);
    setSelectedAddons([]);
    setSort("rating_desc");
    setPage(1);
    setSelectedDate("");
    setIsDateFiltered(false);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setIsDateFiltered(!!date);
    setPage(1);
  };

  const handleViewProfile = (artistId: string, tab?: string) => {
    if (tab === 'portfolio') {
      window.location.href = `/user/artists/portfolio/${artistId}`;
    } else {
      // Default behavior - could be contact page or general profile
      window.location.href = `/user/artists/portfolio/${artistId}`;
    }
  };

  const handleBookService = (artistId: string, serviceId: string) => {
    // Navigate to booking page with artist and service parameters
    router.push(`/user/booking/${artistId}/${serviceId}`);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white relative overflow-hidden">
      {/* Header section with title and search */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* Title and subtitle */}
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-rose-200/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-pink-200/40 rounded-full blur-lg animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-rose-300/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-pink-300/30 rounded-full blur-md animate-bounce"></div>
          </div>

          <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-3 bg-gray-900 bg-clip-text text-transparent leading-tight">
          {t('makeupArtistList.title')}
            </h1>
            <p className="font-normal md:font-lg text-gray-600 max-w-2xl mx-auto animate-slide-up">
              {t('makeupArtistList.subtitle')}
            </p>
          </div>

          {/* Search filter bar */}
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-200/50 p-4 md:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Location */}
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <MapPin size={18} strokeWidth={2} />
                  </span>
                  <select
                    aria-label={t('makeupArtistList.search.location')}
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                    className="appearance-none h-12 w-full pl-10 pr-8 rounded-lg border border-gray-300 bg-white text-sm
                               focus:outline-none  hover:border-rose-300  hover:shadow-md"
                  >
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>

                {/* Date */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    aria-label={t('makeupArtistList.search.date')}
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    placeholder="dd/mm/yyyy"
                    className="h-12 w-full pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-sm
                               focus:outline-none hover:border-rose-300 hover:shadow-md
                               [color-scheme:light] placeholder:text-gray-400 "
                  />
                </div>

                {/* Style */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <input
                    aria-label={t('makeupArtistList.search.style')}
                    value={styleText}
                    onChange={(e) => { setStyleText(e.target.value); setPage(1); }}
                    placeholder={t('makeupArtistList.search.stylePlaceholder')}
                    className="h-12 w-full pl-10 pr-3 rounded-lg border border-gray-300 bg-white text-sm
                               focus:outline-none hover:border-rose-300 hover:shadow-md
                               placeholder:text-gray-400 "
                  />
                </div>

                {/* Search Button */}
                <div className="flex justify-center md:justify-end">
                  <button
                    onClick={() => setPage(1)}
                    className="h-12 px-6 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-medium hover:from-rose-600 hover:to-pink-700 hover:scale-105 hover:shadow-lg
                               focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 
                               transition-all duration-300 whitespace-nowrap min-w-[140px] transform active:scale-95"
                  >
                    {t('makeupArtistList.search.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: Filters 3/12 – Results 9/12 */}
      <div className="bg-white  py-8" style={{minHeight:"70rem"}}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <FiltersPanel
              q={q}
              onQChange={(v) => { setQ(v); setPage(1); }}
              budgetOptions={BUDGET_OPTIONS}
              selectedBudgets={selectedBudgets}
              onToggleBudget={(v) => {
                setSelectedBudgets((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));
                setPage(1);
              }}
              rating={rating}
              onRatingChange={(val) => { setRating((cur) => (cur === val ? null : val)); setPage(1); }}
              selectedAddons={selectedAddons}
              onToggleAddon={(addon) => {
                setSelectedAddons((list) => 
                  list.includes(addon) 
                    ? list.filter((x) => x !== addon) 
                    : [...list, addon]
                );
                setPage(1);
              }}
              onReset={handleReset}
              isDateFiltered={isDateFiltered}
              selectedDate={selectedDate}
            />
          </div>

          <div className="lg:col-span-9">
            <ResultsPanel
                occasion={occasion}
                onOccasionChange={(v) => { setOccasion(v); setPage(1); }}
                sort={sort}
                onSortChange={(v) => { setSort(v); setPage(1); }}
                artists={artists}
                availableMuas={filteredMuas}
                isDateFiltered={isDateFiltered}
                selectedDate={selectedDate}
                loading={loading}
                total={total}
                error={error}
                canLoadMore={canLoadMore && !isDateFiltered}
                onLoadMore={() => !loading && setPage((p) => p + 1)}
                onViewProfile={handleViewProfile}
                onBookService={handleBookService}
                currentPage={page}
                totalPages={pages}
                onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
