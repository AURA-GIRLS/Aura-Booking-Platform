export type UserRole = 'USER' | 'ARTIST' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
}

export interface ArtistProfile {
  _id: string;
  userId: string;
  bio?: string;
  portfolioUrls?: string[];
  city?: string;
  ratePerHour?: number;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  _id: string;
  userId: string;
  artistId: string;
  date: string;
  hours: number;
  address?: string;
  status: BookingStatus;
}


