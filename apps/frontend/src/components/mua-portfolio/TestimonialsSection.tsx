import { Star } from "lucide-react"
import { Card, CardContent } from "../lib/ui/card"
import { useEffect, useState } from "react"
import { api } from "@/config/api"
import { testimonials } from "./data"
import { useTranslate } from "@/i18n/hooks/useTranslate"

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
}

export default function TestimonialsSection({ muaId }: { muaId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState<number>(0);
  const [satisfaction, setSatisfaction] = useState<number>(0);
  const { t, loading: i18nLoading } = useTranslate('portfolio');

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/feedback/mua/${muaId}/recent`, { params: { limit: 6 } });
        const data: Review[] = res?.data?.data ?? [];
        if (!active) return;
        setReviews(data);
        if (data.length) {
          const total = data.reduce((s, r) => s + (r.rating || 0), 0);
          const avgCalc = total / data.length;
          const sat = Math.round((data.filter(r => (r.rating || 0) >= 4).length / data.length) * 100);
          setAvg(Number(avgCalc.toFixed(1)));
          setSatisfaction(sat);
        } else {
          setAvg(0);
          setSatisfaction(0);
        }
      } catch (e) {
        // If endpoint is auth-protected and user isn't logged in, silently show no reviews
        setReviews([]);
        setAvg(0);
        setSatisfaction(0);
      } finally {
        if (active) setLoading(false);
      }
    };
    if (muaId) run();
    return () => { active = false };
  }, [muaId]);

  if (i18nLoading) {
    return (
      <section id="reviews" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="reviews" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-500">{t('reviews.loading')}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">{t('reviews.title')}</h2>
            <p className="text-gray-600 text-lg">
              {t('reviews.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <Card key={review._id} className="border-rose-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-rose-400 text-rose-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    {review.reviewerAvatarUrl ? (
                      <img
                        src={review.reviewerAvatarUrl}
                        alt={review.reviewerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {review.reviewerName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-black">{review.reviewerName || t('reviews.customer')}</div>
                      <div className="text-sm text-rose-600">{t('reviews.client')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-rose-500">{avg.toFixed(1)}</span>
                  <Star className="w-6 h-6 fill-rose-400 text-rose-400" />
                </div>
                <p className="text-gray-600">{t('reviews.averageRating')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-500 mb-2">{reviews.length}</div>
                <p className="text-gray-600">{t('reviews.totalReviews')}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-rose-600 mb-2">{satisfaction}%</div>
                <p className="text-gray-600">{t('reviews.satisfactionRate')}</p>
              </div>
            </div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              {reviews.length > 0
                ? t('reviews.satisfiedClientsMessage')
                : t('reviews.noReviewsMessage')}
            </p>
          </div>
        </div>
      </section>
  )}
