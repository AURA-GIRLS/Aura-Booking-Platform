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
  travelFee?: number;
  totalPrice: number;
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
  travelFee?: number;
  totalPrice?: number;
  note?: string;
}

export interface BookingResponseDTO {
  _id: string;
  customerId: string;
  artistId: string;
  serviceId: string;
  customerName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  locationType: BookingType;
  address: string;
  status: BookingStatus;
  travelFee?: number;
  totalPrice: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
