'use client';

import { useState, useEffect } from 'react';
import { X, Star, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { feedbackService } from '@/services/feedback.service';
import Image from 'next/image';

// Types
interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
}

interface ServiceSummary {
  serviceId: string;
  serviceName: string;
}

interface Props {
  service: ServiceSummary;
  muaId: string;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ReviewsModal({ service, muaId, onClose }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await feedbackService.getFeedbackForService(service.serviceId, page, 5);
        setReviews(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [service.serviceId, page]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={16} className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 truncate">Reviews for {service.serviceName}</h2>
          <button title="Close" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="text-center py-10">Loading reviews...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No reviews for this service yet.</div>
          ) : (
            <ul className="space-y-5">
              {reviews.map((review) => (
                <li key={review._id} className="flex gap-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {review.reviewerAvatarUrl ? (
                        <Image src={review.reviewerAvatarUrl} alt={review.reviewerName} layout="fill" objectFit="cover" />
                    ) : (
                        <UserCircle className="h-full w-full text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-800">{review.reviewerName}</h4>
                        <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex items-center my-1">{renderStars(review.rating)}</div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 flex items-center gap-1">
                <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-md disabled:opacity-50 hover:bg-gray-200 flex items-center gap-1">
                Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
