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

// Category colors mapping - giống PortfolioCard
const CATEGORY_COLORS: Record<string, string> = {
  BRIDAL: "bg-pink-500",
  PARTY: "bg-purple-500",
  WEDDING_GUEST: "bg-rose-500",
  GRADUATION: "bg-blue-500",
  DAILY: "bg-green-500",
  PROM: "bg-indigo-500",
};

export default function PortfolioSection() {
  const params = useParams();
  const artistId = params.id as string;
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Categories - giống PortfolioManagement
  const CATEGORIES = [
    { value: "", label: "All" },
    { value: "BRIDAL", label: PORTFOLIO_CATEGORY_LABELS.BRIDAL },
    { value: "PARTY", label: PORTFOLIO_CATEGORY_LABELS.PARTY },
    { value: "WEDDING_GUEST", label: PORTFOLIO_CATEGORY_LABELS.WEDDING_GUEST },
    { value: "GRADUATION", label: PORTFOLIO_CATEGORY_LABELS.GRADUATION },
    { value: "DAILY", label: PORTFOLIO_CATEGORY_LABELS.DAILY },
    { value: "PROM", label: PORTFOLIO_CATEGORY_LABELS.PROM },
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

  return (
    <section id="portfolio" className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">My Portfolio</h2>
          <p className="text-gray-600 text-lg">
            Explore my latest work and see the artistry and attention to detail that showcases the artistry and skill
            behind every look
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
            <p className="mt-4 text-gray-600">Loading portfolios...</p>
          </div>
        )}

        {/* Portfolio Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolios.length > 0 ? (
              portfolios.map((item) => {
                const categoryColor = CATEGORY_COLORS[item.category || "DAILY"] || "bg-rose-500";
                const categoryLabel = item.category 
                  ? PORTFOLIO_CATEGORY_LABELS[item.category as keyof typeof PORTFOLIO_CATEGORY_LABELS] 
                  : "Portfolio";

                return (
                  <Card key={item._id} className="overflow-hidden border-rose-200 hover:shadow-lg transition-shadow">
                    <div className="h-64 bg-rose-100 flex items-center justify-center border-b border-rose-200 relative overflow-hidden">
                      {item.images?.[0]?.url ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-16 h-16 text-rose-300" />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <Badge className={`${categoryColor} text-white mb-3`}>
                        {categoryLabel}
                      </Badge>
                      <h3 className="font-semibold text-black mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.description || ""}</p>
                      
                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Empty state
              <div className="col-span-3 text-center py-12">
                <Camera className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                <p className="text-gray-600">No portfolio items found</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white">View Full Portfolio</Button>
        </div>
      </div>
    </section>
  );
}