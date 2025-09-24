import { Crown, PartyPopper, Calendar, Sparkles } from 'lucide-react';
import type { ServiceInsightItem } from '@/services/dashboard';

interface ServiceInsightsProps {
  items: ServiceInsightItem[];
}

const categoryMeta: Record<string, { icon: JSX.Element; subtitle: string } > = {
  DAILY: {
    icon: <Calendar className="text-pink-500" size={18} />,
    subtitle: 'Most popular service',
  },
  BRIDAL: {
    icon: <Crown className="text-rose-500" size={18} />,
    subtitle: 'Premium service',
  },
  PARTY: {
    icon: <PartyPopper className="text-orange-500" size={18} />,
    subtitle: 'Special occasions',
  }
};

function getMeta(category?: string) {
  const key = (category || '').toUpperCase();
  return categoryMeta[key] || {
    icon: <Sparkles className="text-pink-500" size={18} />,
    subtitle: 'Popular pick',
  };
}

export default function ServiceInsights({ items }: ServiceInsightsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Insights</h3>
      <div className="space-y-3">
        {items.map((it) => {
          const meta = getMeta(it.category);
          return (
            <div
              key={it.serviceId}
              className="flex items-center justify-between rounded-xl py-4 px-5 border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-gray-100 grid place-items-center border border-gray-200">
                  {meta.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{it.name}</div>
                  <div className="text-xs text-gray-500">{meta.subtitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-pink-600 font-bold text-lg leading-5">{it.bookings}</div>
                <div className="text-[11px] text-gray-500">bookings</div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-8">No data yet</div>
        )}
      </div>
    </div>
  );
}
