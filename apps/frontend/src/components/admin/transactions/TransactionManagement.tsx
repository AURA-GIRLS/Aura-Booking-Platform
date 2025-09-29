'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Filter,
  Download,
  Calendar
} from 'lucide-react';


interface Transaction {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  muaId: string;
  muaName: string;
  amount: number;
  status: 'HOLD' | 'PENDING_REFUND' | 'CAPTURED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

interface Withdrawal {
  id: string;
  muaId: string;
  muaName: string;
  amount: number;
  status: 'PENDING_WITHDRAW' | 'SUCCESS_WITHDRAW' | 'FAILED_WITHDRAW';
  requestedAt: string;
  processedAt?: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}



const TransactionManagement: React.FC = () => {

  // Mock data - replace with API calls
  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      bookingId: 'BK001',
      customerId: 'USR001',
      customerName: 'Alice Johnson',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      amount: 150000,
      status: 'CAPTURED',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    },
    {
      id: 'TXN002',
      bookingId: 'BK002',
      customerId: 'USR002',
      customerName: 'Emily Davis',
      muaId: 'MUA002',
      muaName: 'Glam Studio',
      amount: 200000,
      status: 'HOLD',
      createdAt: '2024-01-16T14:20:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      id: 'TXN003',
      bookingId: 'BK003',
      customerId: 'USR003',
      customerName: 'Jessica Brown',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      amount: 120000,
      status: 'REFUNDED',
      createdAt: '2024-01-14T09:15:00Z',
      updatedAt: '2024-01-17T16:45:00Z'
    }
  ];

  // Mock withdrawal data
  const withdrawals: Withdrawal[] = [
    {
      id: 'WD001',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      amount: 2500000,
      status: 'PENDING_WITHDRAW',
      requestedAt: '2024-01-16T10:00:00Z',
      bankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '****1234',
        accountName: 'Sarah Nguyen'
      }
    },
    {
      id: 'WD002',
      muaId: 'MUA002',
      muaName: 'Glam Studio',
      amount: 1800000,
      status: 'SUCCESS_WITHDRAW',
      requestedAt: '2024-01-15T08:30:00Z',
      processedAt: '2024-01-15T15:20:00Z',
      bankInfo: {
        bankName: 'Techcombank',
        accountNumber: '****5678',
        accountName: 'Glam Studio Co.'
      }
    },
    {
      id: 'WD003',
      muaId: 'MUA003',
      muaName: 'Beauty Pro',
      amount: 3200000,
      status: 'PENDING_WITHDRAW',
      requestedAt: '2024-01-17T14:15:00Z',
      bankInfo: {
        bankName: 'VPBank',
        accountNumber: '****9999',
        accountName: 'Beauty Pro JSC'
      }
    },
    {
      id: 'WD004',
      muaId: 'MUA004',
      muaName: 'Elegant Makeup',
      amount: 950000,
      status: 'FAILED_WITHDRAW',
      requestedAt: '2024-01-14T11:45:00Z',
      processedAt: '2024-01-14T16:30:00Z',
      bankInfo: {
        bankName: 'BIDV',
        accountNumber: '****2233',
        accountName: 'Elegant Makeup Service'
      }
    }
  ];

  const getTransactionStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      HOLD: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Hold' },
      PENDING_REFUND: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Pending Refund' },
      CAPTURED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Captured' },
      REFUNDED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Refunded' }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getWithdrawalStatusBadge = (status: Withdrawal['status']) => {
    const statusConfig = {
      PENDING_WITHDRAW: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      SUCCESS_WITHDRAW: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Success' },
      FAILED_WITHDRAW: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
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

  // Summary calculations
  const totalTransactionAmount = transactions.reduce((sum, t) => sum + (t.status === 'CAPTURED' ? t.amount : 0), 0);
  const totalWithdrawalAmount = withdrawals.reduce((sum, w) => sum + (w.status === 'SUCCESS_WITHDRAW' ? w.amount : 0), 0);
  const pendingRefunds = transactions.filter(t => t.status === 'PENDING_REFUND').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING_WITHDRAW').length;

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTransactionAmount)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-gray-500 text-sm">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Withdrawals</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalWithdrawalAmount)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">+8.3%</span>
                <span className="text-gray-500 text-sm">vs last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingWithdrawals}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Requires action</span>
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
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRefunds}</p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Needs review</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
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
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-rose-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{transaction.customerName}</p>
                    <p className="text-xs text-gray-500">Booking #{transaction.bookingId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(transaction.amount)}</p>
                  {getTransactionStatusBadge(transaction.status)}
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
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Captured</span>
              </div>
              <span className="font-bold text-green-900">{transactions.filter(t => t.status === 'CAPTURED').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">On Hold</span>
              </div>
              <span className="font-bold text-yellow-900">{transactions.filter(t => t.status === 'HOLD').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Pending Refund</span>
              </div>
              <span className="font-bold text-orange-900">{transactions.filter(t => t.status === 'PENDING_REFUND').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Refunded</span>
              </div>
              <span className="font-bold text-red-900">{transactions.filter(t => t.status === 'REFUNDED').length}</span>
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
              <div key={withdrawal.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{withdrawal.muaName}</p>
                    <p className="text-xs text-gray-500">{withdrawal.bankInfo.bankName} {withdrawal.bankInfo.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                  {getWithdrawalStatusBadge(withdrawal.status)}
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
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Success</span>
              </div>
              <span className="font-bold text-green-900">{withdrawals.filter(w => w.status === 'SUCCESS_WITHDRAW').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Pending</span>
              </div>
              <span className="font-bold text-yellow-900">{withdrawals.filter(w => w.status === 'PENDING_WITHDRAW').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Failed</span>
              </div>
              <span className="font-bold text-red-900">{withdrawals.filter(w => w.status === 'FAILED_WITHDRAW').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Total Success</span>
              </div>
              <span className="font-bold text-purple-900">{formatCurrency(totalWithdrawalAmount)}</span>
            </div>
          </div>
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

      {/* Overview Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
        <OverviewTab />
      </div>
    </div>
  );
};

export default TransactionManagement;