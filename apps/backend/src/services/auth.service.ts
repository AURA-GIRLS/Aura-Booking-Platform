import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, type IUserDocument } from '../models/users.models';
import { EmailService } from './email.service';
import { config } from '../config';
import type { 
  CreateUserDTO, 
  LoginDTO, 
  AuthResponseDTO, 
  UserResponseDTO,
  SendEmailVerificationDTO,
  VerifyEmailDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO
} from '../types/user.dtos';
import { OAuth2Client } from 'google-auth-library';

export class AuthService {
  private emailService: EmailService;
  private client: OAuth2Client = new OAuth2Client(config.googleClientId);

  constructor() {
    this.emailService = new EmailService();
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  // Generate random token for email verification
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate random token for password reset
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register new user
  async register(userData: CreateUserDTO): Promise<AuthResponseDTO> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate email verification token
      const verificationToken = this.generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      
      // Create new user
      const user = new User({
        ...userData,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });

      await user.save();

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        verificationToken,
        user.fullName
      );

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user data without password
      return {
        user: this.formatUserResponse(user),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(loginData: LoginDTO): Promise<AuthResponseDTO> {
    try {
      // Find user by email
      const user = await User.findOne({ email: loginData.email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        throw new Error('Account is inactive');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user._id.toString());

      // Return user data without password
      return {
        user: this.formatUserResponse(user),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  //Google login
  async verifyGoogleToken(credential: string) {
  const ticket = await this.client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload; // chứa email, name, picture, sub (googleId), ...
}
  async loginWithGoogle(data: { credential: string }): Promise<AuthResponseDTO> {
    try {
      const payload = await this.verifyGoogleToken(data.credential);
      if (!payload || !payload.email) {
        throw new Error('Invalid Google token');
      }
      // Check if user already exists
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        // If not, create a new user  
        user = new User({
          fullName: payload.name || 'No Name',
          email: payload.email,
          avatarUrl: payload.picture,
          isEmailVerified: true,
          password: crypto.randomBytes(16).toString('hex'), // Random password
          role: 'USER',
          status: 'ACTIVE'
        });
        await user.save();
      }
      // Generate token
      const token = this.generateToken(user._id.toString());
      // Return user data without password
      return {
        user: this.formatUserResponse(user),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification(data: SendEmailVerificationDTO): Promise<void> {
    try {
      const user = await User.findOne({ email: data.email });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await user.save();

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        verificationToken,
        user.fullName
      );
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(data: VerifyEmailDTO): Promise<void> {
    try {
      const user = await User.findOne({
        emailVerificationToken: data.token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    try {
      const user = await User.findOne({ email: data.email });
      if (!user) {
        // Don't reveal if user exists or not for security
        return;
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Send reset email
      await this.emailService.sendPasswordReset(
        user.email,
        resetToken,
        user.fullName
      );
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    try {
      const user = await User.findOne({
        passwordResetToken: data.token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password
      user.password = data.newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Verify JWT token
  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Format user response (remove sensitive data)
  private formatUserResponse(user: IUserDocument): UserResponseDTO {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      role: user.role as any,
      status: user.status,
      createdAt: user.createdAt
    };
  }

  // Check if email is verified
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      return user ? user.isEmailVerified : false;
    } catch (error) {
      return false;
    }
  }

  // Resend verification email
  async resendVerificationEmail(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await user.save();

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        verificationToken,
        user.fullName
      );
    } catch (error) {
      throw error;
    }
  }
}
