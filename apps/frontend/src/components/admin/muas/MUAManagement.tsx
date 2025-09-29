'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Star,
  MapPin,
  Mail,
  Phone,
  Eye,
  Shield,
  ShieldOff,
  Search,
  Filter,
  Download,
  BarChart3,
  Activity,
  TrendingUp,
  Brush,
  Award,
  Calendar,
  DollarSign,
  ThumbsUp,
  Camera
} from 'lucide-react';

interface MUA {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'banned' | 'pending' | 'reviewing';
  joinedAt: string;
  lastActive: string;
  totalBookings: number;
  completedBookings: number;
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  pendingWithdrawal: number;
  specialties: string[];
  portfolio: {
    images: number;
    videos: number;
  };
  verification: {
    identity: boolean;
    portfolio: boolean;
    background: boolean;
  };
  avatar?: string;
}

const MUAManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'pending' | 'reviewing'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMUAs, setSelectedMUAs] = useState<string[]>([]);

  // Mock data - replace with API calls
  const mockMUAs: MUA[] = [
    {
      id: 'MUA001',
      name: 'Trần Minh Châu',
      email: 'chau.tran@email.com',
      phone: '0912345678',
      location: 'TP.HCM',
      status: 'active',
      joinedAt: '2024-02-20',
      lastActive: '2024-12-14',
      totalBookings: 45,
      completedBookings: 42,
      rating: 4.8,
      totalReviews: 38,
      totalEarnings: 18500000,
      pendingWithdrawal: 2500000,
      specialties: ['Bridal Makeup', 'Party Makeup', 'Photoshoot'],
      portfolio: { images: 24, videos: 6 },
      verification: { identity: true, portfolio: true, background: true }
    },
    {
      id: 'MUA002',
      name: 'Phạm Thúy Kiều',
      email: 'kieu.pham@email.com',
      phone: '0934567890',
      location: 'Hà Nội',
      status: 'active',
      joinedAt: '2024-01-08',
      lastActive: '2024-12-13',
      totalBookings: 62,
      completedBookings: 58,
      rating: 4.9,
      totalReviews: 54,
      totalEarnings: 25800000,
      pendingWithdrawal: 1200000,
      specialties: ['Wedding Makeup', 'Fashion Makeup', 'Editorial'],
      portfolio: { images: 32, videos: 8 },
      verification: { identity: true, portfolio: true, background: true }
    },
    {
      id: 'MUA003',
      name: 'Đặng Khánh Ly',
      email: 'ly.dang@email.com',
      phone: '0967890123',
      location: 'Huế',
      status: 'pending',
      joinedAt: '2024-12-10',
      lastActive: '2024-12-11',
      totalBookings: 0,
      completedBookings: 0,
      rating: 0,
      totalReviews: 0,
      totalEarnings: 0,
      pendingWithdrawal: 0,
      specialties: ['Natural Makeup', 'Korean Style'],
      portfolio: { images: 12, videos: 2 },
      verification: { identity: true, portfolio: false, background: false }
    },
    {
      id: 'MUA004',
      name: 'Lê Thanh Hương',
      email: 'huong.le@email.com',
      phone: '0945678901',
      location: 'Đà Nẵng',
      status: 'reviewing',
      joinedAt: '2024-12-08',
      lastActive: '2024-12-09',
      totalBookings: 0,
      completedBookings: 0,
      rating: 0,
      totalReviews: 0,
      totalEarnings: 0,
      pendingWithdrawal: 0,
      specialties: ['Traditional Makeup', 'Special Events'],
      portfolio: { images: 18, videos: 4 },
      verification: { identity: true, portfolio: true, background: false }
    },
    {
      id: 'MUA005',
      name: 'Nguyễn Thị Mai',
      email: 'mai.nguyen@email.com',
      phone: '0923456789',
      location: 'Cần Thơ',
      status: 'banned',
      joinedAt: '2024-08-15',
      lastActive: '2024-11-20',
      totalBookings: 28,
      completedBookings: 20,
      rating: 3.2,
      totalReviews: 15,
      totalEarnings: 8500000,
      pendingWithdrawal: 0,
      specialties: ['Daily Makeup', 'Party Makeup'],
      portfolio: { images: 15, videos: 3 },
      verification: { identity: true, portfolio: true, background: true }
    },
    {
      id: 'MUA006',
      name: 'Võ Minh Anh',
      email: 'anh.vo@email.com',
      phone: '0987654321',
      location: 'Vũng Tàu',
      status: 'active',
      joinedAt: '2024-05-12',
      lastActive: '2024-12-12',
      totalBookings: 33,
      completedBookings: 31,
      rating: 4.6,
      totalReviews: 29,
      totalEarnings: 14200000,
      pendingWithdrawal: 800000,
      specialties: ['Beach Wedding', 'Outdoor Events', 'Natural Look'],
      portfolio: { images: 28, videos: 5 },
      verification: { identity: true, portfolio: true, background: true }
    }
  ];

  // Calculate statistics
  const totalMUAs = mockMUAs.length;
  const activeMUAs = mockMUAs.filter(m => m.status === 'active').length;
  const pendingMUAs = mockMUAs.filter(m => m.status === 'pending').length;
  const reviewingMUAs = mockMUAs.filter(m => m.status === 'reviewing').length;
  const bannedMUAs = mockMUAs.filter(m => m.status === 'banned').length;
  const totalBookings = mockMUAs.reduce((sum, m) => sum + m.totalBookings, 0);
  const totalEarnings = mockMUAs.reduce((sum, m) => sum + m.totalEarnings, 0);
  const avgRating = mockMUAs.filter(m => m.rating > 0).reduce((sum, m) => sum + m.rating, 0) / mockMUAs.filter(m => m.rating > 0).length;

  // Filter MUAs based on search and filters
  const filteredMUAs = mockMUAs.filter(mua => {
    const matchesSearch = mua.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mua.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mua.phone.includes(searchTerm) ||
                         mua.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mua.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || mua.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Selection functions
  const toggleSelection = (muaId: string) => {
    setSelectedMUAs(prev => 
      prev.includes(muaId) 
        ? prev.filter(id => id !== muaId)
        : [...prev, muaId]
    );
  };

  const selectAll = () => {
    if (selectedMUAs.length === filteredMUAs.length) {
      setSelectedMUAs([]);
    } else {
      setSelectedMUAs(filteredMUAs.map(m => m.id));
    }
  };

  // Action handlers
  const handleApproveMUA = (muaId: string) => {
    console.log('Approving MUA:', muaId);
    // TODO: Implement approve API call
  };

  const handleRejectMUA = (muaId: string) => {
    console.log('Rejecting MUA:', muaId);
    // TODO: Implement reject API call
  };

  const handleBanMUA = (muaId: string) => {
    console.log('Banning MUA:', muaId);
    // TODO: Implement ban API call
  };

  const handleUnbanMUA = (muaId: string) => {
    console.log('Unbanning MUA:', muaId);
    // TODO: Implement unban API call
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'ban' | 'unban') => {
    console.log(`${action} MUAs:`, selectedMUAs);
    // TODO: Implement bulk API call
    setSelectedMUAs([]);
  };

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active', icon: UserCheck },
      banned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Banned', icon: UserX },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Approval', icon: Clock },
      reviewing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review', icon: Eye }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (verification: MUA['verification']) => {
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
              <p className="text-gray-600 text-sm font-medium mb-1">Total MUAs</p>
              <p className="text-2xl font-bold text-gray-900">{totalMUAs}</p>
              <div className="flex items-center gap-1 mt-2">
                <Brush className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-600">{activeMUAs} active</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingMUAs + reviewingMUAs}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Need attention</span>
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
              <p className="text-gray-600 text-sm font-medium mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">All time</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
              <div className="flex items-center gap-1 mt-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Platform revenue</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
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
            MUA Status Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Active MUAs</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-900">{activeMUAs}</span>
                <span className="text-green-600 text-sm ml-2">({((activeMUAs/totalMUAs)*100).toFixed(1)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Pending Review</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-yellow-900">{pendingMUAs + reviewingMUAs}</span>
                <span className="text-yellow-600 text-sm ml-2">({(((pendingMUAs + reviewingMUAs)/totalMUAs)*100).toFixed(1)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Banned</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red-900">{bannedMUAs}</span>
                <span className="text-red-600 text-sm ml-2">({((bannedMUAs/totalMUAs)*100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-600" />
            Performance Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-pink-900">Average Rating</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-pink-900">{avgRating.toFixed(1)}</span>
                <span className="text-pink-600 text-sm ml-2">/ 5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Avg Bookings/MUA</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-900">{Math.round(totalBookings/activeMUAs)}</span>
                <span className="text-blue-600 text-sm ml-2">bookings</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Avg Earnings/MUA</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-900">{formatCurrency(Math.round(totalEarnings/activeMUAs))}</span>
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
                placeholder="Search by name, email, location, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[250px]"
                aria-label="Search MUAs"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="reviewing">Under Review</option>
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
                >
                  <UserCheck className="w-4 h-4" />
                  Approve ({selectedMUAs.length})
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <UserX className="w-4 h-4" />
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
            All MUAs ({filteredMUAs.length})
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedMUAs.length === filteredMUAs.length && filteredMUAs.length > 0}
                    aria-label="Select all MUAs"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MUA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMUAs.map((mua) => (
                <tr key={mua.id} className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedMUAs.includes(mua.id)}
                      onChange={() => toggleSelection(mua.id)}
                      aria-label={`Select ${mua.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {mua.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <Link 
                          href={`/admin/users?id=${mua.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {mua.name}
                        </Link>
                        <div className="text-sm text-gray-500">ID: {mua.id}</div>
                        <div className="flex gap-1 mt-1">
                          {mua.specialties.slice(0, 2).map((specialty, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              {specialty}
                            </span>
                          ))}
                          {mua.specialties.length > 2 && (
                            <span className="text-xs text-gray-500">+{mua.specialties.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {mua.email}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {mua.phone}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{mua.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(mua.status)}
                      {getVerificationBadge(mua.verification)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      {mua.rating > 0 ? getRatingStars(mua.rating) : <span className="text-gray-400">No ratings</span>}
                      <div className="text-gray-600 mt-1">
                        {mua.completedBookings}/{mua.totalBookings} completed
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4 text-purple-500" />
                        <span>{mua.portfolio.images}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-pink-500" />
                        <span>{mua.portfolio.videos}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="text-green-600 font-medium">
                        {formatCurrency(mua.totalEarnings)}
                      </div>
                      {mua.pendingWithdrawal > 0 && (
                        <div className="text-yellow-600 text-xs">
                          Pending: {formatCurrency(mua.pendingWithdrawal)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/users?id=${mua.id}`}
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-900 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      {mua.status === 'pending' || mua.status === 'reviewing' ? (
                        <>
                          <button 
                            onClick={() => handleApproveMUA(mua.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectMUA(mua.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      ) : mua.status === 'active' ? (
                        <button 
                          onClick={() => handleBanMUA(mua.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                        >
                          <ShieldOff className="w-4 h-4" />
                          Ban
                        </button>
                      ) : mua.status === 'banned' && (
                        <button 
                          onClick={() => handleUnbanMUA(mua.id)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-900 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default MUAManagement;