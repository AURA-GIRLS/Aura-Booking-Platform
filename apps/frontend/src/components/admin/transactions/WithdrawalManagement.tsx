'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  CreditCard,
  Building,
  User
} from 'lucide-react';

interface MUAWithdrawal {
  id: string;
  muaId: string;
  muaName: string;
  muaEmail: string;
  amount: number;
  status: 'PENDING_WITHDRAW' | 'SUCCESS_WITHDRAW' | 'FAILED_WITHDRAW';
  requestedAt: string;
  processedAt?: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchName?: string;
  };
  transactionIds: string[]; // IDs of transactions being withdrawn
  notes?: string;
  processingFee: number;
  netAmount: number;
}

const WithdrawalManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'PENDING_WITHDRAW' | 'SUCCESS_WITHDRAW' | 'FAILED_WITHDRAW'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<string[]>([]);

  // Mock data - replace with API calls
  const withdrawals: MUAWithdrawal[] = [
    {
      id: 'WD001',
      muaId: 'MUA001',
      muaName: 'Sarah Beauty',
      muaEmail: 'sarah@beauty.com',
      amount: 2500000,
      status: 'PENDING_WITHDRAW',
      requestedAt: '2024-01-16T10:00:00Z',
      bankInfo: {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'Sarah Nguyen',
        branchName: 'Ho Chi Minh City Branch'
      },
      transactionIds: ['TXN001', 'TXN003', 'TXN005'],
      processingFee: 25000,
      netAmount: 2475000,
      notes: 'Weekly withdrawal request'
    },
    {
      id: 'WD002',
      muaId: 'MUA002',
      muaName: 'Glam Studio',
      muaEmail: 'info@glamstudio.com',
      amount: 1800000,
      status: 'SUCCESS_WITHDRAW',
      requestedAt: '2024-01-15T08:30:00Z',
      processedAt: '2024-01-15T15:20:00Z',
      bankInfo: {
        bankName: 'Techcombank',
        accountNumber: '9876543210',
        accountName: 'Glam Studio Co.',
        branchName: 'District 1 Branch'
      },
      transactionIds: ['TXN002', 'TXN004'],
      processingFee: 18000,
      netAmount: 1782000
    },
    {
      id: 'WD003',
      muaId: 'MUA003',
      muaName: 'Beauty Pro',
      muaEmail: 'contact@beautypro.vn',
      amount: 3200000,
      status: 'PENDING_WITHDRAW',
      requestedAt: '2024-01-17T14:15:00Z',
      bankInfo: {
        bankName: 'VPBank',
        accountNumber: '5555666677',
        accountName: 'Beauty Pro JSC',
        branchName: 'Tan Binh Branch'
      },
      transactionIds: ['TXN006', 'TXN007', 'TXN008', 'TXN009'],
      processingFee: 32000,
      netAmount: 3168000,
      notes: 'Large withdrawal - priority processing requested'
    },
    {
      id: 'WD004',
      muaId: 'MUA004',
      muaName: 'Elegant Makeup',
      muaEmail: 'elegant@makeup.vn',
      amount: 950000,
      status: 'FAILED_WITHDRAW',
      requestedAt: '2024-01-14T11:45:00Z',
      processedAt: '2024-01-14T16:30:00Z',
      bankInfo: {
        bankName: 'BIDV',
        accountNumber: '1111222233',
        accountName: 'Elegant Makeup Service',
        branchName: 'Phu Nhuan Branch'
      },
      transactionIds: ['TXN010'],
      processingFee: 9500,
      netAmount: 940500,
      notes: 'Failed due to incorrect bank account information'
    }
  ];

  const getStatusBadge = (status: MUAWithdrawal['status']) => {
    const statusConfig = {
      PENDING_WITHDRAW: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
      SUCCESS_WITHDRAW: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Success' },
      FAILED_WITHDRAW: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Failed' }
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

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesStatus = filter === 'all' || withdrawal.status === filter;
    const matchesSearch = searchTerm === '' || 
      withdrawal.muaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.muaEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bankInfo.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleApproveWithdrawal = (withdrawalId: string) => {
    // Approve withdrawal logic
    console.log('Approving withdrawal:', withdrawalId);
  };

  const handleRejectWithdrawal = (withdrawalId: string) => {
    // Reject withdrawal logic
    console.log('Rejecting withdrawal:', withdrawalId);
  };

  const handleBulkApprove = () => {
    if (selectedWithdrawals.length === 0) return;
    console.log('Bulk approving withdrawals:', selectedWithdrawals);
    setSelectedWithdrawals([]);
  };

  const toggleSelection = (withdrawalId: string) => {
    setSelectedWithdrawals(prev => 
      prev.includes(withdrawalId) 
        ? prev.filter(id => id !== withdrawalId)
        : [...prev, withdrawalId]
    );
  };

  const selectAll = () => {
    const pendingWithdrawals = filteredWithdrawals
      .filter(w => w.status === 'PENDING_WITHDRAW')
      .map(w => w.id);
    setSelectedWithdrawals(pendingWithdrawals);
  };

  // Summary calculations
  const totalAmount = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const successAmount = filteredWithdrawals.filter(w => w.status === 'SUCCESS_WITHDRAW').reduce((sum, w) => sum + w.amount, 0);
  const pendingAmount = filteredWithdrawals.filter(w => w.status === 'PENDING_WITHDRAW').reduce((sum, w) => sum + w.amount, 0);
  const failedAmount = filteredWithdrawals.filter(w => w.status === 'FAILED_WITHDRAW').reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">MUA Withdrawals</h1>
        <p className="text-blue-100 text-lg">Manage withdrawal requests from makeup artists</p>
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
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Success</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(successAmount)}</p>
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
                placeholder="Search by MUA, email, withdrawal ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING_WITHDRAW">Pending</option>
                <option value="SUCCESS_WITHDRAW">Success</option>
                <option value="FAILED_WITHDRAW">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedWithdrawals.length > 0 && (
              <button 
                onClick={handleBulkApprove}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            MUA Withdrawals ({filteredWithdrawals.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedWithdrawals.length === filteredWithdrawals.filter(w => w.status === 'PENDING_WITHDRAW').length}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Withdrawal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MUA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedWithdrawals.includes(withdrawal.id)}
                      onChange={() => toggleSelection(withdrawal.id)}
                      disabled={withdrawal.status !== 'PENDING_WITHDRAW'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{withdrawal.id}</div>
                      <div className="text-sm text-gray-500">{withdrawal.transactionIds.length} transactions</div>
                      {withdrawal.notes && (
                        <div className="text-xs text-blue-600 mt-1">{withdrawal.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{withdrawal.muaName}</div>
                        <div className="text-sm text-gray-500">{withdrawal.muaEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{withdrawal.bankInfo.bankName}</div>
                        <div className="text-sm text-gray-500">****{withdrawal.bankInfo.accountNumber.slice(-4)}</div>
                        <div className="text-xs text-gray-400">{withdrawal.bankInfo.accountName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-xs text-gray-500">
                        Fee: {formatCurrency(withdrawal.processingFee)}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        Net: {formatCurrency(withdrawal.netAmount)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Requested: {formatDate(withdrawal.requestedAt)}</div>
                      {withdrawal.processedAt && (
                        <div className="text-xs text-gray-400">
                          Processed: {formatDate(withdrawal.processedAt)}
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
                      {withdrawal.status === 'PENDING_WITHDRAW' && (
                        <>
                          <button 
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
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

export default WithdrawalManagement;