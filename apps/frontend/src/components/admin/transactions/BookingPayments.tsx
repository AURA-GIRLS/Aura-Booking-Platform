'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';

interface BookingTransaction {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  muaId: string;
  muaName: string;
  serviceType: string;
  amount: number;
  status: 'HOLD' | 'PENDING_REFUND' | 'CAPTURED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  refundReason?: string;
}

const BookingPayments: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'HOLD' | 'PENDING_REFUND' | 'CAPTURED' | 'REFUNDED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Mock data - replace with API calls
  const transactions: BookingTransaction[] = [
    {
      id: 'TXN001',
      bookingId: 'BK001',
      customerId: 'USR001',
      customerName: 'Alice Johnson',
      customerEmail: 'alice@example.com',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      serviceType: 'Bridal Makeup',
      amount: 1500000,
      status: 'CAPTURED',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'TXN002',
      bookingId: 'BK002',
      customerId: 'USR002',
      customerName: 'Emily Davis',
      customerEmail: 'emily@example.com',
      muaId: 'MUA002',
      muaName: 'Glam Studio',
      serviceType: 'Party Makeup',
      amount: 800000,
      status: 'HOLD',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'TXN003',
      bookingId: 'BK003',
      customerId: 'USR003',
      customerName: 'Jessica Brown',
      customerEmail: 'jessica@example.com',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      serviceType: 'Photoshoot Makeup',
      amount: 600000,
      status: 'PENDING_REFUND',
      createdAt: '2024-01-14T09:15:00Z',
      updatedAt: '2024-01-17T16:45:00Z',
      paymentMethod: 'E-wallet',
      refundReason: 'Service cancelled by customer'
    },
    {
      id: 'TXN004',
      bookingId: 'BK004',
      customerId: 'USR004',
      customerName: 'Maria Garcia',
      customerEmail: 'maria@example.com',
      muaId: 'MUA003',
      muaName: 'Beauty Pro',
      serviceType: 'Event Makeup',
      amount: 1200000,
      status: 'REFUNDED',
      createdAt: '2024-01-13T16:30:00Z',
      updatedAt: '2024-01-18T10:15:00Z',
      paymentMethod: 'Credit Card',
      refundReason: 'MUA unavailable'
    }
  ];

  const getStatusBadge = (status: BookingTransaction['status']) => {
    const statusConfig = {
      HOLD: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Hold' },
      PENDING_REFUND: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Pending Refund' },
      CAPTURED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Captured' },
      REFUNDED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Refunded' }
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filter === 'all' || transaction.status === filter;
    const matchesSearch = searchTerm === '' || 
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.muaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleProcessRefund = (transactionId: string) => {
    // Process refund logic
    console.log('Processing refund for:', transactionId);
  };

  const handleCapturePayment = (transactionId: string) => {
    // Capture payment logic
    console.log('Capturing payment for:', transactionId);
  };

  // Summary calculations
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const capturedAmount = filteredTransactions.filter(t => t.status === 'CAPTURED').reduce((sum, t) => sum + t.amount, 0);
  const holdAmount = filteredTransactions.filter(t => t.status === 'HOLD').reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = filteredTransactions.filter(t => t.status === 'REFUNDED').reduce((sum, t) => sum + t.amount, 0);

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
              <p className="text-gray-600 text-sm font-medium mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Captured</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(capturedAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">On Hold</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(holdAmount)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Refunded</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(refundedAmount)}</p>
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
                placeholder="Search by customer, MUA, booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="HOLD">Hold</option>
                <option value="PENDING_REFUND">Pending Refund</option>
                <option value="CAPTURED">Captured</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
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
            Booking Transactions ({filteredTransactions.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-rose-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MUA & Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-rose-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                      <div className="text-sm text-gray-500">Booking #{transaction.bookingId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                      <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{transaction.muaName}</div>
                      <div className="text-sm text-gray-500">{transaction.serviceType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{formatDate(transaction.createdAt)}</div>
                      {transaction.status !== 'HOLD' && (
                        <div className="text-xs text-gray-400">
                          Updated: {formatDate(transaction.updatedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-rose-600 hover:text-rose-900 transition-colors">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {transaction.status === 'HOLD' && (
                        <button 
                          onClick={() => handleCapturePayment(transaction.id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Capture
                        </button>
                      )}
                      {transaction.status === 'PENDING_REFUND' && (
                        <button 
                          onClick={() => handleProcessRefund(transaction.id)}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-900 transition-colors"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                          Process
                        </button>
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

export default BookingPayments;