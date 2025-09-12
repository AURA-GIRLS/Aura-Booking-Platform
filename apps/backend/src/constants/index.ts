// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ARTIST: 'ARTIST',
  ADMIN: 'ADMIN'
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
} as const;
// booking type
export const BOOKING_TYPES = {
  ONLINE: 'AT_HOME',
  OFFLINE: 'AT_STUDIO',
} as const;

// Portfolio Categories
export const PORTFOLIO_CATEGORIES = {
  BRIDAL: 'BRIDAL',
  PARTY: 'PARTY',
  PHOTOSHOOT: 'PHOTOSHOOT',
  CASUAL: 'CASUAL'
} as const;

// Service Categories for makeup occasions
export const SERVICE_CATEGORIES = {
  BRIDAL: 'BRIDAL',          
  PARTY: 'PARTY',             
  WEDDING_GUEST: 'WEDDING_GUEST', 
  GRADUATION: 'GRADUATION',    
  PROM: 'PROM',               
  DAILY: 'DAILY',             
  SPECIAL_EVENT: 'SPECIAL_EVENT' 
} as const;

//Media types
export const MEDIA_TYPES = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
} as const;

export const SLOT_TYPES = {
  ORIGINAL_WORKING: 'ORIGINAL_WORKING',
  OVERRIDE: 'OVERRIDE',
  BLOCKED: 'BLOCKED',
  NEW_WORKING: 'NEW_WORKING',
  BOOKING: 'BOOKING'
} as const;

// Type definitions derived from constants
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type BookingType = typeof BOOKING_TYPES[keyof typeof BOOKING_TYPES];
export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];
export type PortfolioCategory = typeof PORTFOLIO_CATEGORIES[keyof typeof PORTFOLIO_CATEGORIES];
export type ServiceCategory = typeof SERVICE_CATEGORIES[keyof typeof SERVICE_CATEGORIES];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type SlotType = typeof SLOT_TYPES[keyof typeof SLOT_TYPES];
