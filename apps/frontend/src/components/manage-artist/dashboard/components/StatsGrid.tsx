import { TrendingUp, Calendar, AlertCircle, Users } from 'lucide-react';
import type { MuaDashboardSummary } from '@/services/dashboard';

interface StatsGridProps {
  stats: MuaDashboardSummary;
  formatCurrency: (amount: number) => string;
  formatPercent: (value: number) => string;
  percentColor: (value: number) => string;
}

export default function StatsGrid({ stats, formatCurrency, formatPercent, percentColor }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Monthly Revenue</h3>
          <Calendar className="text-pink-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${percentColor(stats.revenueGrowthPercent)}`}>
          <TrendingUp size={14} />
          {formatPercent(stats.revenueGrowthPercent)} vs last month
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Total Bookings This Month</h3>
          <Calendar className="text-blue-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{stats.monthlyBookings}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${percentColor(stats.bookingsGrowthPercent)}`}>
          <TrendingUp size={14} />
          {formatPercent(stats.bookingsGrowthPercent)} vs last month
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">Pending Bookings</h3>
          <AlertCircle className="text-orange-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
        <div className="text-sm text-orange-600 mt-1">Requires attention</div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-gray-600">New Customers</h3>
          <Users className="text-purple-500" size={20} />
        </div>
        <div className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${percentColor(stats.customersGrowthPercent)}`}>
          <TrendingUp size={14} />
          {formatPercent(stats.customersGrowthPercent)} this month
        </div>
      </div>
    </div>
  );
}
