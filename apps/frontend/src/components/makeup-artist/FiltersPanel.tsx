import React from "react";

export default function FiltersPanel({
  q, onQChange,
  budgetOptions, selectedBudgets, onToggleBudget,
  rating, onRatingChange,
}: {
  q: string;
  onQChange: (v: string) => void;
  budgetOptions: string[];
  selectedBudgets: string[];
  onToggleBudget: (v: string) => void;
  rating: number | null;
  onRatingChange: (v: number) => void;
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Search by name */}
      <div className="rounded-2xl overflow-hidden border border-rose-200 bg-white shadow-sm">
        <div className="bg-rose-50 text-gray-900 font-semibold text-base px-5 py-3.5 border-b border-rose-200">
          Search by Makeup Artist Name
        </div>
        <div className="px-5 py-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
            <input
              type="text"
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              placeholder="Enter artist name..."
              className="w-full h-12 pl-10 pr-3 rounded-xl border-2 border-rose-200 bg-white text-base
                         focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Budget */}
      <section className="rounded-2xl overflow-hidden border border-rose-200 bg-white shadow-sm">
        <div className="bg-rose-50 text-gray-900 font-semibold text-base px-5 py-3.5 border-b border-rose-200">
          Budget
        </div>
        <div className="px-5 py-5 space-y-3">
          {budgetOptions.map((budget) => (
            <label key={budget} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 text-rose-600 border-rose-300 rounded focus:ring-rose-400 focus:ring-2"
                checked={selectedBudgets.includes(budget)}
                onChange={() => onToggleBudget(budget)}
              />
              <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">{budget}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Rating */}
      <section className="rounded-2xl overflow-hidden border border-rose-200 bg-white shadow-sm">
        <div className="bg-rose-50 text-gray-900 font-semibold text-base px-5 py-3.5 border-b border-rose-200">
          Minimum Rating
        </div>
        <div className="px-5 py-5">
          <div className="flex gap-2 flex-wrap">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star)}
                className={`h-9 px-3 rounded-lg border text-sm flex items-center gap-1 transition-all focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                  rating === star
                    ? "border-rose-500 bg-rose-100 text-rose-700 shadow-sm"
                    : "border-rose-200 text-gray-700 hover:bg-rose-50 hover:border-rose-300"
                }`}
                aria-pressed={rating === star}
              >
                {star} <span className={rating === star ? "text-rose-600" : "text-gray-400"}>★</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
