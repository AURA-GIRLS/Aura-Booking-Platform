"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import PortfolioCard from "./PortfolioCard";
import PortfolioFormModal from "./PortfolioFormModal";
import Notification from "../generalUI/Notification";
import type { Portfolio, PortfolioFilters } from "@/types/portfolio";
import { PORTFOLIO_CATEGORY_LABELS } from "@/constants/index";
import {
  getMyPortfolios,
  deletePortfolio,
} from "@/lib/api/portfolio";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "BRIDAL", label: PORTFOLIO_CATEGORY_LABELS.BRIDAL },
  { value: "PARTY", label: PORTFOLIO_CATEGORY_LABELS.PARTY },
  { value: "WEDDING_GUEST", label: PORTFOLIO_CATEGORY_LABELS.WEDDING_GUEST },
  { value: "GRADUATION", label: PORTFOLIO_CATEGORY_LABELS.GRADUATION },
  { value: "DAILY", label: PORTFOLIO_CATEGORY_LABELS.DAILY },
  { value: "PROM", label: PORTFOLIO_CATEGORY_LABELS.PROM },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
  { value: "oldest", label: "Oldest" },
];

export default function PortfolioManagement() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PortfolioFilters>({
    page: 1,
    limit: 9,
    category: "",
    sort: "newest",
    q: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false,
  });

  // Show notification helper
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  // Debounce search - 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch portfolios
  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyPortfolios(filters);
      setPortfolios(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort: sort as any, page: 1 }));
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p._id !== id));
      showNotification("success", "Portfolio deleted successfully!");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
      showNotification("error", "Failed to delete portfolio. Please try again.");
    }
  };

  // Handle edit
  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setShowModal(true);
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingPortfolio(null);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingPortfolio(null);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingPortfolio(null);
    fetchPortfolios();
    showNotification(
      "success",
      editingPortfolio ? "Portfolio updated successfully!" : "Portfolio created successfully!"
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const hasMore = (filters.page || 1) < totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

 {/* Header */}
 <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio Management
          </h1>
          <p className="text-gray-600">
            Manage your portfolio items, add new works, and showcase your artistry
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Portfolio
        </button>
      </div>

      {/* Filters Bar*/}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.category === cat.value
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex gap-3 ml-auto">
            {/* Search - tìm theo title, description, hoặc tags */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-80"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort by: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && portfolios.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Loading portfolios...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && portfolios.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No portfolios found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchInput || filters.category 
                ? "Try adjusting your filters or search terms"
                : "Start building your portfolio by adding your first work"}
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Portfolio
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolios.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio._id}
                portfolio={portfolio}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load More Portfolio Items"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Add Button */}
      {portfolios.length > 0 && (
        <button
          onClick={handleCreateNew}
          className="fixed bottom-8 right-8 bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors z-10"
          title="Add New Portfolio"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <PortfolioFormModal
          portfolio={editingPortfolio}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}