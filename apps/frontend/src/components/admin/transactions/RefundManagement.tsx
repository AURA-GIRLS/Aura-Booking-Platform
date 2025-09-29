'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Eye,
  AlertTriangle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import {
  getRefunds,
  getRefundSummary,
  processRefund,
  bulkProcessRefunds
} from '@/services/admin.refund';
import type {
  AdminRefundResponseDTO,
  AdminRefundQueryDTO,
  RefundSummaryDTO
} from '@/types/admin.refund.dto';
import { PAYMENT_METHODS } from '@/constants/index';

const RefundManagementNew: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'PENDING_REFUND' | 'REFUNDED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data states
  const [refunds, setRefunds] = useState<AdminRefundResponseDTO[]>([]);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<RefundSummaryDTO>({
    totalRefunds: 0,
    totalRefundAmount: 0,
    byStatus: {
      PENDING_REFUND: { count: 0, amount: 0 },
      REFUNDED: { count: 0, amount: 0 }
    }
  });

  // Load data from API
  useEffect(() => {
    loadRefunds();
    loadSummary();
  }, [currentPage, filter, searchTerm, dateRange]);

  const loadRefunds = async () => {
    setIsLoading(true);
    try {
      const filters: AdminRefundQueryDTO = {
        page: currentPage,
        pageSize,
        status: filter !== 'all' ? filter : undefined,
        customerName: searchTerm || undefined,
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      };

      const response = await getRefunds(filters);
      if (response.success && response.data) {
        setRefunds(response.data.refunds);
        setTotalRefunds(response.data.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load refunds:', error);
      setRefunds([]);
      setTotalRefunds(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await getRefundSummary({
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      });
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load refund summary:', error);
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

  const getStatusBadge = (status: AdminRefundResponseDTO['status']) => {
    const statusConfig = {
      PENDING_REFUND: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      REFUNDED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Refunded' }
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

  const getRefundMethodBadge = (method: AdminRefundResponseDTO['refundMethod']) => {
    const methodConfig: Record<string, { color: string; label: string }> = {
      "BANK_TRANSFER": { color: 'bg-purple-100 text-purple-800', label: 'Bank Transfer' },
      "WALLET": { color: 'bg-blue-100 text-blue-800', label: 'Wallet' },
      "ORIGINAL_PAYMENT": { color: 'bg-green-100 text-green-800', label: 'Original Payment' },
      "bank_transfer": { color: 'bg-purple-100 text-purple-800', label: 'Bank Transfer' },
      "wallet": { color: 'bg-blue-100 text-blue-800', label: 'Wallet' },
      "original_payment": { color: 'bg-green-100 text-green-800', label: 'Original Payment' },
    };

    const config = methodConfig[method] || { color: 'bg-gray-100 text-gray-800', label: method };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleProcessRefund = async (refundId: string) => {
    setIsProcessing(true);
    try {
      const response = await processRefund(refundId);
      if (response.success) {
        await loadRefunds();
        await loadSummary();
      } else {
        alert(`Failed to process refund: ${response.message}`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkProcess = async () => {
    if (selectedRefunds.length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await bulkProcessRefunds(selectedRefunds);
      if (response.success) {
        await loadRefunds();
        await loadSummary();
        setSelectedRefunds([]);
      } else {
        alert(`Bulk processing failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Error bulk processing refunds:', error);
      alert('Failed to bulk process refunds');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelection = (refundId: string) => {
    setSelectedRefunds(prev => 
      prev.includes(refundId) 
        ? prev.filter(id => id !== refundId)
        : [...prev, refundId]
    );
  };

  const selectAll = () => {
    const pendingRefunds = refunds
      .filter(r => r.status === 'PENDING_REFUND')
      .map(r => r._id);
    setSelectedRefunds(pendingRefunds);
  };

  return (
    <div className="p-6 space-y-6 bg-orange-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Refund Management</h1>
        <p className="text-orange-100 text-lg">Process and manage customer refund requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRefundAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{summary.totalRefunds} requests</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.byStatus.REFUNDED.amount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{summary.byStatus.REFUNDED.count} refunds</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.byStatus.PENDING_REFUND.amount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">{summary.byStatus.PENDING_REFUND.count} pending</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by customer, booking ID, refund ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[300px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING_REFUND">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedRefunds.length > 0 && (
              <button 
                onClick={handleBulkProcess}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Bulk Process ({selectedRefunds.length})
              </button>
            )}
            
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Refund Requests ({totalRefunds} total)
            {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </h3>
          <button
            onClick={selectAll}
            className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
          >
            Select All Pending
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedRefunds.length === refunds.filter(r => r.status === 'PENDING_REFUND').length}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedRefunds.includes(refund._id)}
                      onChange={() => toggleSelection(refund._id)}
                      disabled={refund.status !== 'PENDING_REFUND'}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{refund._id.slice(-8)}</div>
                      <div className="text-sm text-gray-500">Original: {refund.originalTransactionId.slice(-8)}</div>
                      <div className="text-xs text-gray-400 mt-1">{refund.refundReason}</div>
                      {refund.notes && (
                        <div className="text-xs text-orange-600 mt-1">{refund.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{refund.customerName}</div>
                        <div className="text-sm text-gray-500">{refund.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.bookingId.slice(-8)}</div>
                      <div className="text-sm text-gray-500">with {refund.muaName}</div>
                      {refund.serviceName && (
                        <div className="text-xs text-gray-400">{refund.serviceName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(refund.refundAmount)}</div>
                      <div className="text-xs text-gray-500">
                        Original: {formatCurrency(refund.originalAmount)}
                      </div>
                      {/* {refund.processingFee > 0 && (
                        <div className="text-xs text-red-500">
                          Fee: -{formatCurrency(refund.processingFee)}
                        </div>
                      )}
                      <div className="text-xs font-medium text-green-600">
                        Net: {formatCurrency(refund.netRefundAmount)}
                      </div> */}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getRefundMethodBadge(refund.refundMethod)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(refund.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      Requested: {formatDate(refund.requestedAt)}
                      {refund.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(refund.processedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-orange-600 hover:text-orange-900 transition-colors text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {refund.status === 'PENDING_REFUND' && (
                        <button 
                          onClick={() => handleProcessRefund(refund._id)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRefunds)} of {totalRefunds} results
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

export default RefundManagementNew;