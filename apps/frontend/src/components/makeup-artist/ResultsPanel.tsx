"use client";

import React from "react";
import Link from "next/link";
import type { Artist, SortKey } from "@/config/types";
import { SERVICE_CATEGORY_LABELS, ServiceCategory } from "../../constants/constants";

/* ===== Helpers ===== */
const fmtVND = (n?: number | null) =>
  typeof n === "number" ? `${n.toLocaleString("en-US")} VND` : "Contact";

function Stars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const arr = Array.from({ length: 5 }, (_, i) => i < full);
  return (
    <div className="flex items-center gap-1 text-amber-500 text-sm">
      {arr.map((f, i) => (
        <span key={i}>{f ? "★" : "☆"}</span>
      ))}
      <span className="text-gray-600 ml-1">{Number(value).toFixed(1)}</span>
    </div>
  );
}

/* ===== Card theo giao diện mới (mềm, viền nhẹ, ảnh trái, CTA) ===== */
function ListCard({ a }: { a: Artist }) {
  return (
    <article className="w-full rounded-2xl border border-rose-200/60 bg-white p-5 flex items-start justify-between gap-6 hover:shadow-md transition">
      {/* Image */}
      <div className="w-40 h-28 rounded-xl overflow-hidden bg-rose-50 shrink-0 grid place-items-center text-gray-400 text-sm">
        {a.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="w-full h-full object-cover" src={a.avatarUrl} alt={a.fullName ?? "MUA"} />
        ) : (
          "No Image"
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link href={`/artists/portfolio/${a.id}`}>
          <h3 className="font-bold text-gray-900 leading-tight text-lg truncate hover:text-pink-600 transition">
            {a.fullName ?? "Makeup Artist Name"}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <Stars value={Number(a.ratingAverage ?? 0)} />
          <span className="text-sm text-gray-500">({a.bookingCount ?? 0} bookings)</span>
        </div>
        <p className="mt-2 text-[15px] text-gray-700 line-clamp-2">
          {a.bio ?? "Specializing in bridal & party makeup. Available at home & studio. Friendly & punctual."}
        </p>
        <Link href={`/artists/portfolio/${a.id}`}>
          <button className="mt-3 inline-flex items-center h-10 px-4 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700">
            View Portfolio
          </button>
        </Link>
      </div>

      {/* Price + location */}
      <div className="w-56 text-right">
        {a.location && (
          <div className="inline-flex items-center h-8 px-3 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-2">
            {a.location}
          </div>
        )}
        <div className="text-2xl font-bold text-rose-600">{fmtVND(a.ratePerHour)}</div>
      </div>
    </article>
  );
}

/* ===== Results Panel ===== */
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
}: {
  occasion: ServiceCategory;
  onOccasionChange: (v: ServiceCategory) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  artists: Artist[];
  loading: boolean;
  total: number;
  error: string | null;
  canLoadMore: boolean;
  onLoadMore: () => void;
}) {
  const sorts: Array<{ label: string; value: SortKey }> = [
    { label: "Featured", value: "rating_desc" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest", value: "newest" },
    { label: "Most Popular", value: "popular" },
  ];

  const occasionTabs: Array<{ label: string; value: ServiceCategory }> = [
    { label: SERVICE_CATEGORY_LABELS.ALL, value: "ALL" },
    { label: SERVICE_CATEGORY_LABELS.BRIDAL, value: "BRIDAL" },
    { label: SERVICE_CATEGORY_LABELS.PARTY, value: "PARTY" },
    { label: SERVICE_CATEGORY_LABELS.WEDDING_GUEST, value: "WEDDING_GUEST" },
    { label: SERVICE_CATEGORY_LABELS.GRADUATION, value: "GRADUATION" },
    { label: SERVICE_CATEGORY_LABELS.PROM, value: "PROM" },
    { label: SERVICE_CATEGORY_LABELS.DAILY, value: "DAILY" },
    { label: SERVICE_CATEGORY_LABELS.SPECIAL_EVENT, value: "SPECIAL_EVENT" },
  ];

  return (
    <section>
      {/* Tabs dịp + Sort */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {occasionTabs.map((t) => {
            const active = occasion === t.value;
            return (
              <button
                key={t.value}
                onClick={() => onOccasionChange(t.value)}
                className={`px-4 py-2 h-10 rounded-xl text-sm border transition ${
                  active
                    ? "bg-pink-500 text-white border-pink-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="w-48">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="w-full h-10 px-3 pr-8 rounded-xl bg-white text-sm text-gray-700 border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && <div className="text-rose-600 mb-3">⚠️ {error}</div>}

      {/* List */}
      <div className="space-y-4">
        {artists.map((a) => (
          <ListCard key={a.id ?? `${a.fullName}-${Math.random()}`} a={a} />
        ))}

        {/* Skeleton */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="h-36 rounded-2xl border border-rose-200 bg-white animate-pulse" />
          ))}
      </div>

      {/* Load more / End */}
      <div className="mt-8 flex justify-center">
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : canLoadMore ? (
          <button
            onClick={onLoadMore}
            className="h-11 px-6 rounded-xl bg-gray-900 text-white text-sm hover:bg-black"
          >
            Load More
          </button>
        ) : (
          <div className="text-gray-500 text-sm">No more results</div>
        )}
      </div>
    </section>
  );
}
