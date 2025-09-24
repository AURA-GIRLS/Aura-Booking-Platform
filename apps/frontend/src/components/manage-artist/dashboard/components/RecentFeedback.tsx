import { Star, MessageSquare } from 'lucide-react';
import type { FeedbackItem } from '@/services/dashboard';

interface RecentFeedbackProps {
  recentFeedback: FeedbackItem[];
  formatDateTime: (iso?: string) => string;
}

export default function RecentFeedback({ recentFeedback, formatDateTime }: RecentFeedbackProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Recent Feedback</h2>
        <MessageSquare className="text-pink-500" size={20} />
      </div>

      <div className="space-y-4">
        {recentFeedback.map(item => (
          <div key={item._id} className="p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  {item.reviewerAvatarUrl ? (
                    <img src={item.reviewerAvatarUrl} alt={item.reviewerName || 'Reviewer'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900">{item.reviewerName || 'Customer'}</div>
              </div>
              <div className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <p className="text-sm text-gray-700 mt-1">{item.comment || 'No comment provided.'}</p>
          </div>
        ))}
        {recentFeedback.length === 0 && (
          <div className="text-center py-8 text-gray-500">No feedback yet.</div>
        )}
      </div>
    </div>
  );
}
