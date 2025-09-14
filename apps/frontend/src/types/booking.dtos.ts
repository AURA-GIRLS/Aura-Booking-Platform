// Booking wizard step type (now includes initial service selection)
export type BookingStep = "service" | "datetime" | "location" | "review" | "checkout";
import { 
  type BookingStatus,
  type BookingType
} from "../constants/index";

// ===== BOOKING DTOs =====
export interface CreateBookingDTO {
  customerId: string;
  serviceId: string;
  muaId: string;
  bookingDate: Date;
  duration: number;
  locationType: BookingType;
  address: string;
  transportFee?: number;
  totalPrice: number;
  payed?: boolean;
  note?: string;
}

export interface UpdateBookingDTO {
  customerId?: string;
  serviceId?: string;
  muaId?: string;
  bookingDate?: Date;
  duration?: number;
  locationType?: BookingType;
  address?: string;
  status?: BookingStatus;
  transportFee?: number;
  totalPrice?: number;
  payed?: boolean;
  note?: string;
}

export interface BookingResponseDTO {
  _id?: string;
  customerId: string;
  artistId: string;
  serviceId: string;
  customerName: string;
  serviceName: string;
  bookingDate: string;
  servicePrice: number;
  startTime: string;
  endTime: string;
  duration: number;
  locationType: BookingType;
  address: string;
  status: BookingStatus;
  transportFee?: number;
  totalPrice: number;
  note?: string;
  payed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface BookingSlot {
  serviceId: string;
  day: string;
  startTime: string;
  endTime: string;
}
export interface PaginatedBookingsResponse {
  bookings: BookingResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
}
//========================SCHEDULE========================
export interface GetScheduleDTO {
  muaId: string;
  weekStart: string; // ISO date string for the start of the week (e.g., "2023-10-01")
}


export interface BookingDraftLite {
  serviceName?: string;
  servicePrice?: number;
  duration?: number;
  serviceDescription?: string;
  serviceImageUrl?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  locationType?: BookingType;
  address?: string;
  transportFee?: number;
  totalPrice?: number;
  payed?: boolean;
  note?: string;
}
export interface BookingDraft {
  muaId?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice?: number;
  duration?: number;
  bookingDate?: string; // ISO Date string (date part)
  startTime?: string;   // HH:mm
  endTime?: string;     // HH:mm
  address?: string;     // full address or "Studio"
  locationType?:BookingType;
  transportFee?: number;
  totalPrice?: number;
  note?: string;
  customerId?: string;
  customerName?: string;
  payed?: boolean;
}