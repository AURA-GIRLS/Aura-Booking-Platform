import { 
  BOOKING_STATUS,
  type BookingStatus
} from "../constants/index";

// ===== BOOKING DTOs =====
export interface CreateBookingDTO {
  userId: string;
  artistId: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string;
  notes?: string;
}

export interface UpdateBookingDTO {
  date?: Date;
  startTime?: string;
  endTime?: string;
  address?: string;
  status?: BookingStatus;
  notes?: string;
}

export interface BookingResponseDTO {
  _id: string;
  userId: string;
  artistId: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string;
  status: BookingStatus;
  notes?: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}
