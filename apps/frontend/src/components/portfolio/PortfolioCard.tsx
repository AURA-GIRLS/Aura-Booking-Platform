"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Eye, Edit, Trash2 } from "lucide-react";
import type { Portfolio } from "@/types/portfolio";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_CATEGORY_LABELS } from "@/constants/index";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (id: string) => void;
}

// Category colors mapping 
const CATEGORY_COLORS: Record<string, string> = {
  BRIDAL: "bg-pink-500",
  PARTY: "bg-purple-500",
  WEDDING_GUEST: "bg-rose-500",
  GRADUATION: "bg-blue-500",
  DAILY: "bg-green-500",
  PROM: "bg-indigo-500",
};

export default function PortfolioCard({
  portfolio,
  onEdit,
  onDelete,
}: PortfolioCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const coverImage = portfolio.images[0]?.url || "/placeholder-image.jpg";
  
  // Lấy category từ MongoDB, fallback về DAILY nếu không có
  const category = portfolio.category || PORTFOLIO_CATEGORIES.DAILY;
  const categoryColor = CATEGORY_COLORS[category] || "bg-gray-500";
  const categoryLabel = PORTFOLIO_CATEGORY_LABELS[category as keyof typeof PORTFOLIO_CATEGORY_LABELS] || category;

  const likes = portfolio.stats?.likes || 0;
  const views = portfolio.stats?.views || 0;

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Handle delete 
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(portfolio._id);
      // Success notification sẽ được handle ở parent component
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Cover Image */}
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={coverImage}
            alt={portfolio.title}
            fill
            className="object-cover"
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`${categoryColor} text-white text-xs font-medium px-3 py-1 rounded`}>
              {categoryLabel}
            </span>
          </div>

          {/* Actions - Show on hover */}
          {showActions && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => onEdit(portfolio)}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)} // MỞ MODAL thay vì delete trực tiếp
                disabled={isDeleting}
                className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
            {portfolio.title}
          </h3>

          {/* Description */}
          {portfolio.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {portfolio.description}
            </p>
          )}

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {portfolio.tags.slice(0, 6).map((tag) => (
                <span key={tag} className="inline-block text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Stats & Time */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
            <span className="text-xs">{getTimeAgo(portfolio.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal*/}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={portfolio.title}
        isDeleting={isDeleting}
      />
    </>
  );
}