import { 
  type UserRole
} from "../constants/index";

// ===== EMAIL VERIFICATION & PASSWORD RESET DTOs =====
export interface VerifyEmailDTO {
  token: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

// ===== EMAIL VERIFICATION DTO =====
export interface SendEmailVerificationDTO {
  email: string;
}

// ===== USER DTOs =====

export interface CreateUserDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
// Google login DTO
export interface GoogleLoginDTO {
	credential: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponseDTO {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: UserRole;
  status: string;
  createdAt: Date;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}

// ===== ARTIST DTOs =====
export interface CreateArtistDTO {
  userId: string;
  bio?: string;
  city?: string;
  ratePerHour?: number;
  specialties?: string[];
  experience?: number;
}

export interface UpdateArtistDTO {
  bio?: string;
  city?: string;
  ratePerHour?: number;
  specialties?: string[];
  experience?: number;
  isAvailable?: boolean;
}

export interface ArtistResponseDTO {
  _id: string;
  userId: string;
  bio?: string;
  city?: string;
  ratePerHour?: number;
  specialties?: string[];
  experience?: number;
  isAvailable?: boolean;
  createdAt: Date;
  updatedAt: Date;
}


