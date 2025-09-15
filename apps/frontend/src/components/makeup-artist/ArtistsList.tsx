"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PROVINCES, BUDGET_OPTIONS, type ServiceCategory, ServiceAddon } from "../../constants/constants";
import { fetchArtists } from "@/config/api";
import type { Artist, ApiResp, SortKey } from "@/config/types";
import FiltersPanel from "./FiltersPanel";
import ResultsPanel from "./ResultsPanel";
import { MapPin } from "lucide-react";

const budgetToRange = (b: string) => {
  const m = b.match(/(\d[\d\.]*)\s*VND\s*-\s*(\d[\d\.]*)/i);
  if (m) return { min: Number(m[1].replaceAll(".", "")), max: Number(m[2].replaceAll(".", "")) };
  if (/Above/i.test(b)) return { min: 1_200_000, max: undefined };
  
  return {};
};

export default function ArtistsList() {
  // Data
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const limit = 12;

  const { priceMin, priceMax } = useMemo(() => {
    const mins = selectedBudgets.map((b) => budgetToRange(b).min).filter((n): n is number => typeof n === "number");
    const maxs = selectedBudgets.map((b) => budgetToRange(b).max).filter((n): n is number => typeof n === "number");
    return { priceMin: mins.length ? Math.min(...mins) : undefined, priceMax: maxs.length ? Math.max(...maxs) : undefined };
  }, [selectedBudgets]);

  // Fetch
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data: ApiResp = await fetchArtists({
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
        setArtists((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      } catch (e: any) {
        setError(e?.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, occasion, styleText, rating, priceMin, priceMax, selectedAddons, sort, page]);

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
    window.location.href = `/user/booking/mua?artistId=${artistId}&serviceId=${serviceId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      {/* Header search bar */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-200 py-6 md:py-8 shadow-[inset_0_-1px_0_0_rgba(244,114,182,0.25)]">
        <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="w-full bg-white rounded-2xl shadow-sm border border-rose-200/70 px-4 py-4 md:px-6 md:py-5">
            <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1.2fr_1.2fr_auto] gap-3 lg:gap-4 items-center">
              {/* Location */}
              <div className="relative">
                <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-500">
                  <MapPin size={18} strokeWidth={2} />
                </span>
                <select
                  aria-label="Location"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                  className="appearance-none h-12 w-full pl-10 pr-8 rounded-xl md:rounded-2xl border-2 border-rose-200 bg-white text-base
                             focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                >
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>

              {/* Date placeholder */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500">📅</span>
                <input
                  aria-label="Makeup Date"
                  type="date"
                  className="h-12 w-full pl-10 pr-3 rounded-xl md:rounded-2xl border-2 border-rose-200 bg-white text-base
                             focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 [color-scheme:light]"
                />
              </div>

              {/* Style */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500">💄</span>
                <input
                  aria-label="Makeup Style"
                  value={styleText}
                  onChange={(e) => { setStyleText(e.target.value); setPage(1); }}
                  placeholder="Style (e.g., Natural, Elegant...)"
                  className="h-12 w-full pl-10 pr-3 rounded-xl md:rounded-2xl border-2 border-rose-200 bg-white text-base
                             focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPage(1)}
                  className="h-12 px-5 rounded-xl md:rounded-2xl bg-green-600 text-white text-base hover:bg-green-700 whitespace-nowrap"
                >
                  Find Makeup Artist
                </button>
              </div>
            </div>
          </div>

          {/* Meta line */}
          <div className="mt-5">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {metaLine}
            </div>
            <p className="text-gray-600 mt-1">
              Recently found high-quality makeup services {location !== "All Areas" ? `in ${location}` : "nationwide"}
            </p>
          </div>
        </div>
      </div>

      {/* Main grid: Filters 3/12 – Results 9/12 */}
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
            />
          </div>

          <div className="lg:col-span-9">
            <ResultsPanel
              occasion={occasion}
              onOccasionChange={(v) => { setOccasion(v); setPage(1); }}
              sort={sort}
              onSortChange={(v) => { setSort(v); setPage(1); }}
              artists={artists}
              loading={loading}
              total={total}
              error={error}
              canLoadMore={canLoadMore}
              onLoadMore={() => !loading && setPage((p) => p + 1)}
              onViewProfile={handleViewProfile}
              onBookService={handleBookService}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
