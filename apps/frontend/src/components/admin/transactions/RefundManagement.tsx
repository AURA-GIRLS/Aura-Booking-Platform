'use client';

import React, { useState } from 'react';
import { 
  RefreshCw, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  ArrowLeftRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  User,
  CreditCard
} from 'lucide-react';

interface RefundTransaction {
  id: string;
  originalTransactionId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  muaId: string;
  muaName: string;
  originalAmount: number;
  refundAmount: number;
  refundReason: string;
  status: 'PENDING_REFUND' | 'REFUNDED' | 'REFUND_FAILED';
  requestedAt: string;
  processedAt?: string;
  refundMethod: 'original_payment' | 'bank_transfer' | 'wallet';
  processingFee: number;
  netRefundAmount: number;
  notes?: string;
}

const RefundManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'PENDING_REFUND' | 'REFUNDED' | 'REFUND_FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedRefunds, setSelectedRefunds] = useState<string[]>([]);

  // Mock data - replace with API calls
  const refunds: RefundTransaction[] = [
    {
      id: 'REF001',
      originalTransactionId: 'TXN001',
      bookingId: 'BK001',
      customerId: 'USR001',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      originalAmount: 500000,
      refundAmount: 500000,
      refundReason: 'Service cancelled by customer',
      status: 'PENDING_REFUND',
      requestedAt: '2024-01-16T10:00:00Z',
      refundMethod: 'original_payment',
      processingFee: 0,
      netRefundAmount: 500000,
      notes: 'Customer requested full refund due to scheduling conflict'
    },
    {
      id: 'REF002',
      originalTransactionId: 'TXN002',
      bookingId: 'BK002',
      customerId: 'USR002',
      customerName: 'Emily Davis',
      customerEmail: 'emily@example.com',
      muaId: 'MUA002',
      muaName: 'Glam Studio',
      originalAmount: 750000,
      refundAmount: 375000,
      refundReason: 'Partial service completed',
      status: 'REFUNDED',
      requestedAt: '2024-01-15T08:30:00Z',
      processedAt: '2024-01-15T15:20:00Z',
      refundMethod: 'original_payment',
      processingFee: 7500,
      netRefundAmount: 367500
    },
    {
      id: 'REF003',
      originalTransactionId: 'TXN003',
      bookingId: 'BK003',
      customerId: 'USR003',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      muaId: 'MUA003',
      muaName: 'Beauty Pro',
      originalAmount: 300000,
      refundAmount: 300000,
      refundReason: 'Service quality issue',
      status: 'PENDING_REFUND',
      requestedAt: '2024-01-17T14:15:00Z',
      refundMethod: 'bank_transfer',
      processingFee: 15000,
      netRefundAmount: 285000,
      notes: 'Customer complaint - quality not as expected'
    },
    {
      id: 'REF004',
      originalTransactionId: 'TXN004',
      bookingId: 'BK004',
      customerId: 'USR004',
      customerName: 'Jessica Brown',
      customerEmail: 'jessica@example.com',
      muaId: 'MUA004',
      muaName: 'Elegant Makeup',
      originalAmount: 450000,
      refundAmount: 450000,
      refundReason: 'MUA no-show',
      status: 'REFUND_FAILED',
      requestedAt: '2024-01-14T11:45:00Z',
      processedAt: '2024-01-14T16:30:00Z',
      refundMethod: 'original_payment',
      processingFee: 0,
      netRefundAmount: 450000,
      notes: 'Payment method expired - customer needs to provide new details'
    }
  ];

  const getStatusBadge = (status: RefundTransaction['status']) => {
    const statusConfig = {
      PENDING_REFUND: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      REFUNDED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Refunded' },
      REFUND_FAILED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
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

  const getRefundMethodBadge = (method: RefundTransaction['refundMethod']) => {
    const methodConfig = {
      original_payment: { color: 'bg-blue-100 text-blue-800', label: 'Original Payment' },
      bank_transfer: { color: 'bg-purple-100 text-purple-800', label: 'Bank Transfer' },
      wallet: { color: 'bg-green-100 text-green-800', label: 'Wallet' }
    };
    
    const config = methodConfig[method];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesStatus = filter === 'all' || refund.status === filter;
    const matchesSearch = searchTerm === '' || 
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.muaName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleProcessRefund = (refundId: string) => {
    // Process refund logic
    console.log('Processing refund:', refundId);
  };

  const handleRejectRefund = (refundId: string) => {
    // Reject refund logic
    console.log('Rejecting refund:', refundId);
  };

  const handleBulkProcess = () => {
    if (selectedRefunds.length === 0) return;
    console.log('Bulk processing refunds:', selectedRefunds);
    setSelectedRefunds([]);
  };

  const toggleSelection = (refundId: string) => {
    setSelectedRefunds(prev => 
      prev.includes(refundId) 
        ? prev.filter(id => id !== refundId)
        : [...prev, refundId]
    );
  };

  const selectAll = () => {
    const pendingRefunds = filteredRefunds
      .filter(r => r.status === 'PENDING_REFUND')
      .map(r => r.id);
    setSelectedRefunds(pendingRefunds);
  };

  // Summary calculations
  const totalAmount = filteredRefunds.reduce((sum, r) => sum + r.refundAmount, 0);
  const refundedAmount = filteredRefunds.filter(r => r.status === 'REFUNDED').reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingAmount = filteredRefunds.filter(r => r.status === 'PENDING_REFUND').reduce((sum, r) => sum + r.refundAmount, 0);
  const failedAmount = filteredRefunds.filter(r => r.status === 'REFUND_FAILED').reduce((sum, r) => sum + r.refundAmount, 0);

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Refund Management</h1>
        <p className="text-orange-100 text-lg">Process and manage customer refund requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(refundedAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(failedAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by customer, booking ID, refund ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING_REFUND">Pending</option>
                <option value="REFUNDED">Refunded</option>
                <option value="REFUND_FAILED">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedRefunds.length > 0 && (
              <button 
                onClick={handleBulkProcess}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
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
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Refund Requests ({filteredRefunds.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedRefunds.length === filteredRefunds.filter(r => r.status === 'PENDING_REFUND').length}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRefunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedRefunds.includes(refund.id)}
                      onChange={() => toggleSelection(refund.id)}
                      disabled={refund.status !== 'PENDING_REFUND'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.id}</div>
                      <div className="text-sm text-gray-500">Original: {refund.originalTransactionId}</div>
                      <div className="text-xs text-gray-400 mt-1">{refund.refundReason}</div>
                      {refund.notes && (
                        <div className="text-xs text-orange-600 mt-1">{refund.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.bookingId}</div>
                      <div className="text-sm text-gray-500">with {refund.muaName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(refund.refundAmount)}</div>
                      <div className="text-xs text-gray-500">
                        Original: {formatCurrency(refund.originalAmount)}
                      </div>
                      {refund.processingFee > 0 && (
                        <div className="text-xs text-red-600">
                          Fee: {formatCurrency(refund.processingFee)}
                        </div>
                      )}
                      <div className="text-xs font-medium text-green-600">
                        Net: {formatCurrency(refund.netRefundAmount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRefundMethodBadge(refund.refundMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(refund.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Requested: {formatDate(refund.requestedAt)}</div>
                      {refund.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(refund.processedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {refund.status === 'PENDING_REFUND' && (
                        <>
                          <button 
                            onClick={() => handleProcessRefund(refund.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Process
                          </button>
                          <button 
                            onClick={() => handleRejectRefund(refund.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
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
      </div>
    </div>
  );
};

export default RefundManagement;