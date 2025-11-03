"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../lib/ui/dialog";
import { Badge } from "../lib/ui/badge";
import { Button } from "../lib/ui/button";
import { X, Calendar, Tag, Camera } from "lucide-react";
import type { Portfolio } from "@/types/portfolio";
import { PORTFOLIO_CATEGORY_LABELS } from "@/constants/index";
import { useState } from "react";
import { useTranslate } from "@/i18n/hooks/useTranslate";

interface PortfolioDetailDialogProps {
  portfolio: Portfolio | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function PortfolioDetailDialog({ 
  portfolio, 
  isOpen, 
  onClose 
}: PortfolioDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t, loading: i18nLoading } = useTranslate('portfolio');

  if (!portfolio) return null;

  const categoryColor = CATEGORY_COLORS[portfolio.category || "DAILY"] || "bg-rose-500";
  const categoryLabel = portfolio.category 
    ? t(`categories.${portfolio.category.toLowerCase()}`) 
    : "Portfolio";

  const images = portfolio.images || [];
  const hasMultipleImages = images.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const formatDate = (dateString: string) => {
    const locale = navigator.language || 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (i18nLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
            {portfolio.title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Category and Date */}
          <div className="flex items-center justify-between">
            <Badge className={`${categoryColor} text-white text-sm`}>
              {categoryLabel}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(portfolio.createdAt)}
            </div>
          </div>

          {/* Images Gallery */}
          {images.length > 0 ? (
            <div className="relative">
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={`${portfolio.title} - Image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              {/* Image Navigation */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    ›
                  </Button>
                   
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Thumbnail Navigation */}
              {hasMultipleImages && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex 
                          ? 'border-rose-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Description */}
          {portfolio.description && (
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">{t('portfolioDetail.description')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {portfolio.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <h3 className="text-base font-semibold text-gray-900">{t('portfolioDetail.tags')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {portfolio.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}