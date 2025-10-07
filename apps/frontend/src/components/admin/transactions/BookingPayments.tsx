'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Briefcase,
  RefreshCw
} from 'lucide-react';
import {
  getTransactions,
  capturePayment
} from '@/services/admin.transaction';
import { processRefund } from '@/services/admin.refund';
import type {
  AdminTransactionResponseDTO,
  AdminTransactionQueryDTO
} from '@/types/admin.transaction.dto';
import NotificationDialog from '@/components/generalUI/NotificationDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";

const BookingPayments: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'HOLD' | 'PENDING_REFUND' | 'CAPTURED' | 'REFUNDED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState<AdminTransactionResponseDTO[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
    transactionId: string;
    action: 'refund' | 'capture';
  }>({
    open: false,
    transactionId: '',
    action: 'refund'
  });

  // Load data from API
  useEffect(() => {
    loadTransactions();
  }, [currentPage, filter, searchTerm, dateRange]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const filters: AdminTransactionQueryDTO = {
        page: currentPage,
        pageSize,
        status: filter !== 'all' ? filter : undefined,
        customerName: searchTerm || undefined,
        fromDate: dateRange.from || undefined,
        toDate: dateRange.to || undefined
      };

      const response = await getTransactions(filters);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalTransactions(response.data.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      HOLD: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Hold' },
      PENDING_REFUND: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Pending Refund' },
      CAPTURED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Captured' },
      REFUNDED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Refunded' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.HOLD;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
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

  const showConfirmDialog = (transactionId: string, action: 'refund' | 'capture') => {
    setConfirmDialog({
      open: true,
      transactionId,
      action
    });
  };

  const handleProcessRefund = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      const response = await processRefund(transactionId);
      if (response.success) {
        await loadTransactions();
        showNotification('success', 'Refund Processed', 'The refund has been processed successfully.');
      } else {
        showNotification('error', 'Refund Failed', response.message || 'Failed to process refund. Please try again.');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      showNotification('error', 'Refund Failed', 'An error occurred while processing the refund. Please try again.');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, transactionId: '', action: 'refund' });
    }
  };

  const handleCapturePayment = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      const response = await capturePayment(transactionId);
      if (response.success) {
        await loadTransactions();
        showNotification('success', 'Payment Captured', 'The payment has been captured successfully.');
      } else {
        showNotification('error', 'Capture Failed', response.message || 'Failed to capture payment. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing payment:', error);
      showNotification('error', 'Capture Failed', 'An error occurred while capturing the payment. Please try again.');
    } finally {
      setIsProcessing(false);
      setConfirmDialog({ open: false, transactionId: '', action: 'capture' });
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'refund') {
      handleProcessRefund(confirmDialog.transactionId);
    } else if (confirmDialog.action === 'capture') {
      handleCapturePayment(confirmDialog.transactionId);
    }
  };

  // Summary calculations from actual data
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const capturedAmount = transactions.filter(t => t.status === 'CAPTURED').reduce((sum, t) => sum + t.amount, 0);
  const holdAmount = transactions.filter(t => t.status === 'HOLD').reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = transactions.filter(t => t.status === 'REFUNDED').reduce((sum, t) => sum + t.amount, 0);
  const pendingRefundAmount = transactions.filter(t => t.status === 'PENDING_REFUND').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Booking Transactions</h1>
        <p className="text-rose-100 text-lg">Manage payment transactions for beauty service bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{transactions.length} transactions</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Captured</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(capturedAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{transactions.filter(t => t.status === 'CAPTURED').length} payments</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">On Hold</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(holdAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">{transactions.filter(t => t.status === 'HOLD').length} pending</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Refunds</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(refundedAmount + pendingRefundAmount)}</p>
              <div className="flex items-center gap-2 mt-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-600">{transactions.filter(t => t.status === 'REFUNDED' || t.status === 'PENDING_REFUND').length} refunds</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by customer name, booking ID, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[300px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
              title="Filter"
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="HOLD">Hold</option>
                <option value="CAPTURED">Captured</option>
                <option value="PENDING_REFUND">Pending Refund</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                <input
                title="Date"
                placeholder="Date"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <span className="text-gray-500 self-center">to</span>
                <input
                title="Date"
                placeholder="Date"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
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
            Booking Transactions ({totalTransactions} total)
            {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-rose-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">MUA & Service</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-rose-50 transition-colors">
                  <td className="px-2 py-3">
                    <div className="text-xs font-medium text-gray-900 truncate">#{transaction._id.slice(-8)}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {transaction.paymentReference && `Ref: ${transaction.paymentReference.slice(-8)}`}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      Book: {transaction.bookingId.slice(-8)}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-900 truncate">{transaction.customerName}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {transaction.customerEmail}
                        </div>
                        {transaction.customerPhone && (
                          <div className="text-xs text-gray-500 truncate">
                            {transaction.customerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs font-medium text-gray-900 truncate">{transaction.muaName}</div>
                    <div className="text-xs text-gray-500 truncate">{transaction.serviceName}</div>
                    <div className="text-xs text-gray-400 truncate">{transaction.serviceCategory}</div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs text-gray-900 truncate">
                      {formatDate(transaction.bookingDate)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {transaction.bookingStatus}
                    </div>
                    {transaction.bookingAddress && (
                      <div className="text-xs text-gray-400 truncate">
                        {transaction.bookingAddress.length > 20 
                          ? transaction.bookingAddress.substring(0, 20) + '...' 
                          : transaction.bookingAddress}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs font-semibold text-gray-900">{formatCurrency(transaction.amount)}</div>
                    <div className="text-xs text-gray-500">{transaction.paymentMethod || 'Card'}</div>
                    <div className="text-xs text-gray-400">{transaction.currency}</div>
                  </td>
                  <td className="px-2 py-3">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-xs text-gray-900">{formatDate(transaction.createdAt)}</div>
                    {transaction.updatedAt !== transaction.createdAt && (
                      <div className="text-xs text-gray-500">
                        Updated: {formatDate(transaction.updatedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center gap-1 text-rose-600 hover:text-rose-900 transition-colors text-xs">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {transaction.status === 'HOLD' && (
                        <button 
                          onClick={() => showConfirmDialog(transaction._id, 'capture')}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Capture
                        </button>
                      )}
                      
                      {transaction.status === 'PENDING_REFUND' && (
                        <button 
                          onClick={() => showConfirmDialog(transaction._id, 'refund')}
                          disabled={isProcessing}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors text-xs disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions} results
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
                {confirmDialog.action === 'refund' ? 'Confirm Refund Processing' : 'Confirm Payment Capture'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {confirmDialog.action === 'refund' 
                ? 'Are you sure you have transferred all daily collected funds to the expense account before processing this refund? This action cannot be undone.'
                : 'Are you sure you want to capture this payment? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {confirmDialog.action === 'refund' && (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <strong>Important Notice:</strong> Please ensure that all daily collected funds have been fully transferred from the collection account to the expense account before processing the refund.
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, transactionId: '', action: 'refund' })}
              disabled={isProcessing}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={`px-4 py-2 space-x-2 ${
                confirmDialog.action === 'refund' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {confirmDialog.action === 'refund' ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Process Refund</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Capture Payment</span>
                    </>
                  )}
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

export default BookingPayments;