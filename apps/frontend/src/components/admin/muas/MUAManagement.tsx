'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserX,
  Clock,
  Star,
  MapPin,
  Mail,
  Phone,
  Eye,
  Shield,
  Search,
  Filter,
  Download,
  BarChart3,
  Activity,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Camera,
  CheckCircle,
  XCircle,
  Ban,
  Check
} from 'lucide-react';
import {
  getMUAs,
  getMUAStatistics,
  approveMUA,
  rejectMUA,
  banMUA,
  unbanMUA,
  bulkApproveMUAs,
  bulkRejectMUAs
} from '@/services/admin.user';
import type { AdminMUAResponseDTO, MUAStatisticsDTO } from '@/types/admin.user.dto';
import { getPublicCertificates } from '@/lib/api/certificate';
import type { Certificate } from '@/types/certificate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/lib/ui/dialog';
import { Button } from '@/components/lib/ui/button';

const MUAManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'pending' | 'reviewing'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMUAs, setSelectedMUAs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalMUAs, setTotalMUAs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [muas, setMuas] = useState<AdminMUAResponseDTO[]>([]);
  const [statistics, setStatistics] = useState<MUAStatisticsDTO | null>(null);
  
  // Certificate Dialog State
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [selectedMUA, setSelectedMUA] = useState<AdminMUAResponseDTO | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);

  // Load data from API
  useEffect(() => {
    loadMUAs();
    loadStatistics();
  }, [currentPage, pageSize, filter, searchTerm]);

  const loadMUAs = async () => {
    setIsLoading(true);
    try {
      const response = await getMUAs({
        page: currentPage,
        pageSize: pageSize,
        status: filter !== 'all' ? filter as any : undefined,
        search: searchTerm || undefined
      });
      
      if (response.success && response.data) {
        setMuas(response.data.muas);
        setTotalMUAs(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load MUAs:', error);
      setMuas([]);
      setTotalMUAs(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await getMUAStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // Use real statistics from API or fallback values
  const stats = statistics || {
    totalMUAs: 0,
    activeMUAs: 0,
    pendingMUAs: 0,
    approvedMUAs: 0,
    rejectedMUAs: 0,
    bannedMUAs: 0,
    reviewingMUAs: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalBookings: 0,
    totalEarnings: 0,
    avgRating: 0
  };

  // Selection functions
  const toggleSelection = (muaId: string) => {
    setSelectedMUAs(prev => 
      prev.includes(muaId) 
        ? prev.filter(id => id !== muaId)
        : [...prev, muaId]
    );
  };

  const selectAll = () => {
    if (selectedMUAs.length === muas.length) {
      setSelectedMUAs([]);
    } else {
      setSelectedMUAs(muas.map(m => m._id));
    }
  };

  // Action handlers
  const handleApproveMUA = async (muaId: string) => {
    try {
      setIsLoading(true);
      const response = await approveMUA(muaId, { adminNotes: 'Admin approval' });
      if (response.success) {
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to approve MUA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectMUA = async (muaId: string) => {
    try {
      setIsLoading(true);
      const response = await rejectMUA(muaId, { reason: 'Admin rejection' });
      if (response.success) {
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to reject MUA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanMUA = async (muaId: string) => {
    try {
      setIsLoading(true);
      const response = await banMUA(muaId, { reason: 'Admin action' });
      if (response.success) {
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to ban MUA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanMUA = async (muaId: string) => {
    try {
      setIsLoading(true);
      const response = await unbanMUA(muaId);
      if (response.success) {
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to unban MUA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'ban' | 'unban') => {
    try {
      setIsLoading(true);
      let response;
      
      switch (action) {
        case 'approve':
          response = await bulkApproveMUAs({ 
            muaIds: selectedMUAs, 
            adminNotes: 'Bulk admin approval' 
          });
          break;
        case 'reject':
          response = await bulkRejectMUAs({ 
            muaIds: selectedMUAs, 
            reason: 'Bulk admin rejection' 
          });
          break;
        default:
          console.log(`${action} not implemented yet`);
          return;
      }
      
      if (response?.success) {
        setSelectedMUAs([]);
        await loadMUAs();
      }
    } catch (error) {
      console.error(`Failed to ${action} MUAs:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Certificate functions
  const handleViewCertificates = async (mua: AdminMUAResponseDTO) => {
    setSelectedMUA(mua);
    setShowCertificateDialog(true);
    setLoadingCertificates(true);
    
    try {
      // Get MUA's certificates
      const response = await getPublicCertificates(mua._id, { limit: 10 });
      setCertificates(response.data);
    } catch (error) {
      console.error('Failed to load certificates:', error);
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleApproveMUAFromDialog = async () => {
    if (!selectedMUA) return;
    
    try {
      setIsLoading(true);
      const response = await approveMUA(selectedMUA._id, { 
        adminNotes: 'Approved after certificate review' 
      });
      
      if (response.success) {
        setShowCertificateDialog(false);
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to approve MUA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectMUAFromDialog = async () => {
    if (!selectedMUA) return;
    
    try {
      setIsLoading(true);
      const response = await rejectMUA(selectedMUA._id, { 
        reason: 'Rejected after certificate review' 
      });
      
      if (response.success) {
        setShowCertificateDialog(false);
        await loadMUAs();
      }
    } catch (error) {
      console.error('Failed to reject MUA:', error);
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
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (verification?: { identity: boolean; portfolio: boolean; background: boolean }) => {
    if (!verification) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <UserX className="w-3 h-3" />
          Not Verified
        </span>
      );
    }

    const allVerified = verification.identity && verification.portfolio && verification.background;
    const partiallyVerified = verification.identity || verification.portfolio || verification.background;
    
    if (allVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Shield className="w-3 h-3" />
          Verified
        </span>
      );
    } else if (partiallyVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Partial
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <UserX className="w-3 h-3" />
          Not Verified
        </span>
      );
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-3 h-3 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">MUA Management</h1>
        <p className="text-purple-100 text-lg">Manage makeup artists, applications, and performance analytics</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total MUAs</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMUAs}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">{stats.activeMUAs} active</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending Applications</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingMUAs + stats.reviewingMUAs}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Need Review</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalBookings}</p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">All time</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</p>
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Revenue</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* MUA Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            MUA Status Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium text-green-900">Active</span>
              <div className="text-right">
                <span className="font-bold text-green-900">{stats.activeMUAs}</span>
                <span className="text-green-600 text-xs ml-2">
                  ({stats.totalMUAs > 0 ? ((stats.activeMUAs/stats.totalMUAs)*100).toFixed(1) : '0'}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <span className="text-sm font-medium text-yellow-900">Pending</span>
              <div className="text-right">
                <span className="font-bold text-yellow-900">{stats.pendingMUAs + stats.reviewingMUAs}</span>
                <span className="text-yellow-600 text-xs ml-2">
                  ({stats.totalMUAs > 0 ? (((stats.pendingMUAs + stats.reviewingMUAs)/stats.totalMUAs)*100).toFixed(1) : '0'}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <span className="text-sm font-medium text-red-900">Banned</span>
              <div className="text-right">
                <span className="font-bold text-red-900">{stats.bannedMUAs}</span>
                <span className="text-red-600 text-xs ml-2">
                  ({stats.totalMUAs > 0 ? ((stats.bannedMUAs/stats.totalMUAs)*100).toFixed(1) : '0'}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <div className="text-right">
                <span className="font-bold text-gray-900">{stats.totalMUAs}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-pink-50">
              <div className="text-sm font-medium text-pink-900 mb-1">Avg Rating</div>
              <div className="text-right">
                <span className="font-bold text-pink-900">{stats.avgRating.toFixed(1)}</span>
                <div className="flex justify-center mt-1">
                  {getRatingStars(stats.avgRating)}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <div className="text-sm font-medium text-blue-900 mb-1">Avg Bookings</div>
              <div className="text-right">
                <span className="font-bold text-blue-900">
                  {stats.activeMUAs > 0 ? Math.round(stats.totalBookings/stats.activeMUAs) : 0}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <div className="text-sm font-medium text-green-900 mb-1">Avg Earnings</div>
              <div className="text-right">
                <span className="font-bold text-green-900">
                  {formatCurrency(stats.activeMUAs > 0 ? Math.round(stats.totalEarnings/stats.activeMUAs) : 0)}
                </span>
              </div>
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
                placeholder="Search by name, email, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[250px]"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
              title="Filter by status"
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedMUAs.length > 0 && (
              <>
                <button 
                  onClick={() => handleBulkAction('approve')}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  disabled={isLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve ({selectedMUAs.length})
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4" />
                  Reject ({selectedMUAs.length})
                </button>
              </>
            )}
            
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* MUAs Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            MUAs ({totalMUAs} total)
            {isLoading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
          </h3>
          <button
            onClick={selectAll}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            Select All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                  placeholder="Select All"
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedMUAs.length === muas.length && muas.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MUA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portfolio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {muas.map((mua: AdminMUAResponseDTO) => (
                <tr key={mua._id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input 
                    title="Select MUA"
                    placeholder="Select MUA"
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedMUAs.includes(mua._id)}
                      onChange={() => toggleSelection(mua._id)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {mua.name?.charAt(0).toUpperCase() || 'M'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          <Link 
                            href={`/admin/users?id=${mua.userId}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {mua.name || 'Unknown'}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-500">ID: {mua._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-xs">
                      <div className="text-gray-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {mua.email || 'N/A'}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {mua.phone || 'N/A'}
                      </div>
                      <div className="text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {mua.location || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(mua.status)}
                      {getVerificationBadge(mua.verification)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="font-medium">{mua.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-500">({mua.totalReviews || 0})</span>
                      </div>
                      <div className="text-gray-900">
                        {mua.bookingCount || 0} bookings
                      </div>
                      <div className="text-green-600 font-medium">
                        {formatCurrency(mua.totalEarnings || 0)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Camera className="w-3 h-3 text-blue-500" />
                        <span>{mua.portfolio?.images || 0} photos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-purple-500" />
                        <span>{mua.portfolio?.videos || 0} videos</span>
                      </div>
                      <div className="text-gray-400 mt-1">
                        Joined: {formatDate(mua.joinedAt || mua.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewCertificates(mua)}
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-900 transition-colors"
                        disabled={isLoading}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {mua.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleViewCertificates(mua)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors"
                            disabled={isLoading}
                          >
                            <Award className="w-3 h-3" />
                            Certificates
                          </button>
                          <button 
                            onClick={() => handleApproveMUA(mua._id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                            disabled={isLoading}
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectMUA(mua._id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                            disabled={isLoading}
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {mua.user?.status !== 'banned' ? (
                        <button 
                          onClick={() => handleBanMUA(mua._id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                          disabled={isLoading}
                        >
                          <Ban className="w-3 h-3" />
                          Ban
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnbanMUA(mua._id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                          disabled={isLoading}
                        >
                          <Shield className="w-3 h-3" />
                          Unban
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalMUAs)} of {totalMUAs} results
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

      {/* Certificate Dialog */}
      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-lg">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-700 p-6 text-white rounded-t-lg -m-6 mb-4">
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedMUA?.name || 'MUA'} - Certificates
            </DialogTitle>
            <DialogDescription className="text-purple-100 mt-1">
              Review certificates and approve/reject application
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Content */}
          <div className="overflow-y-auto max-h-[60vh] px-1">
            {selectedMUA && (
              <>
                {/* MUA Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedMUA.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium">{selectedMUA.experience || 0} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{selectedMUA.location || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedMUA.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="text-gray-900 mt-1">{selectedMUA.bio}</p>
                    </div>
                  )}
                </div>

                {/* Certificates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Certificates ({certificates.length})
                  </h3>

                  {loadingCertificates && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Loading certificates...</span>
                    </div>
                  )}

                  {!loadingCertificates && certificates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No certificates found</p>
                    </div>
                  )}

                  {!loadingCertificates && certificates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certificates.map((cert) => (
                        <div key={cert._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          {/* Certificate Image */}
                          {cert.image && (
                            <div className="mb-3">
                              <img
                                src={cert.image.url}
                                alt={cert.title}
                                className="w-full h-40 object-cover rounded-lg border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/placeholder-cert.png';
                                }}
                              />
                            </div>
                          )}

                          {/* Certificate Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{cert.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Issuer:</strong> {cert.issuer}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                              <div>
                                <strong>Issue Date:</strong><br />
                                {formatDate(cert.issueDate)}
                              </div>
                              {cert.expireDate && (
                                <div>
                                  <strong>Expire Date:</strong><br />
                                  {formatDate(cert.expireDate)}
                                </div>
                              )}
                            </div>

                            {cert.description && (
                              <p className="text-sm text-gray-600 mt-2">{cert.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Dialog Actions */}
          {selectedMUA?.status === 'PENDING' && (
            <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 mt-6 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Review the certificates and make a decision
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRejectMUAFromDialog}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  {isLoading ? 'Rejecting...' : 'Reject Artist'}
                </Button>
                <Button
                  onClick={handleApproveMUAFromDialog}
                  disabled={isLoading}
                  variant="default"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isLoading ? 'Approving...' : 'Approve Artist'}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MUAManagement;