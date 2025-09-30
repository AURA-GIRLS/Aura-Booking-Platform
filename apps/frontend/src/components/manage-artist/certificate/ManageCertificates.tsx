"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import CertificateCard from "./CertificateCard";
import CertificateFormModal from "./CertificateFormModal";
import Notification from "@/components/generalUI/Notification";
import type { Certificate, CertificateFilters } from "@/types/certificate";
import {
  getMyCertificates,
  deleteCertificate,
} from "@/lib/api/certificate";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A-Z" },
  { value: "issueDate", label: "Issue Date" },
  { value: "oldest", label: "Oldest" },
];

export default function ManageCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CertificateFilters>({
    page: 1,
    limit: 12,
    sort: "newest",
    q: "",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

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

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyCertificates(filters);
      setCertificates(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      showNotification("error", "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort: sort as any, page: 1 }));
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteCertificate(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      showNotification("success", "Certificate deleted successfully!");
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      showNotification("error", "Failed to delete certificate. Please try again.");
    }
  };

  // Handle edit
  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setShowModal(true);
  };

  // Handle create new
  const handleCreateNew = () => {
    setEditingCertificate(null);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setEditingCertificate(null);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingCertificate(null);
    fetchCertificates();
    showNotification(
      "success",
      editingCertificate ? "Certificate updated successfully!" : "Certificate added successfully!"
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
            My Certificates
          </h1>
          <p className="text-gray-600">
            Manage your professional certifications and credentials
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Certificate
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, issuer, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

      {/* Loading State */}
      {loading && certificates.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Loading certificates...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No certificates found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchInput
                ? "Try adjusting your search terms"
                : "Start adding your professional certifications to showcase your expertise"}
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Certificate
            </button>
          </div>
        </div>
      )}

      {/* Certificates Grid */}
      {certificates.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate._id}
                certificate={certificate}
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
                {loading ? "Loading..." : "Load More Certificates"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Add Button */}
      {certificates.length > 0 && (
        <button
          onClick={handleCreateNew}
          className="fixed bottom-8 right-8 bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors z-10"
          title="Add Certificate"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <CertificateFormModal
          certificate={editingCertificate}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}