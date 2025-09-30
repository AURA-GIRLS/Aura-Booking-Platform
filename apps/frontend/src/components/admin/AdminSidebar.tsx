'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Brush, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  TrendingUp,
  Wallet,
  Activity
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  children?: MenuItem[];
}

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['users', 'transactions']);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'MUA Management',
      href: '/admin/muas',
      icon: Brush,
    },
    {
      name: 'Financial Management',
      href: '/admin/transactions',
      icon: CreditCard,
      children: [
        {
          name: 'Overview',
          href: '/admin/transactions',
          icon: Activity,
        },
        {
          name: 'Booking Transactions',
          href: '/admin/transactions/bookings',
          icon: CreditCard,
        },
        {
          name: 'MUA Withdrawals',
          href: '/admin/transactions/withdrawals',
          icon: Wallet,
          badge: 3, // Pending withdrawals
        },
        {
          name: 'User Refunds',
          href: '/admin/transactions/refunds',
          icon: DollarSign,
        },
      ]
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name.toLowerCase().replace(' ', ''));
    const active = isActive(item.href);

    return (
      <div key={item.name}>
        <div
          className={`
            flex items-center justify-between px-3 py-2.5 mx-2 rounded-xl transition-all duration-200 cursor-pointer
            ${level > 0 ? 'ml-4 text-sm' : 'text-base'}
            ${active 
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' 
              : 'text-gray-700 hover:bg-rose-50 hover:text-rose-900'
            }
          `}
          onClick={() => hasChildren ? toggleExpanded(item.name.toLowerCase().replace(' ', '')) : null}
        >
          <Link href={item.href as any} className="flex items-center flex-1">
            <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} mr-3 flex-shrink-0`} />
            {!isCollapsed && (
              <>
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
          {!isCollapsed && hasChildren && (
            <ChevronRight 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
            />
          )}
        </div>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-white border-r border-rose-100 shadow-lg transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-rose-100">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-700" /> : <ChevronLeft className="w-5 h-5 text-gray-700" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-rose-100">
        {!isCollapsed && (
          <div className="text-xs text-rose-400 text-center">
            Admin Dashboard v2.0
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;