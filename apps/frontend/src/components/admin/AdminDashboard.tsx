'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

// Import services
import { getUserStatistics, getMUAStatistics } from '@/services/admin.user';
import { getTransactionSummary } from '@/services/admin.transaction';
import { getRefundSummary } from '@/services/admin.refund';
import { getWithdrawalSummary } from '@/services/admin.withdrawal';

// Import types
import type { UserStatisticsDTO, MUAStatisticsDTO } from '@/types/admin.user.dto';
import type { TransactionSummaryDTO } from '@/types/admin.transaction.dto';
import type { RefundSummaryDTO } from '@/types/admin.refund.dto';
import type { WithdrawalSummaryDTO } from '@/types/admin.withdrawal.dto';

interface DashboardData {
  userStats: any | null;
  muaStats: any | null;
  transactionStats: TransactionSummaryDTO | null;
  refundStats: RefundSummaryDTO | null;
  withdrawalStats: WithdrawalSummaryDTO | null;
  loading: boolean;
  error: string | null;
}

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Utility function to format number
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Date range selector component
const DateRangeSelector: React.FC<{
  onDateRangeChange: (fromDate: string, toDate: string) => void;
}> = ({ onDateRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState('7d');

  const ranges = [
    { key: '7d', label: '7 days', days: 7 },
    { key: '30d', label: '30 days', days: 30 },
    { key: '90d', label: '3 months', days: 90 },
    { key: '1y', label: '1 year', days: 365 }
  ];

  const handleRangeSelect = (range: typeof ranges[0]) => {
    setSelectedRange(range.key);
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - range.days);
    
    onDateRangeChange(
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0]
    );
  };

  return (
    <div className="flex items-center gap-2 mb-6">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Time Range:</span>
      {ranges.map((range) => (
        <button
          key={range.key}
          onClick={() => handleRangeSelect(range)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selectedRange === range.key
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

// StatCard component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'|'orange';
}> = ({ title, value, icon, trend, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          {trend.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

// Status breakdown component
const StatusBreakdown: React.FC<{
  title: string;
  data: Record<string, { count: number; amount?: number }>;
  type: 'count' | 'amount';
}> = ({ title, data, type }) => {
  const statusColors: Record<string, string> = {
    ACTIVE: 'text-green-600 bg-green-100',
    INACTIVE: 'text-gray-600 bg-gray-100',
    BANNED: 'text-red-600 bg-red-100',
    PENDING: 'text-yellow-600 bg-yellow-100',
    APPROVED: 'text-green-600 bg-green-100',
    REJECTED: 'text-red-600 bg-red-100',
    HOLD: 'text-yellow-600 bg-yellow-100',
    CAPTURED: 'text-green-600 bg-green-100',
    PENDING_REFUND: 'text-orange-600 bg-orange-100',
    REFUNDED: 'text-blue-600 bg-blue-100',
    PROCESSING: 'text-blue-600 bg-blue-100',
    SUCCESS: 'text-green-600 bg-green-100',
    FAILED: 'text-red-600 bg-red-100'
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    BANNED: 'Banned',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    HOLD: 'Hold',
    CAPTURED: 'Captured',
    PENDING_REFUND: 'Pending Refund',
    REFUNDED: 'Refunded',
    PROCESSING: 'Processing',
    SUCCESS: 'Success',
    FAILED: 'Failed'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([status, info]) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'text-gray-600 bg-gray-100'}`}>
                {statusLabels[status] || status}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatNumber(info.count)}
              </div>
              {type === 'amount' && info.amount !== undefined && (
                <div className="text-sm text-gray-500">
                  {formatCurrency(info.amount)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main AdminDashboard component
const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    userStats: null,
    muaStats: null,
    transactionStats: null,
    refundStats: null,
    withdrawalStats: null,
    loading: true,
    error: null
  });

  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async (fromDate?: string, toDate?: string) => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [userStats, muaStats, transactionStats, refundStats, withdrawalStats] = await Promise.all([
        getUserStatistics(),
        getMUAStatistics(),
        getTransactionSummary({ fromDate, toDate }),
        getRefundSummary({ fromDate, toDate }),
        getWithdrawalSummary({ fromDate, toDate })
      ]);

      setData({
        userStats: userStats.data || null,
        muaStats: muaStats.data || null,
        transactionStats: transactionStats.data || null,
        refundStats: refundStats.data || null,
        withdrawalStats: withdrawalStats.data || null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load dashboard data. Please try again.'
      }));
    }
  };

  useEffect(() => {
    fetchData(dateRange.fromDate, dateRange.toDate);
  }, [dateRange]);

  const handleDateRangeChange = (fromDate: string, toDate: string) => {
    setDateRange({ fromDate, toDate });
  };

  const handleRefresh = () => {
    fetchData(dateRange.fromDate, dateRange.toDate);
  };

  if (data.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Data Loading Error</h3>
          <p className="text-red-600 mb-4">{data.error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { userStats, muaStats, transactionStats, refundStats, withdrawalStats } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and statistics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector onDateRangeChange={handleDateRangeChange} />

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          User Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={userStats?.totalUsers || 0}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={userStats?.byStatus?.ACTIVE?.count || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Banned Users"
            value={userStats?.byStatus?.BANNED?.count || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="New Registrations"
            value={userStats?.newUsersThisMonth || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
            subtitle="this month"
          />
        </div>

        {userStats?.byStatus && (
          <StatusBreakdown
            title="User Status Distribution"
            data={userStats.byStatus}
            type="count"
          />
        )}
      </div>

      {/* MUA Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <UserCheck className="w-5 h-5 mr-2" />
          Makeup Artist Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total MUAs"
            value={muaStats?.totalMUAs || 0}
            icon={<UserCheck className="w-6 h-6" />}
            color="indigo"
          />
          <StatCard
            title="Pending"
            value={muaStats?.byStatus?.PENDING?.count || 0}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Approved"
            value={muaStats?.byStatus?.APPROVED?.count || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={muaStats?.byStatus?.REJECTED?.count || 0}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {muaStats?.byStatus && (
          <StatusBreakdown
            title="MUA Status Distribution"
            data={muaStats.byStatus}
            type="count"
          />
        )}
      </div>

      {/* Transaction Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Transaction Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Transactions"
            value={transactionStats?.transactions?.total || 0}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(transactionStats?.transactions?.totalAmount || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Actual Revenue"
            value={formatCurrency(transactionStats?.summary?.totalRevenue || 0)}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            subtitle="successfully collected"
          />
          <StatCard
            title="Platform Balance"
            value={formatCurrency(transactionStats?.summary?.platformBalance || 0)}
            icon={<BarChart3 className="w-6 h-6" />}
            color="indigo"
          />
        </div>

        {transactionStats?.transactions?.byStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusBreakdown
              title="Transaction Status Distribution"
              data={Object.entries(transactionStats.transactions.byStatus).reduce((acc, [status, count]) => {
                acc[status] = { 
                  count, 
                  amount: transactionStats.transactions?.amountByStatus?.[status as keyof typeof transactionStats.transactions.amountByStatus] || 0 
                };
                return acc;
              }, {} as Record<string, { count: number; amount: number }>)}
              type="amount"
            />
            <StatusBreakdown
              title="Withdrawal Status Distribution"
              data={Object.entries(transactionStats?.withdrawals?.byStatus || {}).reduce((acc, [status, count]) => {
                acc[status] = { 
                  count, 
                  amount: transactionStats.withdrawals?.amountByStatus?.[status as keyof typeof transactionStats.withdrawals.amountByStatus] || 0 
                };
                return acc;
              }, {} as Record<string, { count: number; amount: number }>)}
              type="amount"
            />
          </div>
        )}
      </div>

      {/* Refund Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2" />
          Refund Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Refund Requests"
            value={refundStats?.totalRefunds || 0}
            icon={<RefreshCw className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Total Refunded Amount"
            value={formatCurrency(refundStats?.totalRefundAmount || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Pending Processing"
            value={refundStats?.byStatus?.PENDING_REFUND?.count || 0}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            subtitle={formatCurrency(refundStats?.byStatus?.PENDING_REFUND?.amount || 0)}
          />
        </div>

        {refundStats?.byStatus && (
          <StatusBreakdown
            title="Refund Status Distribution"
            data={refundStats.byStatus}
            type="amount"
          />
        )}
      </div>

      {/* Withdrawal Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingDown className="w-5 h-5 mr-2" />
          Withdrawal Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Withdrawal Requests"
            value={withdrawalStats?.totalWithdrawals || 0}
            icon={<TrendingDown className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Total Withdrawal Amount"
            value={formatCurrency(withdrawalStats?.totalWithdrawalAmount || 0)}
            icon={<DollarSign className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Pending Approval"
            value={withdrawalStats?.byStatus?.PENDING?.count || 0}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            subtitle={formatCurrency(withdrawalStats?.byStatus?.PENDING?.amount || 0)}
          />
          <StatCard
            title="Successful"
            value={withdrawalStats?.byStatus?.SUCCESS?.count || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            subtitle={formatCurrency(withdrawalStats?.byStatus?.SUCCESS?.amount || 0)}
          />
        </div>

        {withdrawalStats?.byStatus && (
          <StatusBreakdown
            title="Withdrawal Status Distribution"
            data={withdrawalStats.byStatus}
            type="amount"
          />
        )}
      </div>

      {/* Summary Cards */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          System Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber((userStats?.totalUsers || 0) + (muaStats?.totalMUAs || 0))}
            </div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(transactionStats?.summary?.totalRevenue || 0)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber((refundStats?.byStatus?.PENDING_REFUND?.count || 0) + (withdrawalStats?.byStatus?.PENDING?.count || 0))}
            </div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(transactionStats?.summary?.platformBalance || 0)}
            </div>
            <div className="text-sm text-gray-600">Platform Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
