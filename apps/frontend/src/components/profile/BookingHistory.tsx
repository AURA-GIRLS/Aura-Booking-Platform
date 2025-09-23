"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, DollarSign, Filter, User, Star, ChevronDown } from "lucide-react";
import Notification from "@/components/generalUI/Notification";
import { authService } from "@/services/auth";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    { value: 'ALL', label: 'All Bookings', color: 'bg-gray-100 text-gray-800' },
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Booking History</h1>
              <p className="text-gray-600 text-sm mt-1">Track your past and upcoming appointments</p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Filter size={14} />
                {getStatusBadge(selectedStatus).label}
                <ChevronDown size={14} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedStatus(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                        selectedStatus === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${option.color}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{completedBookings}</div>
              <div className="text-sm text-gray-600">Completed Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-pink-600">{formatCurrency(totalSpent)}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
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
                <button className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 transition-colors">
                  Browse Artists
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {/* Service Image */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {booking.servicePackage.images?.[0] ? (
                          <img 
                            src={booking.servicePackage.images[0]} 
                            alt={booking.servicePackage.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Star size={20} className="text-gray-400" />
                        )}
                      </div>
                      
                      {/* Service Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {booking.servicePackage.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{getTimeOfBooking(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{getLocationTypeLabel(booking.locationType)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status).color}`}>
                      {getStatusBadge(booking.status).label}
                    </span>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Service Price:</span>
                          <span className="font-medium">{formatCurrency(booking.servicePackage.price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Transport Fee:</span>
                          <span className="font-medium">
                            {booking.transportFee != null ? formatCurrency(booking.transportFee) : "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{booking.servicePackage.duration} minutes</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                      </div>
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
