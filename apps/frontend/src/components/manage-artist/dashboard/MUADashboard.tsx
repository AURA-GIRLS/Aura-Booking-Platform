"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Clock, DollarSign, Users, Star, TrendingUp, Bell, CheckCircle, XCircle, AlertCircle, Plus, ArrowRight, MapPin } from "lucide-react";
import { DashboardService, type MuaDashboardSummary } from "@/services/dashboard";
import type { BookingResponseDTO } from "@/types/booking.dtos";
import type { MuaResponseDTO } from "@/types/user.dtos";

interface Props {
  muaId?: string;
}

export default function MUADashboard({ muaId }: Props) {
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  const [effectiveMuaId, setEffectiveMuaId] = useState<string | null>(muaId || null);
  const [stats, setStats] = useState<MuaDashboardSummary>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no prop provided, read from localStorage
    if (!muaId) {
      try {
        const stored = localStorage.getItem("currentMUA");
        if (stored && stored !== "undefined") {
          const parsed = JSON.parse(stored);
          setMua(parsed);
          setEffectiveMuaId(parsed?._id || null);
        }
      } catch (e) {
        // noop
      }
    } else {
      setEffectiveMuaId(muaId);
    }
  }, [muaId]);

  useEffect(() => {
    const run = async () => {
      if (!effectiveMuaId) return;
      try {
        setLoading(true);
        const [summaryRes, recentRes] = await Promise.all([
          DashboardService.getMuaSummary(effectiveMuaId),
          DashboardService.getMuaRecent(effectiveMuaId, 5),
        ]);
        if (summaryRes.success && summaryRes.data) setStats(summaryRes.data);
        if (recentRes.success && recentRes.data) setRecentBookings(recentRes.data);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [effectiveMuaId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-100";
      case "CONFIRMED":
        return "text-blue-600 bg-blue-100";
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle size={16} />;
      case "CONFIRMED":
        return <CheckCircle size={16} />;
      case "COMPLETED":
        return <CheckCircle size={16} />;
      case "CANCELLED":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const linkId = effectiveMuaId || mua?._id || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-rose-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-white rounded-2xl shadow-sm"></div>
              <div className="h-96 bg-white rounded-2xl shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back{mua?.userName ? `, ${mua.userName}` : ""}! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your bookings today</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
              <Bell size={16} />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => (window.location.href = `/manage-artist/${linkId}/calendar`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all hover:scale-105"
            >
              <Plus size={16} />
              <span>Manage Schedule</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">{/* trend */}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
            <p className="text-gray-600 text-sm">Total Bookings</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm text-yellow-600 font-medium">{stats.pendingBookings} pending</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</h3>
            <p className="text-gray-600 text-sm">Pending Approval</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">{/* trend */}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString("vi-VN")} VND</h3>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-rose-100 to-pink-200 rounded-xl">
                <Star className="text-rose-600" size={24} />
              </div>
              <span className="text-sm text-rose-600 font-medium">{stats.totalReviews} reviews</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</h3>
            <p className="text-gray-600 text-sm">Average Rating</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => (window.location.href = `/manage-artist/${linkId}/bookings`)}
                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Users className="text-rose-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                      <p className="text-sm text-gray-600">{booking.serviceName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar size={12} />
                        <span>
                          {booking.bookingDate} at {booking.startTime}
                        </span>
                        <MapPin size={12} />
                        <span>{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span>{booking.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{booking.totalPrice.toLocaleString("vi-VN")} VND</p>
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && <div className="text-center text-gray-500 py-10">No recent bookings</div>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = `/manage-artist/${linkId}/calendar`)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl hover:from-rose-100 hover:to-pink-100 transition-colors"
                >
                  <Calendar className="text-rose-600" size={20} />
                  <span className="font-medium text-gray-900">Manage Schedule</span>
                </button>
                <button
                  onClick={() => (window.location.href = `/manage-artist/${linkId}/services`)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors"
                >
                  <Star className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">Manage Services</span>
                </button>
                <button
                  onClick={() => (window.location.href = `/manage-artist/${linkId}/profile`)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors"
                >
                  <Users className="text-green-600" size={20} />
                  <span className="font-medium text-gray-900">Edit Profile</span>
                </button>
                <button
                  onClick={() => (window.location.href = `/manage-artist/${linkId}/analytics`)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-colors"
                >
                  <TrendingUp className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">View Analytics</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">09:00 - 11:00</p>
                    <p className="text-sm text-gray-600">Bridal Makeup - Nguyễn Thị Mai</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">14:00 - 15:30</p>
                    <p className="text-sm text-gray-600">Party Makeup - Trần Thị Lan</p>
                  </div>
                </div>
                <div className="text-center py-4">
                  <button
                    onClick={() => (window.location.href = `/manage-artist/${linkId}/calendar`)}
                    className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                  >
                    View Full Schedule →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
