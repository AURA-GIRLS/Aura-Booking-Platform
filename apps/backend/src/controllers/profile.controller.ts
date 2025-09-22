import type { Request, Response } from 'express';
import type { ApiResponseDTO } from '../types/common.dtos';
import { uploadFile } from '../config/cloudinary';
import { unlink } from 'fs/promises';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class ProfileController {
  // POST /profile/avatar (multipart/form-data with field name: avatar)
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    let tempPath: string | undefined;
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        const response: ApiResponseDTO = {
          success: false,
          message: 'Unauthorized',
        };
        res.status(401).json(response);
        return;
      }

      const file = (req as any).file as { path: string } | undefined;
      if (!file) {
        const response: ApiResponseDTO = {
          status: 400,
          success: false,
          message: 'Missing file: please send multipart/form-data with key "avatar"',
        } as any;
        res.status(400).json(response);
        return;
      }

      tempPath = file.path;
      const result = await uploadFile(tempPath, 'image', { folder: 'avatars' });
      const avatarUrl = (result as any).secure_url || (result as any).url;

      const updatedUser = await authService.updateProfile(userId, { avatarUrl });

      const response: ApiResponseDTO = {
        status: 200,
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatarUrl, user: updatedUser },
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponseDTO = {
        status: 500,
        success: false,
        message: error?.message || 'Failed to upload avatar',
      };
      res.status(500).json(response);
    } finally {
      if (tempPath) {
        try { await unlink(tempPath); } catch {}
      }
    }
  }
}
