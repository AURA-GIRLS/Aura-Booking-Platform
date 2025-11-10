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
import { useTranslate } from "@/i18n/hooks/useTranslate";

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

const BookingHistory: React.FC = () => {
  const { t, locale } = useTranslate('profile');
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

  // Constants
  const STATUS_OPTIONS = [
    { value: 'ALL', label: t('bookingHistory.all'), color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: t('bookingHistory.pending'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMED', label: t('bookingHistory.confirmed'), color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: t('bookingHistory.completed'), color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: t('bookingHistory.cancelled'), color: 'bg-red-100 text-red-800' },
    { value: 'REJECTED', label: t('bookingHistory.rejected'), color: 'bg-red-100 text-red-800' }
  ];

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
      showNotification("error", error.message || t('bookingHistory.loadBookingHistoryFailed'));
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
      showNotification("error", error.message || t('bookingHistory.loadUserStatsFailed'));
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
        showNotification("success", t('bookingHistory.bookingCancelled'));
        loadBookingHistory();
      } else {
        showNotification("error", response.message || t('bookingHistory.cancelBookingFailed'));
      }
    } catch (error: any) {
      showNotification("error", error?.message || t('bookingHistory.cancelBookingFailed'));
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
    const locale = 'en-US'; // Default to English for date formatting
    return new Date(dateString).toLocaleDateString(locale, {
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
      const locale = 'en-US'; // Default to English for time formatting
      return d.toLocaleTimeString(locale, {
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
      case 'HOME': return t('bookingHistory.atHome');
      case 'STUDIO': return t('bookingHistory.atStudio');
      case 'VENUE': return t('bookingHistory.atVenue');
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
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
    <div className="text-center py-8 sm:py-12">
      <Calendar size={48} className="mx-auto mb-4 text-pink-300" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {selectedStatus === 'ALL' ? t('bookingHistory.noBookingsYet') : t('bookingHistory.noStatusBookings').replace('{status}', selectedStatus.toLowerCase())}
      </h3>
      <p className="text-gray-600 mb-6 px-4">
        {selectedStatus === 'ALL' 
          ? t('bookingHistory.noBookingsDescription')
          : t('bookingHistory.noStatusBookingsDescription').replace('{status}', selectedStatus.toLowerCase())
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
          {t('bookingHistory.browseArtists')}
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
    <div className="rounded-2xl border border-pink-100 p-3 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 w-full">
          {/* Service Image */}
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-pink-50 ring-1 ring-pink-100 flex-shrink-0">
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
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 font-medium text-gray-900 truncate">
              {booking.servicePackage.name}
            </h3>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <User size={14} />
              <span className="truncate">{booking.mua.fullName}</span>
              {booking.mua.location && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <MapPin size={14} className="hidden sm:inline" />
                  <span className="hidden sm:inline truncate">{booking.mua.location}</span>
                </>
              )}
            </div>
            {/* Info chips */}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                <Calendar size={14} className="text-pink-600 flex-shrink-0" />
                <span className="truncate">{formatDate(booking.bookingDate)}</span>
              </div>
              <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                <Clock size={14} className="text-pink-600 flex-shrink-0" />
                <span className="truncate">{getTimeOfBooking(booking.bookingDate)}</span>
              </div>
              <div className="inline-flex h-9 items-center gap-2 rounded-full bg-pink-50 px-3 text-sm text-gray-700 ring-1 ring-pink-100">
                <MapPin size={14} className="text-pink-600 flex-shrink-0" />
                <span className="truncate">{getLocationTypeLabel(booking.locationType)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(booking.status).color}`}>
            {getStatusBadge(booking.status).label}
          </span>
          {booking.transaction?.status === TRANSACTION_STATUS.PENDING_REFUND && (
            <span className="rounded-full px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
              {t('bookingHistory.refundProcessing')}
            </span>
          )}
        </div>
      </div>
      
      {/* Price + Actions */}
      <div className="mt-4 space-y-4">
        {/* Price block */}
        <div className="rounded-2xl bg-gradient-to-r from-pink-50 to-white p-4 ring-1 ring-pink-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('bookingHistory.servicePrice')}</span>
                <span className="font-medium">{formatCurrency(booking.servicePackage.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('bookingHistory.transportFee')}</span>
                <span className="font-medium">{booking.transportFee != null ? formatCurrency(booking.transportFee) : "0"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('bookingHistory.duration')}</span>
                <span className="font-medium">{booking.servicePackage.duration} {t('bookingHistory.minutes')}</span>
              </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <div className="text-xl font-semibold text-pink-700">{formatCurrency(booking.totalPrice)}</div>
              <div className="text-xs text-gray-500">{t('bookingHistory.totalAmount')}</div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
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
                  className="relative z-30 inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors border border-red-200 bg-white text-red-700 hover:bg-red-50 cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X size={16} /> {t('bookingHistory.cancelBooking')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  title={t('bookingHistory.processingRefund')}
                >
                  <Hourglass size={16} /> {t('bookingHistory.processingRefund')}
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
            className={`relative inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors cursor-pointer
              ${booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.REJECTED
                ? 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                : 'border border-pink-200 bg-white text-pink-700 hover:bg-pink-50'}`}
            style={{ 
              pointerEvents: 'auto',
              zIndex: 2, 
              position: 'relative'
            }}
          >
            <RefreshCcw size={16} /> {t('bookingHistory.bookAgain')}
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
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
      {/* Total Bookings */}
      <div className="h-24 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 p-3 sm:p-4 ring-1 ring-green-200">
        <div className="flex h-full items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-600 truncate">{t('bookingHistory.totalBookings')}</div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{totalBookings}</div>
          </div>
        </div>
      </div>
      
      {/* Completed */}
      <div className="h-24 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 p-3 sm:p-4 ring-1 ring-indigo-200">
        <div className="flex h-full items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-600 truncate">{t('bookingHistory.completedBookings')}</div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{completedBookings}</div>
          </div>
        </div>
      </div>
      
      {/* Pending */}
      <div className="h-24 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 sm:p-4 ring-1 ring-amber-200">
        <div className="flex h-full items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm flex-shrink-0">
            <Hourglass size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-600 truncate">{t('bookingHistory.pendingBookings')}</div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{pendingBookings}</div>
          </div>
        </div>
      </div>
      
      {/* Total Spent */}
      <div className="h-24 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 p-3 sm:p-4 ring-1 ring-pink-200 sm:col-span-1 md:col-span-1">
        <div className="flex h-full items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm flex-shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-600 truncate">{t('bookingHistory.totalSpent')}</div>
            <div className="text-lg sm:text-xl font-semibold text-pink-700 truncate">{formatCurrency(totalSpent)}</div>
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
        title={t('bookingHistory.cancelBookingTitle')}
        description={t('bookingHistory.cancelBookingDescription').replace('{bookingName}', cancelDialog.bookingName)}
        confirmText={t('bookingHistory.cancelBookingConfirm')}
        cancelText={t('bookingHistory.keepBooking')}
      />
      
      <div className="space-y-6">
        {/* Header + Tabs */}
        <div className="rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50 to-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t('bookingHistory.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('bookingHistory.subtitle')}</p>
          </div>

          {/* Tabs */}
          <div className="mt-2">
            <div className="flex w-full gap-2 overflow-x-auto rounded-xl bg-pink-100/60 p-1 scrollbar-hide">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedStatus(option.value);
                  }}
                  className={`relative z-10 whitespace-nowrap rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer flex-shrink-0 ${
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
        <div className="rounded-2xl border border-pink-100 bg-white p-4 sm:p-6 shadow-sm">
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
