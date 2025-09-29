'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  getTransactions,
  getWithdrawals,
  getTransactionSummary,
  getPayouts
} from '@/services/admin.transaction';
import type {
  AdminTransactionResponseDTO,
  AdminWithdrawResponseDTO,
  TransactionSummaryDTO,
  AdminTransactionQueryDTO,
  AdminWithdrawQueryDTO
} from '@/types/admin.transaction.dto';

const TransactionOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdrawals'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState<AdminTransactionResponseDTO[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawResponseDTO[]>([]);
  const [summary, setSummary] = useState<TransactionSummaryDTO | null>(null);
  
  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  
  // Filter states
  const [transactionFilter, setTransactionFilter] = useState<AdminTransactionQueryDTO>({});
  const [withdrawalFilter, setWithdrawalFilter] = useState<AdminWithdrawQueryDTO>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [activeTab, transactionPage, withdrawalPage, transactionFilter, withdrawalFilter,statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            loadSummary(),
            loadRecentTransactions(),
            loadRecentWithdrawals()
          ]);
          break;
        case 'transactions':
          await loadTransactions();
          break;
        case 'withdrawals':
          await loadWithdrawals();
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await getTransactionSummary({
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      });
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const filters: AdminTransactionQueryDTO = {
        page: transactionPage,
        pageSize,
        ...transactionFilter,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        customerName: searchTerm || undefined
      };

      const response = await getTransactions(filters);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalTransactions(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const response = await getTransactions({ page: 1, pageSize: 5 });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to load recent transactions:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const filters: AdminWithdrawQueryDTO = {
        page: withdrawalPage,
        pageSize,
        ...withdrawalFilter,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        muaName: searchTerm || undefined
      };

      const response = await getWithdrawals(filters);
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals);
        setTotalWithdrawals(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      setWithdrawals([]);
      setTotalWithdrawals(0);
    }
  };

  const loadRecentWithdrawals = async () => {
    try {
      const response = await getWithdrawals({ page: 1, pageSize: 5 });
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      console.error('Failed to load recent withdrawals:', error);
    }
  };

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusConfig = {
      HOLD: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Hold', icon: Clock },
      PENDING_REFUND: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending Refund', icon: AlertTriangle },
      CAPTURED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Captured', icon: CheckCircle },
      REFUNDED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refunded', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.HOLD;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getWithdrawalStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: Clock },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing', icon: RefreshCw },
      SUCCESS: { bg: 'bg-green-100', text: 'text-green-800', label: 'Success', icon: CheckCircle },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Use real statistics from API or fallback values
  const stats = summary || {
    transactions: {
      total: 0, totalAmount: 0,
      byStatus: { HOLD: 0, CAPTURED: 0, PENDING_REFUND: 0, REFUNDED: 0 },
      amountByStatus: { HOLD: 0, CAPTURED: 0, PENDING_REFUND: 0, REFUNDED: 0 }
    },
    withdrawals: {
      total: 0, totalAmount: 0,
      byStatus: { PENDING: 0, PROCESSING: 0, SUCCESS: 0, FAILED: 0 },
      amountByStatus: { PENDING: 0, PROCESSING: 0, SUCCESS: 0, FAILED: 0 }
    },
    summary: {
      totalRevenue: 0, totalWithdrawn: 0, platformBalance: 0,
      pendingPayouts: 0, refundsPending: 0
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.summary.totalRevenue)}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Captured Payments</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Withdrawn</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.summary.totalWithdrawn)}</p>
              <div className="flex items-center gap-2 mt-2">
                <ArrowDownRight className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Successful Payouts</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending Refunds</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.summary.refundsPending)}</p>
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">{stats.transactions.byStatus.PENDING_REFUND} requests</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending Payouts</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.summary.pendingPayouts)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">{stats.withdrawals.byStatus.PENDING + stats.withdrawals.byStatus.PROCESSING} pending</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-600" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.customerName}</div>
                    <div className="text-sm text-gray-500">{transaction.serviceName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</div>
                  <div className="text-xs">{getTransactionStatusBadge(transaction.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Transaction Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium text-green-900">Captured</span>
              <div className="text-right">
                <span className="font-bold text-green-900">{stats.transactions.byStatus.CAPTURED}</span>
                <div className="text-green-600 text-xs">{formatCurrency(stats.transactions.amountByStatus.CAPTURED)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <span className="text-sm font-medium text-yellow-900">Hold</span>
              <div className="text-right">
                <span className="font-bold text-yellow-900">{stats.transactions.byStatus.HOLD}</span>
                <div className="text-yellow-600 text-xs">{formatCurrency(stats.transactions.amountByStatus.HOLD)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
              <span className="text-sm font-medium text-orange-900">Pending Refund</span>
              <div className="text-right">
                <span className="font-bold text-orange-900">{stats.transactions.byStatus.PENDING_REFUND}</span>
                <div className="text-orange-600 text-xs">{formatCurrency(stats.transactions.amountByStatus.PENDING_REFUND)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <span className="text-sm font-medium text-red-900">Refunded</span>
              <div className="text-right">
                <span className="font-bold text-red-900">{stats.transactions.byStatus.REFUNDED}</span>
                <div className="text-red-600 text-xs">{formatCurrency(stats.transactions.amountByStatus.REFUNDED)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Recent Withdrawals
          </h3>
          <div className="space-y-3">
            {withdrawals.slice(0, 5).map((withdrawal) => (
              <div key={withdrawal._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{withdrawal.muaName}</div>
                    <div className="text-sm text-gray-500">{withdrawal.bankInfo?.bankName || 'Bank'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                  <div className="text-xs">{getWithdrawalStatusBadge(withdrawal.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            Withdrawal Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium text-green-900">Success</span>
              <div className="text-right">
                <span className="font-bold text-green-900">{stats.withdrawals.byStatus.SUCCESS}</span>
                <div className="text-green-600 text-xs">{formatCurrency(stats.withdrawals.amountByStatus.SUCCESS)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <span className="text-sm font-medium text-yellow-900">Pending</span>
              <div className="text-right">
                <span className="font-bold text-yellow-900">{stats.withdrawals.byStatus.PENDING}</span>
                <div className="text-yellow-600 text-xs">{formatCurrency(stats.withdrawals.amountByStatus.PENDING)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <span className="text-sm font-medium text-blue-900">Processing</span>
              <div className="text-right">
                <span className="font-bold text-blue-900">{stats.withdrawals.byStatus.PROCESSING}</span>
                <div className="text-blue-600 text-xs">{formatCurrency(stats.withdrawals.amountByStatus.PROCESSING)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <span className="text-sm font-medium text-red-900">Failed</span>
              <div className="text-right">
                <span className="font-bold text-red-900">{stats.withdrawals.byStatus.FAILED}</span>
                <div className="text-red-600 text-xs">{formatCurrency(stats.withdrawals.amountByStatus.FAILED)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by customer, MUA, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="HOLD">Hold</option>
                <option value="CAPTURED">Captured</option>
                <option value="PENDING_REFUND">Pending Refund</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Transactions ({totalTransactions} total)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-rose-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MUA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-rose-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{transaction._id.slice(-8)}</div>
                    <div className="text-xs text-gray-500">Booking: {transaction.bookingId.slice(-8)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                    <div className="text-xs text-gray-500">{transaction.customerEmail}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.muaName}</div>
                    <div className="text-xs text-gray-500">{transaction.muaEmail}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.serviceName}</div>
                    <div className="text-xs text-gray-500">{transaction.serviceCategory}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                    <div className="text-xs text-gray-500">{transaction.paymentMethod}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getTransactionStatusBadge(transaction.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="flex items-center gap-1 text-rose-600 hover:text-rose-900 transition-colors">
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const WithdrawalsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by MUA name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
          
          <button className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Withdrawals ({totalWithdrawals} total)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-rose-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MUA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-rose-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{withdrawal._id.slice(-8)}</div>
                    <div className="text-xs text-gray-500">Ref: {withdrawal.reference}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{withdrawal.muaName}</div>
                    <div className="text-xs text-gray-500">{withdrawal.muaEmail}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {withdrawal.bankInfo ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{withdrawal.bankInfo.bankName}</div>
                        <div className="text-xs text-gray-500">{withdrawal.bankInfo.accountNumber}</div>
                        <div className="text-xs text-gray-500">{withdrawal.bankInfo.accountName}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No bank info</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                    <div className="text-xs text-gray-500">{withdrawal.currency}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getWithdrawalStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(withdrawal.requestedAt)}</div>
                    {withdrawal.processedAt && withdrawal.processedAt !== withdrawal.requestedAt && (
                      <div className="text-xs">Processed: {formatDate(withdrawal.processedAt)}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="flex items-center gap-1 text-rose-600 hover:text-rose-900 transition-colors">
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
        <p className="text-rose-100 text-lg">Manage transactions, withdrawals, and financial operations</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'transactions' && <TransactionsTab />}
            {activeTab === 'withdrawals' && <WithdrawalsTab />}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionOverview;