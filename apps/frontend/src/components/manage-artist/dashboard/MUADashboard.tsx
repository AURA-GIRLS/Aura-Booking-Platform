"use client";

import React, { useEffect, useState } from "react";
import { DashboardService, type MuaDashboardSummary, type MuaService, type CalendarEvent, type FeedbackItem, type ServiceInsightItem } from "@/services/dashboard";
import type { BookingResponseDTO } from "@/types/booking.dtos";
import type { MuaResponseDTO } from "@/types/user.dtos";
import ProfileHeader from "./components/ProfileHeader";
import StatsGrid from "./components/StatsGrid";
import CalendarOverview from "./components/CalendarOverview";
import ServicesList from "./components/ServicesList";
import RecentFeedback from "./components/RecentFeedback";
import RecentBookings from "./components/RecentBookings";
import ServiceInsights from "./components/ServiceInsights";

interface Props {
  muaId?: string;
}

export default function MUADashboard({ muaId }: Props) {
  const [mua, setMua] = useState<MuaResponseDTO | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [effectiveMuaId, setEffectiveMuaId] = useState<string | null>(muaId || null);
  const [stats, setStats] = useState<MuaDashboardSummary>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    newCustomersThisMonth: 0,
    monthlyBookings: 0,
    revenueGrowthPercent: 0,
    bookingsGrowthPercent: 0,
    customersGrowthPercent: 0,
  });
  const [recentBookings, setRecentBookings] = useState<BookingResponseDTO[]>([]);
  const [services, setServices] = useState<MuaService[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [serviceInsights, setServiceInsights] = useState<ServiceInsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recentFilter, setRecentFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'>('ALL');

  useEffect(() => {
    if (!muaId) {
      try {
        const storedMua = localStorage.getItem("currentMUA");
        const storedUser = localStorage.getItem("currentUser");
        if (storedMua && storedMua !== "undefined") {
          const parsedMua = JSON.parse(storedMua);
          setMua(parsedMua);
          setEffectiveMuaId(parsedMua?._id || null);
        }
        if (storedUser && storedUser !== "undefined") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        }
      } catch (e) {
        // noop
      }
    } else {
      setEffectiveMuaId(muaId);
    }
  }, [muaId]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!effectiveMuaId) return;
      
      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const [summaryRes, recentRes, servicesRes, calendarRes, feedbackRes, insightsRes] = await Promise.all([
          DashboardService.getMuaSummary(effectiveMuaId),
          DashboardService.getMuaRecent(effectiveMuaId, 5),
          DashboardService.getMuaServices(effectiveMuaId),
          DashboardService.getMuaCalendarEvents(effectiveMuaId, year, month),
          DashboardService.getRecentFeedback(effectiveMuaId, 5),
          DashboardService.getServiceInsights(effectiveMuaId, 3),
        ]);

        if (summaryRes.success && summaryRes.data) setStats(summaryRes.data);
        if (recentRes.success && recentRes.data) setRecentBookings(recentRes.data);
        if (servicesRes.success && servicesRes.data) setServices(servicesRes.data);
        if (calendarRes.success && calendarRes.data) setCalendarEvents(calendarRes.data);
        if (feedbackRes.success && feedbackRes.data) setRecentFeedback(feedbackRes.data);
        if (insightsRes.success && insightsRes.data) setServiceInsights(insightsRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [effectiveMuaId, currentDate]);

  const linkId = effectiveMuaId || mua?._id || "";

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case "confirmed": return "bg-green-100 text-green-700";
      case "pending": return "bg-orange-100 text-orange-700";
      case "completed": return "bg-gray-900 text-white"; // black for completed badge
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  const percentColor = (value: number) => value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const handleServiceAvailabilityChange = async (serviceId: string, isAvailable: boolean) => {
    try {
      await DashboardService.setServiceAvailability(linkId, serviceId, isAvailable);
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isActive: isAvailable } : s));
    } catch (e) {
      console.error('Failed to update service availability', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProfileHeader 
          linkId={linkId}
        />

        <StatsGrid 
          stats={stats}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          percentColor={percentColor}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CalendarOverview 
            currentDate={currentDate}
            calendarEvents={calendarEvents}
            navigateMonth={navigateMonth}
          />
          <ServicesList 
            services={services}
            linkId={linkId}
            onServiceAvailabilityChange={handleServiceAvailabilityChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFeedback 
            recentFeedback={recentFeedback}
            formatDateTime={formatDateTime}
          />
          <RecentBookings 
            recentBookings={recentBookings}
            recentFilter={recentFilter}
            setRecentFilter={setRecentFilter}
            getStatusColor={getStatusColor}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Insights at the very bottom */}
        <ServiceInsights items={serviceInsights} />
      </div>
    </div>
  );
}