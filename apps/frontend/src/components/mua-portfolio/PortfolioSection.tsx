"use client";

import { Camera } from "lucide-react";
import { Card, CardContent } from "../lib/ui/card";
import { Button } from "../lib/ui/button";
import { Badge } from "../lib/ui/badge";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicPortfolios } from "@/lib/api/portfolio";
import type { Portfolio } from "@/types/portfolio";
import { PORTFOLIO_CATEGORY_LABELS } from "@/constants/index";
import PortfolioDetailDialog from "./PortfolioDetailDialog";
import { useTranslate } from "@/i18n/hooks/useTranslate";

// Category colors mapping - giống PortfolioCard
const CATEGORY_COLORS: Record<string, string> = {
  BRIDAL: "bg-pink-500",
  PARTY: "bg-purple-500",
  WEDDING_GUEST: "bg-rose-500",
  GRADUATION: "bg-blue-500",
  DAILY: "bg-green-500",
  PROM: "bg-indigo-500",
  PHOTOSHOOT: "bg-amber-500",
  SPECIAL_EVENT: "bg-orange-500",
};

export default function PortfolioSection() {
  const params = useParams();
  const artistId = params.id as string;
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { t, loading: i18nLoading } = useTranslate('portfolio');

  // Categories - giống PortfolioManagement
  const CATEGORIES = [
    { value: "", label: t('portfolio.all') },
    { value: "BRIDAL", label: t('categories.bridal') },
    { value: "PARTY", label: t('categories.party') },
    { value: "WEDDING_GUEST", label: t('categories.weddingGuest') },
    { value: "GRADUATION", label: t('categories.graduation') },
    { value: "DAILY", label: t('categories.daily') },
    { value: "PROM", label: t('categories.prom') },
    { value: "PHOTOSHOOT", label: t('categories.photoshoot') },
    { value: "SPECIAL_EVENT", label: t('categories.specialEvent') },
  ];

  // Fetch portfolios from MongoDB
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const result = await getPublicPortfolios(artistId, {
          category: selectedCategory || undefined,
          limit: 6,
          page: 1,
        });
        setPortfolios(result.data);
      } catch (error) {
        console.error("Failed to fetch portfolios:", error);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchPortfolios();
    }
  }, [artistId, selectedCategory]);

  // Handle category change - giống PortfolioManagement
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle portfolio click
  const handlePortfolioClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPortfolio(null);
  };

  if (i18nLoading) {
    return (
      <section id="portfolio" className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">{t('portfolio.title')}</h2>
          <p className="text-gray-600 text-lg">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Category Filters - giống PortfolioManagement */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant="outline"
              onClick={() => handleCategoryChange(cat.value)}
              className={`border-rose-300 text-rose-700 hover:bg-rose-100 transition-colors ${
                selectedCategory === cat.value
                  ? "bg-rose-100 font-semibold"
                  : "bg-transparent"
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            <p className="mt-4 text-gray-600">{t('portfolio.loading')}</p>
          </div>
        )}

        {/* Portfolio Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolios.length > 0 ? (
              portfolios.map((item) => {
                const categoryColor = CATEGORY_COLORS[item.category || "DAILY"] || "bg-rose-500";
                const categoryLabel = item.category 
                  ? t(`categories.${item.category.toLowerCase()}`) 
                  : "Portfolio";

                return (
                  <Card 
                    key={item._id} 
                    className="overflow-hidden border-rose-200 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                    onClick={() => handlePortfolioClick(item)}
                  >
                    <div className="h-48 bg-rose-50 flex items-center justify-center border-b border-rose-200 relative overflow-hidden">
                      {item.images?.[0]?.url ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Camera className="w-16 h-16 text-rose-300" />
                      )}
                      {/* Multiple images indicator */}
                      {item.images && item.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{item.images.length - 1} {t('portfolio.more')}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge className={`${categoryColor} text-white mb-2 text-xs`}>
                        {categoryLabel}
                      </Badge>
                      <h3 className="font-semibold text-black mb-1 line-clamp-1 text-sm">{item.title}</h3>
                      <p className="text-gray-600 text-xs line-clamp-2 mb-2">{item.description || ""}</p>
                       
                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Empty state
              <div className="col-span-full text-center py-12">
                <Camera className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                <p className="text-gray-600">{t('portfolio.noItemsFound')}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white">{t('portfolio.viewFullPortfolio')}</Button>
        </div>
      </div>

      {/* Portfolio Detail Dialog */}
      <PortfolioDetailDialog 
        portfolio={selectedPortfolio}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </section>
  );
}