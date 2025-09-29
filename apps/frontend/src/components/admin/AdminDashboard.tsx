'use client';

import React from 'react';
import { 
  Users, 
  Brush, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 text-pink-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
            <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-pink-600' : 'text-rose-600'}`}>
              {change}%
            </span>
            <span className="text-gray-500 text-sm">vs last month</span>
          </div>
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

interface ActivityItem {
  id: string;
  type: 'user' | 'mua' | 'transaction' | 'payout';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const ActivityFeed: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'mua',
      message: 'New MUA application from Sarah Johnson',
      time: '2 minutes ago',
      status: 'info'
    },
    {
      id: '2',
      type: 'transaction',
      message: 'Payment of $250 completed for booking #1234',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'user',
      message: 'User Alice Brown has been banned',
      time: '10 minutes ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'payout',
      message: 'Payout request #789 requires approval',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      id: '5',
      type: 'transaction',
      message: 'Refund processed for booking #5678',
      time: '30 minutes ago',
      status: 'error'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-pink-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-black" />;
      default:
        return <Activity className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-rose-600" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-rose-50 transition-colors">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(activity.status)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-rose-400" />
                <p className="text-xs text-rose-500">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-sm text-rose-600 hover:text-rose-700 font-medium">
        View all activities
      </button>
    </div>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'Approve MUAs',
      description: '5 pending applications',
      icon: Brush,
      color: 'bg-rose-500 hover:bg-rose-600',
      href: '/admin/muas/pending'
    },
    {
      name: 'Review Payouts',
      description: '3 pending payouts',
      icon: DollarSign,
      color: 'bg-pink-500 hover:bg-pink-600',
      href: '/admin/payouts/pending'
    },
    {
      name: 'User Reports',
      description: '2 new reports',
      icon: Users,
      color: 'bg-black hover:bg-gray-800',
      href: '/admin/users/reports'
    },
    {
      name: 'Transaction Issues',
      description: '1 requires attention',
      icon: CreditCard,
      color: 'bg-rose-400 hover:bg-rose-500',
      href: '/admin/transactions/issues'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-50 transition-all duration-200 border border-rose-100 hover:border-rose-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} transition-colors`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{action.name}</h4>
              <p className="text-sm text-rose-600">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: 12.5,
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-gradient-to-r from-rose-500 to-pink-600'
    },
    {
      title: 'Active MUAs',
      value: '156',
      change: 8.2,
      changeType: 'increase' as const,
      icon: Brush,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600'
    },
    {
      title: 'Monthly Revenue',
      value: '$48,526',
      change: 15.3,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-rose-400 to-pink-500'
    },
    {
      title: 'Transactions',
      value: '1,204',
      change: 3.1,
      changeType: 'decrease' as const,
      icon: CreditCard,
      color: 'bg-gradient-to-r from-gray-800 to-black'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-rose-50 min-h-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-rose-100 text-lg">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Items Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Items</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center">
                  <Brush className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">MUA Applications</p>
                  <p className="text-sm text-rose-600">Waiting for approval</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-rose-600">5</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payout Requests</p>
                  <p className="text-sm text-pink-600">Requires approval</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-pink-600">3</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">User Reports</p>
                  <p className="text-sm text-gray-600">Needs investigation</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-black">2</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Status</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-pink-600 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-pink-600 font-medium">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Gateway</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="text-pink-600 font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Service</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-rose-600 font-medium">Degraded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;