'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserX,
  Shield,
  ShieldOff,
  Eye,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { 
  getUsers, 
  getUserStatistics, 
  banUser, 
  unbanUser, 
  bulkBanUsers, 
  exportUsers, 
  bulkUnBanUsers
} from '@/services/admin.user';
import { UserResponseDTO } from '@/types/user.dtos';

// Using UserResponseDTO from types, extending with additional admin fields
interface AdminUserData extends UserResponseDTO {
  id: string; // Map from _id
  name: string; // Map from fullName
  phone: string; // Map from phoneNumber
  location?: string;
  joinedAt: string; // Map from createdAt
  lastActive: string;
  totalBookings: number;
  totalSpent: number;
}

const UserManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'BANNED'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ARTIST'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Load data from API
  useEffect(() => {
    loadUsers();
    loadStatistics();
  }, [currentPage, pageSize, filter, roleFilter, searchTerm]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        pageSize: pageSize,
        status: filter !== 'all' ? filter : undefined,
        role: roleFilter !== 'all' ? roleFilter as any : undefined,
        search: searchTerm || undefined
      });
      
      if (response.success && response.data) {
        // Map the API response to match our UserResponseDTO structure
        const mappedUsers = response.data.users.map((user: any) => ({
          ...user,
          id: user._id, // Map _id to id for compatibility
        }));
        setUsers(mappedUsers);
        setTotalUsers(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await getUserStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
      // Use fallback mock statistics
      setStatistics({
        totalUsers: 250,
        activeUsers: 180,
        bannedUsers: 12,
        pendingUsers: 58,
        totalCustomers: 190,
        totalMUAs: 60,
        totalRevenue: 15000000
      });
    }
  };


  // Selection functions
  const toggleSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  // Action handlers
  const handleBanUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await banUser(userId, { reason: 'Admin action' });
      if (response.success) {
        await loadUsers(); // Reload data
        await loadStatistics();
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
        console.log('Unbanning user:', userId);
      setIsLoading(true);
      const response = await unbanUser(userId);
      if (response.success) {
        await loadUsers(); // Reload data
        await loadStatistics();
      }
    } catch (error) {
      console.error('Failed to unban user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: 'ban' | 'unban') => {
    try {
        console.log(`Performing bulk action: ${action} on users`, selectedUsers);
      setIsLoading(true);
      if (action === 'ban') {
        const response = await bulkBanUsers({ 
          userIds: selectedUsers, 
          reason: 'Bulk admin action' 
        });
        if (response.success) {
          setSelectedUsers([]);
          await loadUsers();
        }
      }else if (action === 'unban'){
        const response = await bulkUnBanUsers({
            userIds: selectedUsers,
            reason: 'Bulk admin action'
        });
         if (response.success) {
          setSelectedUsers([]);
          await loadUsers();
        }
        }
      // Implement bulk unban if needed
    } catch (error) {
      console.error(`Failed to ${action} users:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportUsers({
        status: filter !== 'all' ? filter : undefined,
        role: roleFilter !== 'all' ? roleFilter as any : undefined,
        search: searchTerm || undefined
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export users:', error);
    }
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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status || 'Unknown',
      icon: Clock
    };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      USER: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Customer' },
      ARTIST: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'MUA' },
      // Legacy role support
      customer: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Customer' },
      mua: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'MUA' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      label: role || 'Unknown' 
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-blue-100 text-lg">Comprehensive user management and analytics dashboard</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium mb-1">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{statistics?.totalUsers || totalUsers}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">+15.3%</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium mb-1">Active Users</p>
              <p className="text-xl font-bold text-green-600">{statistics?.activeUsers || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <UserCheck className="w-3 h-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">
                  {statistics ? ((statistics.activeUsers/statistics.totalUsers)*100).toFixed(1) : '0'}%
                </span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium mb-1">Banned Users</p>
              <p className="text-xl font-bold text-red-600">{statistics?.bannedUsers || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <UserX className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-red-600">
                  {(statistics?.bannedUsers || 0) > 0 ? 'Attention' : 'All good'}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <UserX className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(statistics?.totalRevenue || 0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">Customers</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Quick Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
            <span className="text-xs font-medium text-blue-900">Customers</span>
            <span className="font-bold text-blue-900 text-sm">{statistics?.usersByRole.USER || 0}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
            <span className="text-xs font-medium text-purple-900">MUAs</span>
            <span className="font-bold text-purple-900 text-sm">{statistics?.usersByRole.ARTIST || 0}</span>
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
                placeholder="Search by name, email, phone, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[250px]"
                aria-label="Search users"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="border border-rose-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by role"
              >
                <option value="all">All Roles</option>
                <option value="USER">Customers</option>
                <option value="ARTIST">MUAs</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedUsers.length > 0 && (
              <>
                <button 
                  onClick={() => handleBulkAction('ban')}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Ban ({selectedUsers.length})
                </button>
                <button 
                  onClick={() => handleBulkAction('unban')}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Unban ({selectedUsers.length})
                </button>
              </>
            )}
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Users ({totalUsers} total)
              {isLoading && <span className="text-xs text-gray-500 ml-2">Loading...</span>}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded px-2 py-1"
                aria-label="Items per page"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Select All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    onChange={selectAll}
                    checked={selectedUsers.length === users.length && users.length > 0}
                    aria-label="Select all users"
                  />
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: UserResponseDTO) => (
                <tr key={user._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleSelection(user._id)}
                      aria-label={`Select ${user.fullName}`}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500">ID: {user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-gray-500">{user.phoneNumber || 'N/A'}</div>
                      <div className="text-gray-400">Location: N/A</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <div>
                      <div className="text-gray-900">
                        0 bookings
                      </div>
                      {user.role === 'USER' && (
                        <div className="text-green-600 font-medium">
                          {formatCurrency(0)}
                        </div>
                      )}
                      <div className="text-gray-400">
                        Joined: {formatDate(user.createdAt.toString())}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      {user.status === 'ACTIVE' ? (
                        <button 
                          onClick={() => handleBanUser(user._id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-900 transition-colors"
                          disabled={isLoading}
                        >
                          <ShieldOff className="w-3 h-3" />
                          Ban
                        </button>
                      ) : user.status === 'BANNED' && (
                        <button 
                          onClick={() => handleUnbanUser(user._id)}
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
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} results
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isLoading}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`px-2 py-1 text-xs rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;