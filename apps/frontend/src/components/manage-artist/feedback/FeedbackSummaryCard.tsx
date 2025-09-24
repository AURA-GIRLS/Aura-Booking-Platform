import Image from 'next/image';
import { Star } from 'lucide-react';

interface FeedbackSummary {
  serviceId: string;
  serviceName: string;
  serviceImageUrl?: string;
  averageRating: number;
  reviewCount: number;
}

interface Props {
  summary: FeedbackSummary;
  onViewDetails: (summary: FeedbackSummary) => void;
}

const fallbackImage = '/placeholder-image.png'; // Provide a fallback image path

export default function FeedbackSummaryCard({ summary, onViewDetails }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
      <div className="relative h-40 w-full">
        <Image 
          src={summary.serviceImageUrl || fallbackImage}
          alt={summary.serviceName}
          layout="fill"
          objectFit="cover"
          className="bg-gray-100"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 truncate" title={summary.serviceName}>
          {summary.serviceName}
        </h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={18} />
            <span className="font-semibold">{summary.averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({summary.reviewCount} reviews)</span>
          </div>
        </div>
        <button 
          onClick={() => onViewDetails(summary)}
          className="w-full mt-4 bg-pink-50 text-pink-700 font-semibold py-2.5 rounded-lg hover:bg-pink-100 transition-colors duration-300">
          View Details
        </button>
      </div>
    </div>
  );
}
