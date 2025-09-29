'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Eye,
  Building,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  getWithdrawals,
  getWithdrawalSummary,
  processWithdrawal,
  rejectWithdrawal,
  bulkProcessWithdrawals
} from '@/services/admin.withdrawal';
import type {
  AdminWithdrawalResponseDTO,
  AdminWithdrawalQueryDTO,
  WithdrawalSummaryDTO
} from '@/types/admin.withdrawal.dto';

const WithdrawalManagementNew: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data states
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalResponseDTO[]>([]);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<WithdrawalSummaryDTO>({
    totalWithdrawals: 0,
    totalWithdrawalAmount: 0,
    byStatus: {
      PENDING: { count: 0, amount: 0 },
      PROCESSING: { count: 0, amount: 0 },
      SUCCESS: { count: 0, amount: 0 },
      FAILED: { count: 0, amount: 0 }
    }
  });

  // Load data from API
  useEffect(() => {
    loadWithdrawals();
    loadSummary();
  }, [currentPage, filter, searchTerm, dateRange]);

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const filters: AdminWithdrawalQueryDTO = {
        page: currentPage,
        pageSize,
        status: filter !== 'all' ? filter : undefined,
        muaName: searchTerm || undefined,
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      };

      const response = await getWithdrawals(filters);
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals);
        setTotalWithdrawals(response.data.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      setWithdrawals([]);
      setTotalWithdrawals(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await getWithdrawalSummary({
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      });
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load withdrawal summary:', error);
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

  const getStatusBadge = (status: AdminWithdrawalResponseDTO['status']) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      PROCESSING: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertTriangle, label: 'Processing' },
      SUCCESS: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Success' },
      FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    setIsProcessing(true);
    try {
      const response = await processWithdrawal(withdrawalId);
      if (response.success) {
        await loadWithdrawals();
        await loadSummary();
      } else {
        alert(`Failed to approve withdrawal: ${response.message}`);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Failed to approve withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setIsProcessing(true);
    try {
      const response = await rejectWithdrawal(withdrawalId, reason);
      if (response.success) {
        await loadWithdrawals();
        await loadSummary();
      } else {
        alert(`Failed to reject withdrawal: ${response.message}`);
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Failed to reject withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedWithdrawals.length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await bulkProcessWithdrawals(selectedWithdrawals);
      if (response.success) {
        await loadWithdrawals();
        await loadSummary();
        setSelectedWithdrawals([]);
      } else {
        alert(`Bulk approval failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Error bulk approving withdrawals:', error);
      alert('Failed to bulk approve withdrawals');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelection = (withdrawalId: string) => {
    setSelectedWithdrawals(prev => 
      prev.includes(withdrawalId) 
        ? prev.filter(id => id !== withdrawalId)
        : [...prev, withdrawalId]
    );
  };

  const selectAll = () => {
    const pendingWithdrawals = withdrawals
      .filter(w => w.status === 'PENDING')
      .map(w => w._id);
    setSelectedWithdrawals(pendingWithdrawals);
  };

  return (
    <div className="p-6 space-y-6 bg-blue-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">MUA Withdrawals</h1>
        <p className="text-blue-100 text-lg">Manage withdrawal requests from makeup artists</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalWithdrawalAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{summary.totalWithdrawals} requests</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Success</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.byStatus.SUCCESS.amount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{summary.byStatus.SUCCESS.count} completed</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.byStatus.PENDING.amount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">{summary.byStatus.PENDING.count} pending</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.byStatus.PROCESSING.amount + summary.byStatus.FAILED.amount)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {summary.byStatus.PROCESSING.count + summary.byStatus.FAILED.count} in progress
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by MUA, email, withdrawal ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedWithdrawals.length > 0 && (
              <button 
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Bulk Approve ({selectedWithdrawals.length})
              </button>
            )}
            
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            MUA Withdrawals ({totalWithdrawals} total)
            {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </h3>
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Select All Pending
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedWithdrawals.length === withdrawals.filter(w => w.status === 'PENDING').length}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MUA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedWithdrawals.includes(withdrawal._id)}
                      onChange={() => toggleSelection(withdrawal._id)}
                      disabled={withdrawal.status !== 'PENDING'}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{withdrawal._id.slice(-8)}</div>
                      <div className="text-sm text-gray-500">{withdrawal.transactionIds.length || 0} transactions</div>
                      {withdrawal.reference && (
                        <div className="text-xs text-blue-600 mt-1">Ref: {withdrawal.reference.slice(0,10)}</div>
                      )}
                      {/* {withdrawal.notes && (
                        <div className="text-xs text-blue-600 mt-1">{withdrawal.notes}</div>
                      )} */}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{withdrawal.muaName}</div>
                        <div className="text-sm text-gray-500">{withdrawal.muaEmail}</div>
                        {withdrawal.muaLocation && (
                          <div className="text-xs text-gray-400">{withdrawal.muaLocation}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {withdrawal.bankInfo ? (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{withdrawal.bankInfo.bankName}</div>
                          <div className="text-sm text-gray-500">{withdrawal.bankInfo.accountNumber}</div>
                          <div className="text-xs text-gray-400">{withdrawal.bankInfo.accountName}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No bank info</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                      {/* <div className="text-xs text-gray-500">
                        Fee: {formatCurrency(withdrawal.processingFee)}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        Net: {formatCurrency(withdrawal.netAmount)}
                      </div> */}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Requested: {formatDate(withdrawal.requestedAt)}</div>
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(withdrawal.processedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      {withdrawal.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApproveWithdrawal(withdrawal._id)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalWithdrawals)} of {totalWithdrawals} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalManagementNew;