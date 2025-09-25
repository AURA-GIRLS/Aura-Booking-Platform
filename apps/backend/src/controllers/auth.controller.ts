import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import type { 
  CreateUserDTO, 
  LoginDTO, 
  SendEmailVerificationDTO,
  VerifyEmailDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  CreateMuaDTO
} from '../types/user.dtos';
import type { ApiResponseDTO } from '../types/common.dtos';
import { config } from 'config';
import { getCookieDomain } from 'utils/auth.utils';

const authService = new AuthService();

export class AuthController {
  // Helper method để tạo và set refresh token cookie
  private setRefreshTokenCookie(res: Response, userId: string): void {
    const refreshToken = authService.createRefreshToken(userId);
    console.log("is production:", config.isProduction);
    console.log("client origin:", config.clientOrigin);
    console.log("cookie domain:", getCookieDomain());
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
      ...(config.isProduction && { 
        domain: getCookieDomain() // Chỉ định domain cookie trong production
      })
    });
  }
  // Register new user
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      
      // Validate required fields
      if (!userData.fullName || !userData.email || !userData.password) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Full name, email and password are required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.register(userData);

      // Set refresh token cookie
      this.setRefreshTokenCookie(res, result.user._id);
      
      const response: ApiResponseDTO = {
        status: 201,
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: result
      };
      
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 400,
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
      res.status(400).json(response);
    }
  }
  async registerAsMua(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateMuaDTO = req.body;

      // Validate required fields
      if (!userData.fullName || !userData.email || !userData.password) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Full name, email and password are required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.registerAsMua(userData);

      // Set refresh token cookie
      this.setRefreshTokenCookie(res, result.user._id);

      const response: ApiResponseDTO = {
        status: 201,
        success: true,
        message: 'MUA registered successfully. Please check your email to verify your account.',
        data: result
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 400,
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      };
      res.status(400).json(response);
    }
  }

      
  // Login user
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginDTO = req.body;
      
      // Validate required fields
      if (!loginData.email || !loginData.password) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Email and password are required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.login(loginData);
      
      // Set refresh token cookie
      this.setRefreshTokenCookie(res, result.user._id);

      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Login successful',
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 401,
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      };
      res.status(401).json(response);
    }
  }

  // POST /auth/google-login
async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const credential: string = req.body.credential;
      
      // Validate required fields
      if (!credential) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Google credential is required'
        };
        res.status(400).json(response);
        return;
      }

      const result = await authService.loginWithGoogle({ credential });

      // Set refresh token cookie
      this.setRefreshTokenCookie(res, result.user._id);

      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Login Google successful',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 401,
        success: false,
        message: error instanceof Error ? error.message : 'Login Google failed'
      };
      res.status(401).json(response);
    }
  }

  // Send email verification
  async sendEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      const data: SendEmailVerificationDTO = req.body;
      
      if (!data.email) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      await authService.sendEmailVerification(data);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'Verification email sent successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send verification email'
      };
      res.status(400).json(response);
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const data: VerifyEmailDTO = req.body;
      
      if (!data.token) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Verification token is required'
        };
        res.status(400).json(response);
        return;
      }

      await authService.verifyEmail(data);
      
      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Email verified successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed'
      };
      res.status(400).json(response);
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const data: ForgotPasswordDTO = req.body;
      
      if (!data.email) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Email is required'
        };
        res.status(400).json(response);
        return;
      }

      await authService.forgotPassword(data);
      
      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Password reset email sent successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 400,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
      res.status(400).json(response);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const data: ResetPasswordDTO = req.body;
      
      if (!data.token || !data.newPassword) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Token and new password are required'
        };
        res.status(400).json(response);
        return;
      }

      if (data.newPassword.length < 6) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Password must be at least 6 characters long'
        };
        res.status(400).json(response);
        return;
      }

      await authService.resetPassword(data);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'Password reset successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      };
      res.status(400).json(response);
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getUserById(userId);
      
      const response: ApiResponseDTO = {
        success: true,
        data: {
          _id: user?._id.toString(),
          fullName: user?.fullName,
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          avatarUrl: user?.avatarUrl,
          role: user?.role,
          status: user?.status,
          isEmailVerified: user?.isEmailVerified,
          createdAt: user?.createdAt
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get profile'
      };
      res.status(500).json(response);
    }
  }

  // Resend verification email (for authenticated users)
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      await authService.resendVerificationEmail(userId);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'Verification email sent successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send verification email'
      };
      res.status(400).json(response);
    }
  }

  // Check email verification status
  async checkEmailVerification(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const isVerified = await authService.isEmailVerified(userId);
      
      const response: ApiResponseDTO = {
        success: true,
        data: { isEmailVerified: isVerified }
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check email verification status'
      };
      res.status(500).json(response);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const updateData = req.body;
      
      // Validate input data
      if (updateData.fullName && (updateData.fullName.length < 2 || updateData.fullName.length > 50)) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Full name must be between 2 and 50 characters'
        };
        res.status(400).json(response);
        return;
      }

      if (updateData.phoneNumber && !/^[\+]?[0-9][\d]{0,10}$/.test(updateData.phoneNumber)) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Please enter a valid phone number'
        };
        res.status(400).json(response);
        return;
      }

      const updatedUser = await authService.updateProfile(userId, updateData);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile'
      };
      res.status(500).json(response);
    }
  }

  // Get user booking history
  async getBookingHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const { status } = req.query;
      const bookings = await authService.getBookingHistory(userId, status as string);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'Booking history retrieved successfully',
        data: bookings
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve booking history'
      };
      res.status(500).json(response);
    }
  }

  // Get user statistics (total spent, booking counts, etc.)
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const stats = await authService.getUserStats(userId);
      
      const response: ApiResponseDTO = {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve user statistics'
      };
      res.status(500).json(response);
    }
  }

  // Refresh access token
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const refreshToken = (req as any).cookies?.refreshToken || req.body?.refreshToken || bearerToken;

      if (!refreshToken) {
        const response: ApiResponseDTO = {
          status: 401,
          success: false,
          message: 'Refresh token is required'
        };
        res.status(401).json(response);
        return;
      }

      const payload = authService.verifyRefreshToken(refreshToken);
      const newAccessToken = authService.createAccessToken(payload.userId);

      // Set new refresh token cookie (token rotation)
      this.setRefreshTokenCookie(res, payload.userId);

      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Token refreshed successfully',
        data: { token: newAccessToken }
      };
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponseDTO = {
        status: 401,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to refresh token'
      };
      res.status(401).json(response);
    }
  }
}
