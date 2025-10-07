'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Eye,
  TrendingUp,
  AlertTriangle
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
import NotificationDialog from '@/components/generalUI/NotificationDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";

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

  // Dialog states
  const [notification, setNotification] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    description: ''
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    refundId: string;
    action: 'single' | 'bulk';
  }>({
    open: false,
    refundId: '',
    action: 'single'
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

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, description: string) => {
    setNotification({
      open: true,
      type,
      title,
      description
    });
  };

  const showConfirmDialog = (refundId: string, action: 'single' | 'bulk') => {
    setConfirmDialog({
      open: true,
      refundId,
      action
    });
  };

  const handleProcessRefund = async (refundId: string) => {
    setIsProcessing(true);
    try {
      const response = await processRefund(refundId);
      if (response.success) {
        await loadRefunds();
        await loadSummary();
        showNotification('success', 'Refund Processed', 'The refund has been processed successfully.');
      } else {
        showNotification('error', 'Refund Failed', response.message || 'Failed to process refund. Please try again.');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      showNotification('error', 'Refund Failed', 'An error occurred while processing the refund. Please try again.');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, refundId: '', action: 'single' });
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
        showNotification('success', 'Bulk Processing Complete', `Successfully processed ${selectedRefunds.length} refund requests.`);
      } else {
        showNotification('error', 'Bulk Processing Failed', response.message || 'Failed to process refunds. Please try again.');
      }
    } catch (error) {
      console.error('Error bulk processing refunds:', error);
      showNotification('error', 'Bulk Processing Failed', 'An error occurred while processing refunds. Please try again.');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, refundId: '', action: 'bulk' });
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'single') {
      handleProcessRefund(confirmDialog.refundId);
    } else if (confirmDialog.action === 'bulk') {
      handleBulkProcess();
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
              title="filter by status"
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
                title="date"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                title="date"
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
                onClick={() => showConfirmDialog('', 'bulk')}
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
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead className="bg-orange-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                    type="checkbox" 
                    title="Select all refunds"
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedRefunds.length === refunds.filter(r => r.status === 'PENDING_REFUND').length}
                  />
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-2 py-3">
                    <input 
                      type="checkbox" 
                      title={`Select refund ${refund._id.slice(-8)}`}
                      className="rounded border-gray-300"
                      checked={selectedRefunds.includes(refund._id)}
                      onChange={() => toggleSelection(refund._id)}
                      disabled={refund.status !== 'PENDING_REFUND'}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs font-medium text-gray-900 truncate">#{refund._id.slice(-8)}</div>
                    <div className="text-xs text-gray-500 truncate">Orig: {refund.originalTransactionId.slice(-8)}</div>
                    <div className="text-xs text-gray-400 truncate">{refund.refundReason}</div>
                    {refund.notes && (
                      <div className="text-xs text-orange-600 truncate">{refund.notes}</div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-900 truncate">{refund.customerName}</div>
                        <div className="text-xs text-gray-500 truncate">{refund.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs font-medium text-gray-900 truncate">{refund.bookingId.slice(-8)}</div>
                    <div className="text-xs text-gray-500 truncate">with {refund.muaName}</div>
                    {refund.serviceName && (
                      <div className="text-xs text-gray-400 truncate">{refund.serviceName}</div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs font-medium text-gray-900">{formatCurrency(refund.refundAmount)}</div>
                    <div className="text-xs text-gray-500">
                      Orig: {formatCurrency(refund.originalAmount)}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    {getRefundMethodBadge(refund.refundMethod)}
                  </td>
                  <td className="px-2 py-3">
                    {getStatusBadge(refund.status)}
                  </td>
                  <td className="px-2 py-3 text-xs text-gray-500">
                    <div className="truncate">
                      Req: {formatDate(refund.requestedAt)}
                      {refund.processedAt && (
                        <div className="text-xs text-gray-400 truncate">
                          Proc: {formatDate(refund.processedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs font-medium">
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center gap-1 text-orange-600 hover:text-orange-900 transition-colors text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {refund.status === 'PENDING_REFUND' && (
                        <button 
                          onClick={() => showConfirmDialog(refund._id, 'single')}
                          disabled={isProcessing}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {isProcessing ? 'Processing...' : 'Approve'}
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <DialogTitle>
                {confirmDialog.action === 'bulk' ? 'Confirm Bulk Refund Processing' : 'Confirm Refund Processing'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {confirmDialog.action === 'bulk' 
                ? `Are you sure you have transferred all daily collected funds to the expense account before processing these ${selectedRefunds.length} refunds? This action cannot be undone.`
                : 'Are you sure you have transferred all daily collected funds to the expense account before processing this refund? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <strong>Important Notice:</strong> Please ensure that all daily collected funds have been fully transferred from the collection account to the expense account before processing refunds.
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, refundId: '', action: 'single' })}
              disabled={isProcessing}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>
                    {confirmDialog.action === 'bulk' 
                      ? `Process ${selectedRefunds.length} Refunds` 
                      : 'Process Refund'
                    }
                  </span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification(prev => ({ ...prev, open }))}
        type={notification.type}
        title={notification.title}
        description={notification.description}
      />
    </div>
  );
};

export default RefundManagementNew;