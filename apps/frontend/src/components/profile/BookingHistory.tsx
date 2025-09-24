"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, RefreshCcw, CheckCircle2, Hourglass, Wallet, User, Star } from "lucide-react";
import Notification from "@/components/generalUI/Notification";
import FeedbackActions from "@/components/feedback/FeedbackActions";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";

interface BookingHistoryItem {
  _id: string;
  servicePackage: {
    _id: string;
    name: string;
    price: number;
    duration: number;
    images?: string[];
  };
  mua: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    location?: string;
  };
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  transportFee?: number;
  locationType: 'HOME' | 'STUDIO' | 'VENUE';
  address?: string;
  createdAt: string;
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [userStats, setUserStats] = useState<any>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false
  });

  const statusOptions = [
    { value: 'ALL', label: 'All', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadBookingHistory();
    loadUserStats();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus]);

  const loadBookingHistory = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getBookingHistory();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to load booking history");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await authService.getUserStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to load user stats");
    }
  };

  const filterBookings = () => {
    if (selectedStatus === 'ALL') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === selectedStatus));
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const router = useRouter();

  const handleBookAgain = (muaId: string, serviceId: string) => {
    if (!muaId || !serviceId) return;
    router.push(`/user/booking/${muaId}/${serviceId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(option => option.value === status);
    return statusConfig ? statusConfig : statusOptions[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeOfBooking = (date: string) => {
    try {
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "";
    }
  }

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'HOME': return 'At Home';
      case 'STUDIO': return 'At Studio';
      case 'VENUE': return 'At Venue';
      default: return type;
    }
  };

  // Quick Stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent = userStats ? userStats.totalSpent : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <div className="space-y-6">
        {/* Header + Tabs */}
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50 to-white p-6 shadow-sm">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Booking History</h1>
            <p className="mt-1 text-sm text-gray-600">Track your past and upcoming appointments</p>
          </div>

          {/* Tabs */}
          <div className="mt-2">
            <div className="flex w-full gap-2 overflow-x-auto rounded-xl bg-pink-100/60 p-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedStatus === option.value
                      ? 'bg-white text-pink-700 shadow'
                      : 'text-pink-700/80 hover:bg-white/60'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats (Pastel gradient cards) */}
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Total Bookings (blue tone to balance pink) */}
            <div className="h-24 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 p-4 ring-1 ring-green-200">
              <div className="flex h-full items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Bookings</div>
                  <div className="text-xl font-semibold text-gray-900">{totalBookings}</div>
                </div>
              </div>
            </div>
            <div className="h-24 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 p-4 ring-1 ring-indigo-200">
              <div className="flex h-full items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Completed</div>
                  <div className="text-xl font-semibold text-gray-900">{completedBookings}</div>
                </div>
              </div>
            </div>
            <div className="h-24 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 p-4 ring-1 ring-amber-200">
              <div className="flex h-full items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                  <Hourglass size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Pending</div>
                  <div className="text-xl font-semibold text-gray-900">{bookings.filter(b => b.status === 'PENDING').length}</div>
                </div>
              </div>
            </div>
            <div className="h-24 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 p-4 ring-1 ring-pink-200">
              <div className="flex h-full items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                  <Wallet size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Spent</div>
                  <div className="text-xl font-semibold text-pink-700">{formatCurrency(totalSpent)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking List */}
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-pink-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatus === 'ALL' ? 'No bookings yet' : `No ${selectedStatus.toLowerCase()} bookings`}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus === 'ALL' 
                  ? 'Start exploring makeup artists and book your first appointment!'
                  : `You don't have any ${selectedStatus.toLowerCase()} bookings at the moment.`
                }
              </p>
              {selectedStatus === 'ALL' && (
                <button className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]">
                  Browse Artists
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="rounded-2xl border border-pink-100 p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Service Image */}
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-pink-50 ring-1 ring-pink-100">
                        {booking.servicePackage.images?.[0] ? (
                          <img 
                            src={booking.servicePackage.images[0]} 
                            alt={booking.servicePackage.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Star size={20} className="text-pink-300" />
                        )}
                      </div>
                      
                      {/* Service Info */}
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium text-gray-900">
                          {booking.servicePackage.name}
                        </h3>
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                          <User size={14} />
                          <span>{booking.mua.fullName}</span>
                          {booking.mua.location && (
                            <>
                              <span>•</span>
                              <MapPin size={14} />
                              <span>{booking.mua.location}</span>
                            </>
                          )}
                        </div>
                        {/* Info chips */}
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                            <Calendar size={14} className="text-pink-600" />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                            <Clock size={14} className="text-pink-600" />
                            <span>{getTimeOfBooking(booking.bookingDate)}</span>
                          </div>
                          <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                            <MapPin size={14} className="text-pink-600" />
                            <span>{getLocationTypeLabel(booking.locationType)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(booking.status).color}`}>
                      {getStatusBadge(booking.status).label}
                    </span>
                  </div>
                  
                  {/* Price + Actions */}
                  <div className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-3">
                    {/* Price block wider (2/3) */}
                    <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-pink-50 to-white p-4 ring-1 ring-pink-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Service Price:</span>
                            <span className="font-medium">{formatCurrency(booking.servicePackage.price)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Transport Fee:</span>
                            <span className="font-medium">{booking.transportFee != null ? formatCurrency(booking.transportFee) : "0"}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{booking.servicePackage.duration} minutes</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold text-pink-700">{formatCurrency(booking.totalPrice)}</div>
                          <div className="text-xs text-gray-500">Total Amount</div>
                        </div>
                      </div>
                    </div>
                    {/* Actions column (right), stacked */}
                    <div className="flex w-full flex-col items-stretch gap-3">
                          <FeedbackActions booking={{ _id: booking._id, status: booking.status, feedbackId: (booking as any).feedbackId }} />
                      <button
                        type="button"
                        onClick={() => handleBookAgain(booking.mua._id, booking.servicePackage._id)}
                        disabled={booking.status !== 'COMPLETED'}
                        aria-disabled={booking.status !== 'COMPLETED'}
                        title={booking.status !== 'COMPLETED' ? 'Available after this booking is completed' : 'Book this service again'}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors
                          ${booking.status !== 'COMPLETED'
                            ? 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                            : 'border border-pink-200 bg-white text-pink-700 hover:bg-pink-50'}`}
                      >

                        <RefreshCcw size={16} /> Book Again
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingHistory;
