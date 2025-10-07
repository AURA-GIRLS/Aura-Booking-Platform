"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  RefreshCcw, 
  CheckCircle2, 
  Hourglass, 
  Wallet, 
  User, 
  Star,
  X 
} from "lucide-react";

import Notification from "@/components/generalUI/Notification";
import FeedbackActions from "@/components/feedback/FeedbackActions";
import DeleteConfirmDialog from "@/components/generalUI/DeleteConfirmDialog";
import { authService } from "@/services/auth";
import { BOOKING_STATUS, BookingStatus, TRANSACTION_STATUS } from "@/constants/index";
import { TransactionService } from "@/services/transaction";

// Types & Interfaces
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
  status: BookingStatus;
  totalPrice: number;
  transportFee?: number;
  locationType: 'HOME' | 'STUDIO' | 'VENUE';
  address?: string;
  createdAt: string;
  transaction?: {
    _id: string;
    status: string;
    amount: number;
  };
}

interface NotificationState {
  type: "success" | "error";
  message: string;
  isVisible: boolean;
}

// Constants
const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' }
];

const BookingHistory: React.FC = () => {
  const router = useRouter();

  // State Management
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [userStats, setUserStats] = useState<any>(null);
  const [notification, setNotification] = useState<NotificationState>({
    type: "success",
    message: "",
    isVisible: false
  });
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    bookingId: "",
    bookingName: ""
  });

  // Effects
  useEffect(() => {
    loadBookingHistory();
    loadUserStats();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedStatus]);

  // API Functions
  const loadBookingHistory = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getBookingHistory();
      if (response.success && response.data) {
        console.log('📊 Booking History Data:', response.data);
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

  // Helper Functions
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

  const handleBookAgain = (muaId: string, serviceId: string) => {
    if (!muaId || !serviceId) return;
    router.push(`/user/booking/${muaId}/${serviceId}`);
  };

  const handleCancelBooking = (bookingId: string, serviceName: string) => {
    setCancelDialog({
      open: true,
      bookingId,
      bookingName: serviceName
    });
  };

  const confirmCancelBooking = useCallback(async () => {
    try {
      console.log("Cancelling booking:", cancelDialog.bookingId);
      const response = await TransactionService.makeRefundBeforeConfirm(cancelDialog.bookingId, BOOKING_STATUS.CANCELLED);
      if (response.success) {
        showNotification("success", "Booking cancelled successfully");
        loadBookingHistory();
      } else {
        showNotification("error", response.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      showNotification("error", error?.message || "Failed to cancel booking");
    } finally {
      setCancelDialog(prev => ({ ...prev, open: false }));
      loadBookingHistory();
    }
  }, [cancelDialog.bookingId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find((option) => option.value === status);
    return statusConfig ?? STATUS_OPTIONS[0];
  };

  // Formatting Functions
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
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'HOME': return 'At Home';
      case 'STUDIO': return 'At Studio';
      case 'VENUE': return 'At Venue';
      default: return type;
    }
  };

  const canCancelBooking = (booking: BookingHistoryItem) => {
    // Only PENDING bookings can be cancelled
    if (booking.status !== BOOKING_STATUS.PENDING) return false;
    
    // Cannot cancel if refund is already being processed
    if (booking.transaction?.status === TRANSACTION_STATUS.PENDING_REFUND) return false;
    
    return true;
  };

  // Computed Values
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent = userStats ? userStats.totalSpent : 0;

  // Loading State Component
  const LoadingState = () => (
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

  // Empty State Component
  const EmptyState = () => (
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
        <button 
          type="button" 
          onClick={(e) => {
            //TODO
            e.preventDefault();
            e.stopPropagation();
            router.push('/');
          }}
          className="relative z-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          Browse Artists
        </button>
      )}
    </div>
  );

  // Booking Card Component
  const BookingCard = ({ 
    booking, 
    onBookAgain, 
    onCancelBooking,
    canCancelBooking,
    formatCurrency, 
    formatDate, 
    getTimeOfBooking, 
    getLocationTypeLabel, 
    getStatusBadge 
  }: {
    booking: BookingHistoryItem;
    onBookAgain: (muaId: string, serviceId: string) => void;
    onCancelBooking: (bookingId: string, serviceName: string) => void;
    canCancelBooking: (booking: BookingHistoryItem) => boolean;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
    getTimeOfBooking: (date: string) => string;
    getLocationTypeLabel: (type: string) => string;
    getStatusBadge: (status: string) => { value: string; label: string; color: string };
  }) => (
    <div className="rounded-2xl border border-pink-100 p-5 shadow-sm transition-shadow hover:shadow-md">
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
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(booking.status).color}`}>
            {getStatusBadge(booking.status).label}
          </span>
          {booking.transaction?.status === TRANSACTION_STATUS.PENDING_REFUND && (
            <span className="rounded-full px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Refund Processing
            </span>
          )}
        </div>
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
          
          {/* Cancel Button - only show for PENDING bookings */}
          {booking.status === BOOKING_STATUS.PENDING && (
            <>
              {canCancelBooking(booking) ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCancelBooking(booking._id, booking.servicePackage.name);
                  }}
                  className="relative z-30 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors border border-red-200 bg-white text-red-700 hover:bg-red-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X size={16} /> Cancel Booking
                </button>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  title="Refund is being processed"
                >
                  <Hourglass size={16} /> Processing Refund
                </button>
              )}
            </>
          )}
          
          {/* Book Again Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (booking.status !== BOOKING_STATUS.PENDING && 
                  booking.status !== BOOKING_STATUS.CONFIRMED && 
                  booking.status !== BOOKING_STATUS.REJECTED) {
                onBookAgain(booking.mua._id, booking.servicePackage._id);
              }
            }}
            disabled={booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.REJECTED}
            title={
              booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.REJECTED
                ? 'Available after this booking is completed or cancelled'
                : 'Book this service again'
            }
            className={`relative z-10 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors cursor-pointer
              ${booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.REJECTED
                ? 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                : 'border border-pink-200 bg-white text-pink-700 hover:bg-pink-50'}`}
            style={{ pointerEvents: 'auto' }}
          >
            <RefreshCcw size={16} /> Book Again
          </button>
        </div>
      </div>
    </div>
  );

  // Stats Cards Component
  const StatsCards = ({ 
    totalBookings, 
    completedBookings, 
    pendingBookings, 
    totalSpent, 
    formatCurrency 
  }: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    totalSpent: number;
    formatCurrency: (amount: number) => string;
  }) => (
    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
      {/* Total Bookings */}
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
      
      {/* Completed */}
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
      
      {/* Pending */}
      <div className="h-24 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 p-4 ring-1 ring-amber-200">
        <div className="flex h-full items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <Hourglass size={18} />
          </div>
          <div>
            <div className="text-xs text-gray-600">Pending</div>
            <div className="text-xl font-semibold text-gray-900">{pendingBookings}</div>
          </div>
        </div>
      </div>
      
      {/* Total Spent */}
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
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <DeleteConfirmDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog(prev => ({ ...prev, open }))}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        description={`Are you sure you want to cancel the booking for "${cancelDialog.bookingName}"? Your payment will be refunded, but this action cannot be undone.`}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
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
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStatus(option.value);
                  }}
                  className={`relative z-10 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                    selectedStatus === option.value
                      ? 'bg-white text-pink-700 shadow'
                      : 'text-pink-700/80 hover:bg-white/60'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <StatsCards 
            totalBookings={totalBookings}
            completedBookings={completedBookings}
            pendingBookings={bookings.filter(b => b.status === 'PENDING').length}
            totalSpent={totalSpent}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Booking List */}
        <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
          {filteredBookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onBookAgain={handleBookAgain}
                  onCancelBooking={handleCancelBooking}
                  canCancelBooking={canCancelBooking}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getTimeOfBooking={getTimeOfBooking}
                  getLocationTypeLabel={getLocationTypeLabel}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingHistory;
