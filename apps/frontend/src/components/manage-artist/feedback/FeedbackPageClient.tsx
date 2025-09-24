'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, MessageSquare, Heart, Camera, PartyPopper } from 'lucide-react';
import { feedbackService } from '@/services/feedback.service';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const ReviewsModal = dynamic(
  () => import('./ReviewsModal'),
  { ssr: false }
);

// --- TYPE DEFINITIONS ---
interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
}

interface ServiceFeedback {
  serviceId: string;
  serviceName: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  serviceImageUrl?: string;
}

// --- HELPER COMPONENTS ---

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('bridal') || name.includes('cưới')) return <Heart className="w-5 h-5 text-pink-500" />;
  if (name.includes('photoshoot') || name.includes('chụp ảnh')) return <Camera className="w-5 h-5 text-blue-500" />;
  if (name.includes('party') || name.includes('tiệc')) return <PartyPopper className="w-5 h-5 text-purple-500" />;
  return <Star className="w-5 h-5 text-gray-400" />;
};

const FeedbackCard = ({ review }: { review: Review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const isOverflowing = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setNeedsExpansion(isOverflowing);
    }
  }, [review.comment]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md w-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={review.reviewerAvatarUrl || `https://ui-avatars.com/api/?name=${review.reviewerName}&background=ec4899&color=fff`}
            alt={review.reviewerName}
            className="w-10 h-10 rounded-full object-cover border-2 border-pink-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{review.reviewerName}</p>
            <p className="text-xs text-gray-500">{format(new Date(review.createdAt), 'dd MMM, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
          <Star className="w-3 h-3 fill-current text-yellow-500" />
          <span>{review.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="relative">
        <p 
          ref={contentRef}
          className={`text-gray-600 text-sm leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''} transition-all`}
        >
          {review.comment}
        </p>
        {needsExpansion && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-1 focus:outline-none"
          >
            ...more
          </button>
        )}
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
    <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="h-28 bg-gray-200 rounded-xl"></div>
                    <div className="h-28 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        ))}
    </div>
);

// --- MAIN COMPONENT ---
export default function FeedbackPageClient() {
  const [feedbacks, setFeedbacks] = useState<ServiceFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{serviceId: string, serviceName: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm mở modal xem tất cả đánh giá
  const handleViewAllReviews = (serviceId: string, serviceName: string) => {
    setSelectedService({ serviceId, serviceName });
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // Hàm fetch dữ liệu feedback
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackService.getFeedbackSummary();
        setFeedbacks(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error('Error fetching feedbacks:', err);
        setError(err.message || 'Failed to fetch feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Component ServiceFeedbackGroup với xử lý mở modal
  const ServiceFeedbackGroup = ({ serviceFeedback }: { serviceFeedback: ServiceFeedback }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-rose-50 p-4 border-b border-rose-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {getServiceIcon(serviceFeedback.serviceName)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">{serviceFeedback.serviceName}</h2>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-pink-600">{serviceFeedback.reviewCount}</span> reviews - 
                Avg. <span className="font-semibold text-yellow-500">{serviceFeedback.averageRating.toFixed(1)}</span>
                <Star className="inline w-4 h-4 -mt-1 ml-1 text-yellow-400 fill-current" />
              </p>
            </div>
          </div>
          {serviceFeedback.reviewCount > 0 && (
            <button 
              onClick={() => handleViewAllReviews(serviceFeedback.serviceId, serviceFeedback.serviceName)}
              className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors whitespace-nowrap px-3 py-1.5 rounded-md hover:bg-pink-50"
            >
              View All →
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {serviceFeedback.reviewCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceFeedback.reviews.slice(0, 2).map(review => (
              <FeedbackCard key={review._id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No reviews yet for this service.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render chính
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">My Feedback</h1>
        <p className="text-gray-600 mt-1 mb-8">See all reviews and feedback from customers about your makeup services.</p>

        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl">
            Error: {error}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">No Services Found</h2>
            <p className="mt-1 text-gray-500">You have not created any services yet. Add a service to start receiving feedback.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map(service => (
              <ServiceFeedbackGroup key={service.serviceId} serviceFeedback={service} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {selectedService && (
        <ReviewsModal
          service={{
            serviceId: selectedService.serviceId,
            serviceName: selectedService.serviceName,
          }}
          muaId={''} // Bạn cần cung cấp muaId từ props hoặc context
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
